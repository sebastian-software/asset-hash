import { createReadStream } from "fs"
import { extname } from "path"

import { DigestOptions, SupportedEncoding, computeDigest } from "./encode"
import { Hash, HashAlgorithm, initHashClasses, createHasher } from "./hash"

const NODE_MAJOR_VERSION = parseInt(process.versions.node.split('.')[0], 10);
const NODE_SUPPORTS_BIGINT_SINCE = 16

const DEFAULT_ALGORITHM = NODE_MAJOR_VERSION < NODE_SUPPORTS_BIGINT_SINCE ? "farmhash64" : "xxhash64"
const DEFAULT_ENCODING = "base52"
const DEFAULT_MAX_LENGTH = 8

export type HashOptions = DigestOptions & {
  algorithm?: HashAlgorithm
}

export class Hasher {
  private hasher: Hash
  private algorithm: HashAlgorithm = DEFAULT_ALGORITHM
  private encoding: SupportedEncoding = DEFAULT_ENCODING
  private maxLength = Infinity

  constructor(options: HashOptions = {}) {
    if (options.algorithm) {
      this.algorithm = options.algorithm
    }

    if (options.encoding) {
      this.encoding = options.encoding
    }

    if (options.maxLength) {
      this.maxLength = options.maxLength
    }

    this.hasher = createHasher(this.algorithm)
  }

  update(data: string | Buffer): Hasher {
    const buffer =
      data instanceof Buffer ? data : Buffer.from(data.toString(), "utf-8")

    this.hasher.update(buffer)
    return this
  }

  digest(encoding?: SupportedEncoding, maxLength?: number): string {
    return computeDigest(this.hasher.digest(), {
      encoding: encoding || this.encoding,
      maxLength: maxLength || this.maxLength
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
      await initHashClasses()
      const hasher = createHasher(algorithm || DEFAULT_ALGORITHM)

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

            digest
              ? resolve(digest)
              : reject(new Error("Unexpected error while generating digest!"))
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

export { initHashClasses }
