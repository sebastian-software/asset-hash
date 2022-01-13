import { Hash as CryptoHash, createHash } from "crypto"
import { createReadStream } from "fs"
import { extname } from "path"

import BigInt from "big.js"
import { createBLAKE3, createXXHash128, createXXHash3, createXXHash64 } from "hash-wasm"

const DEFAULT_ALGORITHM = "xxhash3"
const DEFAULT_ENCODING = "base52"
const DEFAULT_MAX_LENGTH = 8

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
  algorithm?: string
}

export interface Hash {
  // Update.
  update(input: string | Buffer): Hash

  // Finalize and get hash digest.
  digest(): string | Buffer

  // Initialize
  init?(): Hash
}

const BYTE_SIZE = 256
export function baseEncode(buffer: Buffer, base: string | number): string {
  const baseNum =
    typeof base === "number" ? base : parseInt((/\d+/).exec(base)[0], 10)
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
    const buffer =
      typeof bufferOrString === "string"
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
  private algorithm: string
  private encoding: string
  private maxLength: number

  constructor(options: HashOptions = {}) {
    this.algorithm = options.algorithm ?? DEFAULT_ALGORITHM
    this.encoding = String(options.encoding ?? DEFAULT_ENCODING)
    this.maxLength = options.maxLength ?? null
  }

  async init() {
    this.hasher = await createHasher(this.algorithm)
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
 * Make Node.js crypto hash signature compatible to Hash
 */
function cryptoBuiltinEnvelope(hash: CryptoHash): Hash {
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
export async function createHasher(hash: string): Promise<Hash> {
  let hasher: Hash

  if (hash === "xxhash128") {
    hasher = await createXXHash128()
    hasher.init()
  } else if (hash === "xxhash64") {
    hasher = await createXXHash64()
    hasher.init()
  } else if (hash === "xxhash3") {
    hasher = await createXXHash3()
    hasher.init()
  } else if (hash === "blake3") {
    hasher = await createBLAKE3()
    hasher.init()
  } else if (hash === "metrohash64") {
    hasher = new (require("metrohash")).MetroHash64()
  } else if (hash === "metrohash128") {
    hasher = new (require("metrohash")).MetroHash128()
  } else {
    hasher = cryptoBuiltinEnvelope(createHash(hash))
  }

  return hasher
}

/**
 * Get hash from file
 *
 * @param fileName Filename of file to hash
 */
export function getHash(
  fileName: string,
  options?: HashOptions
): Promise<string> {
  const { algorithm, encoding, maxLength } = options || {}
  return new Promise(async (resolve, reject) => {
    try {
      const hasher = await createHasher(algorithm || DEFAULT_ALGORITHM)

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
export async function getHashedName(
  fileName: string,
  options?: HashOptions
): Promise<string> {
  const hashed = await getHash(fileName, options)
  const extension = extname(fileName)

  return hashed + extension
}
