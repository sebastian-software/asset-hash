import { createHash } from "crypto"
import { createReadStream } from "fs"
import { extname } from "path"
import BigInt from "big.js"
import HashThrough from "hash-through"
import { MetroHash64, MetroHash128 } from "metrohash"
import { default as XXHash32, XXHash64 } from "xxhash"

const DEFAULT_HASH = "xxhash32"
const DEFAULT_ENCODING = "base52"
const DEFAULT_MAX_LENGTH = 8

const XXHASH_CONSTRUCT = 0xcafebabe

const baseEncodeTables = {
  26: "abcdefghijklmnopqrstuvwxyz",
  32: "123456789abcdefghjkmnpqrstuvwxyz", // no 0lio
  36: "0123456789abcdefghijklmnopqrstuvwxyz",
  49: "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no lIO
  52: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  58: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no 0lIO
  62: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  64: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
}

export function baseEncode(buffer, base) {
  const baseNum = typeof base === "number" ? base : (/[0-9]+/).exec(base)[0]
  const encodeTable = baseEncodeTables[baseNum]
  if (!encodeTable) {
    throw new Error(`Unknown base encoding ${base}!`)
  }

  const readLength = buffer.length

  BigInt.DP = 0
  BigInt.RM = 0

  let current = new BigInt(0)
  for (let i = readLength - 1; i >= 0; i--) {
    current = current.times(256).plus(buffer[i])
  }

  let output = ""
  while (current.gt(0)) {
    output = encodeTable[current.mod(baseNum)] + output
    current = current.div(baseNum)
  }

  BigInt.DP = 20
  BigInt.RM = 1

  return output
}

function computeDigest(buffer, { encoding, maxLength } = {}) {
  let output = ""

  if (encoding === "hex" || encoding === "base64" || encoding === "utf8") {
    output = buffer.toString(encoding)
  } else {
    output = baseEncode(buffer, encoding)
  }

  return maxLength == null || output.length <= maxLength ?
    output :
    output.slice(0, maxLength)
}

export class Hasher {
  constructor(options = {}) {
    this._hasher = createHasher(options.hash || DEFAULT_HASH)
    this._encoding = options.encoding || DEFAULT_ENCODING
    this._maxLength = options.maxLength || DEFAULT_MAX_LENGTH
  }

  update(data) {
    const buffer =
      data instanceof Buffer ? data : Buffer.from(data.toString(), "utf-8")
    return this._hasher.update(buffer)
  }

  digest(encoding, maxLength) {
    return computeDigest(this._hasher.digest("buffer"), {
      encoding: encoding || this._encoding,
      maxLength: maxLength || this._maxLength
    })
  }
}

export function createHasher(hash) {
  let hasher

  if (hash === "xxhash32") {
    hasher = new XXHash32(XXHASH_CONSTRUCT)
  }

  else if (hash === "xxhash64") {
    hasher = new XXHash64(XXHASH_CONSTRUCT)
  }

  else if (hash === "metrohash64") {
    hasher = new MetroHash64()
  }

  else if (hash === "metrohash128") {
    hasher = new MetroHash128()
  }

  else {
    hasher = createHash(hash)
  }

  return hasher
}

export function createStreamingHasher(hash) {
  return HashThrough(() => createHasher(hash))
}

// eslint-disable-next-line max-params
export function getHash(
  fileName,
  {
    hash = DEFAULT_HASH,
    encoding = DEFAULT_ENCODING,
    maxLength = DEFAULT_MAX_LENGTH
  } = {}
) {
  return new Promise((resolve, reject) => {
    try {
      const hasher = createStreamingHasher(hash)

      createReadStream(fileName)
        .pipe(hasher)
        .on("finish", () => {
          try {
            const digest = computeDigest(hasher.digest("buffer"), { encoding, maxLength })
            resolve(digest)
          } catch (error) {
            reject(error)
          }
        })
    } catch (error) {
      reject(error)
    }
  })
}

export async function getHashedName(fileName, options) {
  const hashed = await getHash(fileName, options)
  const extension = extname(fileName)

  return hashed + extension
}
