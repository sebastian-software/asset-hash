import xxhash from "xxhash-wasm"
import { Hash as CryptoHash, createHash } from "crypto"

export type DigestResult = string | number | bigint | BigInt | Buffer
export type HashAlgorithm = "xxhash32" | "xxhash64" | "md5" | "sha1" | "sha256" | "sha512"

export interface Hash {
  // Update.
  update(input: string | Buffer): Hash

  // Finalize and get hash digest.
  digest(): DigestResult

  // Initialize
  init?(): Hash
}

/**
 * Make Node.js crypto hash signature compatible to Hash
 */
export function cryptoBuiltinEnvelope(hash: CryptoHash): Hash {
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
export async function createHasher(algorithm: HashAlgorithm): Promise<Hash> {
  let hasher: Hash

  if (algorithm === "xxhash32" || algorithm === "xxhash64") {
    const { create32, create64 } = await xxhash()
    hasher = algorithm === "xxhash32" ? create32() : create64()
  } else {
    hasher = cryptoBuiltinEnvelope(createHash(algorithm))
  }

  return hasher
}
