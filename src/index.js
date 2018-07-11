import { createHash } from "crypto"
import { createReadStream } from "fs"
import { extname } from "path"
import BigInt from "big.js"
import { Stream, default as XXHash } from "xxhash"

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

export function encodeBufferToBase(buffer, base, max) {
  const encodeTable = baseEncodeTables[base]
  if (!encodeTable) {
    throw new Error(`Unknown encoding base${base}`)
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
    output = encodeTable[current.mod(base)] + output
    current = current.div(base)
  }

  BigInt.DP = 20
  BigInt.RM = 1

  return max == null ? output : output.slice(0, max)
}

export class Hasher {
  constructor(hash = "xxhash", base = 52, max = 10) {
    this._hash = hash
    this._base = base
    this._max = max

    this._hasher = getHasher(hash)
  }

  update(data) {
    const buffer = data instanceof Buffer ? data : Buffer.from(data.toString(), "utf-8")
    return this._hasher.update(buffer)
  }

  digest() {
    return getDigest(this._hasher.digest("buffer"), {
      base: this._base,
      max: this._max
    })
  }
}

export function getHasher(hash) {
  /* eslint-disable no-magic-numbers */
  return hash === "xxhash" ? new XXHash(0xcafebabe) : createHash(hash)
}

export function getStreamingHasher(hash) {
  /* eslint-disable no-magic-numbers */
  return hash === "xxhash" ? new Stream(0xcafebabe, "buffer") : createHash(hash)
}

export function getDigest(data, { base, max }) {
  return encodeBufferToBase(data, base, max)
}

// eslint-disable-next-line max-params
export function getHash(fileName, hash = "xxhash", base = 52, max = 10) {
  return new Promise((resolve, reject) => {
    try {
      const hasher = getStreamingHasher(hash)

      createReadStream(fileName)
        .pipe(hasher)
        .on("finish", () => {
          try {
            resolve(getDigest(hasher.read(), { base, max }))
          } catch (error) {
            reject(error)
          }
        })
    } catch (err) {
      reject(err)
    }
  })
}

export async function getHashedName(
  fileName,
  hash = "xxhash",
  base = 52,
  max = 10
) {
  const hashed = await getHash(fileName)
  const ext = extname(fileName)

  return hashed + ext
}
