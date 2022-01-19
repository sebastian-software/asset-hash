import { baseEncoder } from "./encode"

test("Base Encoding - BigInt", () => {
  const value = 19283939293947483838392n

  expect(baseEncoder.base58.encode(value)).toBe("eiLDTeDmr14X7")
  expect(baseEncoder.base58.decode("eiLDTeDmr14X7")).toBe(value)

  expect(baseEncoder.base52.encode(value)).toBe("XrvZImdBhxNai")
  expect(baseEncoder.base52.decode("XrvZImdBhxNai")).toBe(value)

  expect(baseEncoder.base36.encode(value)).toBe("351qbvyphq5xby0")
  expect(baseEncoder.base36.decode("351qbvyphq5xby0")).toBe(value)

  expect(baseEncoder.base26.encode(value)).toBe("lmyekfhbkrkpiaai")
  expect(baseEncoder.base26.decode("lmyekfhbkrkpiaai")).toBe(value)

  // Via: https://www.darklaunch.com/base58-encode-and-decode-using-php-with-example-base58-encode-base58-decode.html
  // For cross-checking
  expect(baseEncoder.base58.encode(3429289555n)).toBe("6e31iZ")
  expect(baseEncoder.base58.decode("7qDo")).toBe(1253576n)
})
