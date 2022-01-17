import { Hash as CryptoHash, createHash } from "crypto"
import { createReadStream } from "fs"
import { extname } from "path"

import xxhash from "xxhash-wasm"
import { baseX } from "./basex"

const DEFAULT_ALGORITHM = "xxhash64"
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

// Local copy as importing from base-x failed
interface BaseConverter {
  encode(buffer: Buffer | number[] | Uint8Array): string;
  decodeUnsafe(string: string): Buffer | undefined;
  decode(string: string): Buffer;
}

const baseEncoder: Record<number, BaseConverter> = {}
 Object.keys(baseEncodeTables).forEach((baseLength) => {
  baseEncoder[baseLength] = baseEncoder[`base${baseLength}`] = baseX(baseEncodeTables[baseLength])
})

interface DigestOptions {
  encoding?: string | number
  maxLength?: number
}

export type HashOptions = DigestOptions & {
  algorithm?: string
}

export type DigestResult = string | number | bigint | BigInt | Buffer

export interface Hash {
  // Update.
  update(input: string | Buffer): Hash

  // Finalize and get hash digest.
  digest(): DigestResult

  // Initialize
  init?(): Hash
}

function computeDigest(
  rawDigest: DigestResult,
  options: DigestOptions = {}
) {
  let output = ""
  const { encoding, maxLength } = options

  // Fast-path for number => hex
  if (typeof rawDigest === "number" && (encoding === "hex" || encoding === 16)) {
    output = rawDigest.toString(16)
  } else {
    const buffer = rawDigest instanceof Buffer ? rawDigest : Buffer.from(rawDigest.toString())

    // Prefer built-in encoding support for Buffer class
    if (encoding === "hex" || encoding === "base64" || encoding === "utf8" || encoding === "ascii") {
      output = buffer.toString(encoding)
    } else {
      // Otherwise choose our own base encoder to support base52, base58, etc.
      const encoder = baseEncoder[encoding]
      if (!encoder) {
        throw new Error("Unsupported encoding: " + encoding);
      }
      output = encoder(buffer)
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
export async function createHasher(algorithm = DEFAULT_ALGORITHM): Promise<Hash> {
  let hasher: Hash

  if (algorithm === "xxhash32" || algorithm === "xxhash64") {
    const { create32, create64 } = await xxhash()
    hasher = algorithm === "xxhash32" ? create32() : create64()
  } else {
    hasher = cryptoBuiltinEnvelope(createHash(algorithm))
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
      const hasher = await createHasher(algorithm)

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
