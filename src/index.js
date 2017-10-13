import { Stream } from "xxhash"
import { createReadStream } from "fs"
// import Big from "big.js"

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

function encodeBufferToBase(buffer, base) {
  const encodeTable = baseEncodeTables[base]
  if (!encodeTable) throw new Error(`Unknown encoding base${base}`)

  const readLength = buffer.length

  const Big = require("big.js")
  Big.RM = Big.DP = 0
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

  return output
}

function getHashDigest(buffer, hashType, digestType, maxLength) {
  hashType = hashType || "md5"
  maxLength = maxLength || 9999
  const hash = require("crypto").createHash(hashType)
  hash.update(buffer)
  if (
    digestType === "base26" ||
    digestType === "base32" ||
    digestType === "base36" ||
    digestType === "base49" ||
    digestType === "base52" ||
    digestType === "base58" ||
    digestType === "base62" ||
    digestType === "base64"
  ) {
    return encodeBufferToBase(hash.digest(), digestType.substr(4)).substr(0, maxLength)
  } else {
    return hash.digest(digestType || "hex").substr(0, maxLength)
  }
}

export default function hashFile(fileName, hashType) {
  var hasher = new Stream(0xcafebabe, "buffer")

  return new Promise((resolve, reject) => {
    try {
      createReadStream(fileName)
        .pipe(hasher)
        .on("finish", () => {
          resolve(encodeBufferToBase(hasher.read()))
        })
    } catch (err) {
      reject(err)
    }
  })
}

hashFile("src/index.js").then((result) => {
  console.log("RESULT:", result)
})
