/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

// eslint-disable-next-line shopify-lean/no-ancestor-directory-import
import { Hasher, getHash, getHashedName } from "."

const testString =
  "A stream constructor that takes in the seed to use. "
  + "Write data to the stream and when the stream ends."

test("Encode text", async () => {
  const hash = await getHash("./src/fixtures/text.md")
  expect(hash).toMatchSnapshot()
})

test("Encode WOFF", async () => {
  const hash = await getHash("./src/fixtures/font.woff")
  expect(hash).toMatchSnapshot()
})

test("Encode PNG", async () => {
  const hash = await getHash("./src/fixtures/image.png")
  expect(hash).toMatchSnapshot()
})

test("Encode PNG with null options", async () => {
  const hash = await getHash("./src/fixtures/image.png", null)
  expect(hash).toMatchSnapshot()
})

test("Encode text - Base26", async () => {
  const hash = await getHash("./src/fixtures/text.md", { encoding: 26 })
  expect(hash).toMatchSnapshot()
})

test("Encode WOFF - Base26 (alternative)", async () => {
  const hash = await getHash("./src/fixtures/font.woff", { encoding: "base26" })
  expect(hash).toMatchSnapshot()
})

test("Encode PNG - Base26", async () => {
  const hash = await getHash("./src/fixtures/image.png", { encoding: 26 })
  expect(hash).toMatchSnapshot()
})

test("Encode text - SHA256", async () => {
  const hash = await getHash("./src/fixtures/text.md", { algorithm: "sha256" })
  expect(hash).toMatchSnapshot()
})

test("Encode WOFF - SHA256", async () => {
  const hash = await getHash("./src/fixtures/font.woff", { algorithm: "sha256" })
  expect(hash).toMatchSnapshot()
})

test("Encode PNG - SHA256", async () => {
  const hash = await getHash("./src/fixtures/image.png", { algorithm: "sha256" })
  expect(hash).toMatchSnapshot()
})

test("Encode text - Blake3", async () => {
  const hash = await getHash("./src/fixtures/text.md", { algorithm: "blake3" })
  expect(hash).toMatchSnapshot()
})

test("Encode WOFF - Blake3", async () => {
  const hash = await getHash("./src/fixtures/font.woff", { algorithm: "blake3" })
  expect(hash).toMatchSnapshot()
})

test("Encode PNG - Blake3", async () => {
  const hash = await getHash("./src/fixtures/image.png", { algorithm: "blake3" })
  expect(hash).toMatchSnapshot()
})

test("FileName text", async () => {
  const hash = await getHashedName("./src/fixtures/text.md")
  expect(hash).toMatchSnapshot()
})

test("FileName WOFF", async () => {
  const hash = await getHashedName("./src/fixtures/font.woff")
  expect(hash).toMatchSnapshot()
})

test("FileName PNG", async () => {
  const hash = await getHashedName("./src/fixtures/image.png")
  expect(hash).toMatchSnapshot()
})

test("Encode text - with invalid hash crashes", async () => {
  let errorMessage

  try {
    await getHash("./src/fixtures/text.md", { algorithm: "other" })
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    errorMessage = error.message
  }

  expect(errorMessage).toMatchSnapshot()
})

test("Class: Defaults", async () => {
  const hasher = new Hasher()
  await hasher.init()
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: SHA256", async() => {
  const hasher = new Hasher({ algorithm: "sha256" })
  await hasher.init()
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: Defaults - Base64", async() => {
  const hasher = new Hasher({ encoding: "base64" })
  await hasher.init()
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: SHA256 - Base64", async() => {
  const hasher = new Hasher({ algorithm: "sha256", encoding: "base64" })
  await hasher.init()
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: Defaults - Hex", async() => {
  const hasher = new Hasher({ encoding: "hex" })
  await hasher.init()
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: SHA256 - Hex", async() => {
  const hasher = new Hasher({ algorithm: "sha256", encoding: "hex" })
  await hasher.init()
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})
