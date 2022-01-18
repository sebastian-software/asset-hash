import { createReadStream } from "fs"
import { extname } from "path"

import { computeDigest, DigestOptions, SupportedEncoding } from "./encode"
import { createHasher, Hash, HashAlgorithm } from "./hash"

const DEFAULT_ALGORITHM = "xxhash64"
const DEFAULT_ENCODING = "base52"
const DEFAULT_MAX_LENGTH = 8

export type HashOptions = DigestOptions & {
  algorithm?: HashAlgorithm
}

export class Hasher {
  private hasher: Hash
  private algorithm: HashAlgorithm
  private encoding: SupportedEncoding
  private maxLength: number

  constructor(options: HashOptions = {}) {
    this.algorithm = options.algorithm ?? DEFAULT_ALGORITHM
    this.encoding = options.encoding ?? DEFAULT_ENCODING
    this.maxLength = options.maxLength ?? Infinity
  }

  async init() {
    this.hasher = await createHasher(this.algorithm)
  }

  update(data: string | Buffer): Hash {
    const buffer =
      data instanceof Buffer ? data : Buffer.from(data.toString(), "utf-8")

    return this.hasher.update(buffer)
  }

  digest(encoding?: SupportedEncoding, maxLength?: number): string {
    return computeDigest(this.hasher.digest(), {
      encoding: encoding ?? this.encoding,
      maxLength: maxLength ?? this.maxLength
    })
  }
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

            digest ? resolve(digest) : reject(new Error("Unexpected error while generating digest!"))
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

export { initHashClasses } from "./hash"
