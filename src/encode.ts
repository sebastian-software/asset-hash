import { DigestResult } from "./hash";

export function baseEncodeFactory(charset: string) {
  const radix = BigInt(charset.length)

  const decode = (str: string): bigint => {
    let result = BigInt(0)

    for (const chr of str) {
      const index = BigInt(charset.indexOf(chr))
      result = radix * result + index
    }

    return result
  }

  const encode = (number: bigint | BigInt, maxLength = Infinity): string => {
    let result = ""
    let convertedNumber = typeof number === "bigint" ? number : typeof number === "number" ? BigInt(number) : BigInt(number.toString())

    while (convertedNumber > 0) {
      const mod = convertedNumber % radix
      result = charset[Number(mod)] + result
      convertedNumber = (convertedNumber - mod) / radix

      if (result.length === maxLength) {
        return result;
      }
    }

    return result || `0`
  }

  return { decode, encode }
}

export const baseEncoder = {
  base26: baseEncodeFactory("abcdefghijklmnopqrstuvwxyz"),
  base32: baseEncodeFactory("123456789abcdefghjkmnpqrstuvwxyz"), // no 0lio
  base36: baseEncodeFactory("0123456789abcdefghijklmnopqrstuvwxyz"),
  base49: baseEncodeFactory("abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"), // no lIO
  base52: baseEncodeFactory("abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"),
  base58: baseEncodeFactory("123456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ"), // no 0lIO
  base62: baseEncodeFactory("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ")
}

export type SupportedEncoding = "base26" | "base32" | "base36" | "base49" | "base52" | "base58" | "base62" | "base64" | "hex" | "ascii"

export interface DigestOptions {
  encoding?: SupportedEncoding
  maxLength?: number
}

export function computeDigest(
  rawDigest: DigestResult,
  options: DigestOptions = {}
): string {
  let output = null
  const { encoding, maxLength } = options

  const rawIsNumber = typeof rawDigest === "number" || typeof rawDigest === "bigint"
  const rawIsBuffer = rawDigest instanceof Buffer

  // Fast-path for number => hex
  if (rawIsNumber && encoding === "hex") {
    output = rawDigest.toString(16)
  } else {
    if (
      encoding === "base26" ||
      encoding === "base32" ||
      encoding === "base36" ||
      encoding === "base49" ||
      encoding === "base52" ||
      encoding === "base58" ||
      encoding === "base62"
    ) {
      const valueAsBigInt = rawDigest instanceof Buffer ? BigInt("0x" + rawDigest.toString("hex")) : rawDigest
      return baseEncoder[encoding].encode(valueAsBigInt, maxLength)
    } else {
      const valueAsBuffer = rawIsBuffer ? rawDigest : Buffer.from(rawDigest.toString())
      output = valueAsBuffer.toString(encoding)
    }
  }

  return maxLength != null ? output.slice(0, maxLength) : output
}
