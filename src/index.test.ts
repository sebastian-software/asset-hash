/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable jest/no-standalone-expect */

// eslint-disable-next-line shopify-lean/no-ancestor-directory-import
import { Hasher, getHash, getHashedName, initHashClasses, DEFAULT_ALGORITHM } from "."

const testString =
  "A stream constructor that takes in the seed to use. "
  + "Write data to the stream and when the stream ends."


const safeTest = DEFAULT_ALGORITHM === "xxhash64" ? test : test.skip

beforeAll(async () => {
  await initHashClasses()
})

safeTest("Encode text", async () => {
  const hash = await getHash("./src/fixtures/text.md")
  expect(hash).toMatchSnapshot()
})

safeTest("Encode WOFF", async () => {
  const hash = await getHash("./src/fixtures/font.woff")
  expect(hash).toMatchSnapshot()
})

safeTest("Encode PNG", async () => {
  const hash = await getHash("./src/fixtures/image.png")
  expect(hash).toMatchSnapshot()
})

safeTest("Encode text - Base26", async () => {
  const hash = await getHash("./src/fixtures/text.md", { encoding: "base26" })
  expect(hash).toMatchSnapshot()
})

safeTest("Encode WOFF - Base26 (alternative)", async () => {
  const hash = await getHash("./src/fixtures/font.woff", { encoding: "base26" })
  expect(hash).toMatchSnapshot()
})

safeTest("Encode PNG - Base26", async () => {
  const hash = await getHash("./src/fixtures/image.png", { encoding: "base26" })
  expect(hash).toMatchSnapshot()
})

test("Encode text - SHA256", async () => {
  const hash = await getHash("./src/fixtures/text.md", { algorithm: "sha256" })
  expect(hash).toMatchSnapshot()
})

test("Encode WOFF - SHA256", async () => {
  const hash = await getHash("./src/fixtures/font.woff", {
    algorithm: "sha256"
  })
  expect(hash).toMatchSnapshot()
})

test("Encode PNG - SHA256", async () => {
  const hash = await getHash("./src/fixtures/image.png", {
    algorithm: "sha256"
  })
  expect(hash).toMatchSnapshot()
})

test("Encode text - Farmhash", async () => {
  const hash = await getHash("./src/fixtures/text.md", {
    algorithm: "farmhash64"
  })
  expect(hash).toMatchSnapshot()
})

test("Encode WOFF - Farmhash", async () => {
  const hash = await getHash("./src/fixtures/font.woff", {
    algorithm: "farmhash64"
  })
  expect(hash).toMatchSnapshot()
})

test("Encode PNG - Farmhash", async () => {
  const hash = await getHash("./src/fixtures/image.png", {
    algorithm: "farmhash64"
  })
  expect(hash).toMatchSnapshot()
})

safeTest("FileName text", async () => {
  const hash = await getHashedName("./src/fixtures/text.md")
  expect(hash).toMatchSnapshot()
})

safeTest("FileName WOFF", async () => {
  const hash = await getHashedName("./src/fixtures/font.woff")
  expect(hash).toMatchSnapshot()
})

safeTest("FileName PNG", async () => {
  const hash = await getHashedName("./src/fixtures/image.png")
  expect(hash).toMatchSnapshot()
})

safeTest("Class: Defaults", () => {
  const hasher = new Hasher()
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: SHA256", () => {
  const hasher = new Hasher({ algorithm: "sha256" })
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

safeTest("Class: Defaults - Base64", () => {
  const hasher = new Hasher({ encoding: "base64" })
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: SHA256 - Base64", () => {
  const hasher = new Hasher({ algorithm: "sha256", encoding: "base64" })
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

safeTest("Class: Defaults - Hex", () => {
  const hasher = new Hasher({ encoding: "hex" })
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: SHA256 - Hex", () => {
  const hasher = new Hasher({ algorithm: "sha256", encoding: "hex" })
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})
