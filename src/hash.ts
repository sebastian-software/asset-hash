import { Hash as BuiltinCryptoHash, createHash } from "crypto"

import xxhash from "xxhash-wasm"
import {
  fingerprint32 as farmHash32,
  fingerprint64 as farmHash64
} from "farmhash"

export type DigestResult = number | bigint | Buffer
export type HashAlgorithm =
  | "xxhash32"
  | "xxhash64"
  | "farmhash32"
  | "farmhash64"
  | "md5"
  | "sha1"
  | "sha256"
  | "sha512"

type XXHashLib = Awaited<ReturnType<typeof xxhash>>
let xxHashInstance: XXHashLib | undefined
let hasherReady = false

export async function initHashClasses() {
  if (hasherReady) {
    return
  }

  xxHashInstance = await xxhash()
  hasherReady = true
}

export interface Hash {
  // Update.
  update(input: string | Buffer): Hash

  // Finalize and get hash digest.
  digest(): DigestResult
}

/**
 * Make Node.js crypto hash signature compatible to Hash
 */
function cryptoEnvelope(hash: BuiltinCryptoHash): Hash {
  const envelopeHash: Hash = {
    update: (input) => {
      hash.update(input)
      return envelopeHash
    },
    digest: () => hash.digest()
  }

  return envelopeHash
}

function farmhashEnvelope(hash: typeof farmHash32 | typeof farmHash64): Hash {
  const data: Buffer[] = []
  const envelopeHash: Hash = {
    update: (input: Buffer) => {
      data.push(input)
      return envelopeHash
    },
    digest: () => {
      const stringOrNumber = hash(Buffer.concat(data))
      return BigInt(stringOrNumber)
    }
  }

  return envelopeHash
}

/**
 * Creates hasher instance
 */
export function createHasher(algorithm: HashAlgorithm): Hash {
  if (!hasherReady) {
    throw new Error(
      "Hasher was not correctly initialized. Call `await initHashClasses()` first."
    )
  }

  let hasher

  if (algorithm === "xxhash32" || algorithm === "xxhash64") {
    if (!xxHashInstance) {
      throw new Error("Invalid xxhash WASM instance!")
    }

    hasher =
      algorithm === "xxhash32"
        ? xxHashInstance.create32()
        : xxHashInstance.create64()
  } else if (algorithm === "farmhash32" || algorithm === "farmhash64") {
    hasher = farmhashEnvelope(
      algorithm === "farmhash32" ? farmHash32 : farmHash64
    )
  } else {
    hasher = cryptoEnvelope(createHash(algorithm))
  }

  return hasher
}
