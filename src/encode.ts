import { DigestResult } from "./hash";

/**
 * @param uint32Array Treated as a long base-0x100000000 number, little endian
 * @param divisor The divisor
 * @return Modulo (remainder) of the division
 */
 function divmod32(uint32Array: Uint32Array, divisor:number): number{
  let carry = 0;
  for (let i = uint32Array.length - 1; i >= 0; i--) {
    const value = carry * 0x100000000 + uint32Array[i];
    carry = value % divisor;
    uint32Array[i] = Math.floor(value / divisor);
  }
  return carry;
}

export function encodeBufferToBase(buffer, base, length) {
  const encodeTable = baseEncodeTables[base];

  if (!encodeTable) {
    throw new Error("Unknown encoding base" + base);
  }

  // Input bits are only enough to generate this many characters
  const limit = Math.ceil((buffer.length * 8) / Math.log2(base));
  length = Math.min(length, limit);

  // Most of the crypto digests (if not all) has length a multiple of 4 bytes.
  // Fewer numbers in the array means faster math.
  const uint32Array = new Uint32Array(Math.ceil(buffer.length / 4));

  // Make sure the input buffer data is copied and is not mutated by reference.
  // divmod32() would corrupt the BulkUpdateDecorator cache otherwise.
  buffer.copy(Buffer.from(uint32Array.buffer));

  let output = "";

  for (let i = 0; i < length; i++) {
    output = encodeTable[divmod32(uint32Array, base)] + output;
  }

  return output;
}

export const baseEncodeTables: Record<number, string> = {
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

export type SupportedEncoding = "base26" | "base32" | "base36" | "base49" | "base52" | "base58" | "base62" | "base64" | "hex" | "ascii"

export interface DigestOptions {
  encoding?: SupportedEncoding
  maxLength?: number
}

export function computeDigest(
  rawDigest: DigestResult,
  options: DigestOptions = {}
) {
  let output = ""
  const { encoding, maxLength } = options

  // Fast-path for number => hex
  if (typeof rawDigest === "number" && encoding === "hex") {
    output = rawDigest.toString(16)
  } else {
    const buffer = rawDigest instanceof Buffer ? rawDigest : Buffer.from(rawDigest.toString())

    if (
      encoding === "base26" ||
      encoding === "base32" ||
      encoding === "base36" ||
      encoding === "base49" ||
      encoding === "base52" ||
      encoding === "base58" ||
      encoding === "base62"
    ) {
      return encodeBufferToBase(buffer, encoding.slice(4), maxLength);
    } else {
      return buffer.toString(encoding).slice(0, maxLength);
    }
  }
}
