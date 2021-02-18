import { Hash as CryptoHash, createHash } from "crypto"
import { createReadStream } from "fs"
import { extname } from "path"

import BigInt from "big.js"
import { MetroHash128, MetroHash64 } from "metrohash"

// optional xxhash module
let xxhash = null

try {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, import/no-unresolved
  xxhash = require("xxhash")
} catch {
  // We don't care about import issues as this is an optional dependency.
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const XXHash32 = xxhash ? xxhash : null
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
const XXHash64 = xxhash ? xxhash.XXHash64 : null

const DEFAULT_HASH = "metrohash128"
const DEFAULT_ENCODING = "base52"
const DEFAULT_MAX_LENGTH = 8

const XXHASH_CONSTRUCT = 0xcafebabe

const baseEncodeTables: Record<number, string> = {
  26: "abcdefghijklmnopqrstuvwxyz",
  32: "123456789abcdefghjkmnpqrstuvwxyz", // no 0lio
  36: "0123456789abcdefghijklmnopqrstuvwxyz",
  49: "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no lIO
  52: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  58: "123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ", // no 0lIO
  62: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"

  // Note: `base64` is implemented using native NodeJS APIs.
  // 64: "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ-_"
}

interface DigestOptions {
  encoding?: string | number
  maxLength?: number
}
export type HashOptions = DigestOptions & {
  hash?: string
}
export interface Hash {
  // Update.
  update(input: string | Buffer): Hash

  // Finalize and get hash digest.
  digest(): string | Buffer
}

const BYTE_SIZE = 256
export function baseEncode(buffer: Buffer, base: string | number): string {
  const baseNum = typeof base === "number" ? base : parseInt((/\d+/).exec(base)[0], 10)
  const encodeTable = baseEncodeTables[baseNum]
  if (!encodeTable) {
    throw new Error(`Unknown base encoding ${base}!`)
  }

  const length = buffer.length

  BigInt.DP = 0
  BigInt.RM = 0

  let current = new BigInt(0)

  for (let i = length - 1; i >= 0; i--) {
    current = current.times(BYTE_SIZE).plus(buffer[i])
  }

  let output = ""

  while (current.gt(0)) {
    output = `${encodeTable[current.mod(baseNum).toNumber()]}${output}`
    current = current.div(baseNum)
  }

  BigInt.DP = 20
  BigInt.RM = 1

  return output
}

function computeDigest(
  bufferOrString: Buffer | string,
  { encoding, maxLength }: DigestOptions = {}
) {
  let output = ""

  if (typeof bufferOrString === "string" && encoding === "hex") {
    output = bufferOrString
  } else {
    const buffer = typeof bufferOrString === "string"
      ? Buffer.from(bufferOrString, "hex")
      : bufferOrString

    if (encoding === "hex" || encoding === "base64" || encoding === "utf8") {
      output = buffer.toString(encoding)
    } else {
      output = baseEncode(buffer, encoding)
    }
  }

  return maxLength == null || output.length <= maxLength
    ? output
    : output.slice(0, maxLength)
}

export class Hasher {
  private hasher: Hash
  private encoding: string
  private maxLength: number

  constructor(options: HashOptions = {}) {
    this.hasher = createHasher(options.hash ?? DEFAULT_HASH)
    this.encoding = String(options.encoding ?? DEFAULT_ENCODING)
    this.maxLength = options.maxLength ?? null
  }

  update(data: string | Buffer): Hash {
    const buffer =
      data instanceof Buffer ? data : Buffer.from(data.toString(), "utf-8")

    return this.hasher.update(buffer)
  }

  digest(encoding?: string, maxLength?: number): string {
    return computeDigest(this.hasher.digest(), {
      encoding: encoding ?? this.encoding,
      maxLength: maxLength ?? this.maxLength
    })
  }
}

/**
 * Make xxhash signature compatible to Hash
 */
function xxhashEnvelope(xxhash): Hash {
  return {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
    update: (input) => xxhash.update(input),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    digest: () => xxhash.digest("buffer")
  }
}

/**
 * Make Node.js crypto hash signature compatible to Hash
 */
function cryptoEnvelope(hash: CryptoHash): Hash {
  const envelopeHash: Hash = {
    update: (input) => {
      hash.update(input)
      return envelopeHash
    },
    digest: () => hash.digest()
  }

  return envelopeHash
}

/**
 * Creates hasher instance
 */
export function createHasher(hash: string): Hash {
  let hasher: Hash

  if (hash === "xxhash32") {
    if (!XXHash32) {
      throw new Error("Install xxhash module to use xxhash32 hasher")
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    hasher = xxhashEnvelope(new XXHash32(XXHASH_CONSTRUCT))
  } else if (hash === "xxhash64") {
    if (!XXHash64) {
      throw new Error("Install xxhash module to use xxhash64 hasher")
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    hasher = xxhashEnvelope(new XXHash64(XXHASH_CONSTRUCT))
  } else if (hash === "metrohash64") {
    hasher = new MetroHash64()
  } else if (hash === "metrohash128") {
    hasher = new MetroHash128()
  } else {
    hasher = cryptoEnvelope(createHash(hash))
  }

  return hasher
}

/**
 * Get hash from file
 *
 * @param fileName Filename of file to hash
 */
export function getHash(fileName: string, options?: HashOptions): Promise<string> {
  const { hash, encoding, maxLength } = options || {}
  return new Promise((resolve, reject) => {
    try {
      const hasher = createHasher(hash || DEFAULT_HASH)

      createReadStream(fileName)
        .on("data", (data) => {
          hasher.update(data)
        })
        .on("error", (error) => {
          reject(error)
        })
        .on("end", () => {
          try {
            const digest = computeDigest(hasher.digest(), {
              encoding: encoding || DEFAULT_ENCODING,
              maxLength: maxLength || DEFAULT_MAX_LENGTH
            })

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

/**
 * Get new filename based upon hash and extension of file
 *
 * @param fileName Filename of file to hash
 */
export async function getHashedName(fileName: string, options?: HashOptions): Promise<string> {
  const hashed = await getHash(fileName, options)
  const extension = extname(fileName)

  return hashed + extension
}
