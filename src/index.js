import { Stream } from "xxhash"
import { createReadStream } from "fs"
import Big from "big.js"
import { createHash } from "crypto"
import { extname } from "path"

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

  Big.DP = 0
  Big.RM = 0

  let b = new Big(0)
  for (let i = readLength - 1; i >= 0; i--) {
    b = b.times(256).plus(buffer[i])
  }

  let output = ""
  while (b.gt(0)) {
    output = encodeTable[b.mod(base)] + output
    b = b.div(base)
  }

  Big.DP = 20
  Big.RM = 1

  return max == null ? output : output.slice(0, max)
}

export function getHash(
  fileName,
  hash = "xxhash",
  base = 52,
  max = 10
) {
  return new Promise((resolve, reject) => {
    try {
      var hasher = hash === "xxhash" ?
        new Stream(0xcafebabe, "buffer") : createHash(hash)

      createReadStream(fileName)
        .pipe(hasher)
        .on("finish", () => {
          resolve(encodeBufferToBase(hasher.read(), base, max))
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
