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
  const hash = await getHash("./src/fixtures/text.md", { hash: "sha256" })
  expect(hash).toMatchSnapshot()
})

test("Encode WOFF - SHA256", async () => {
  const hash = await getHash("./src/fixtures/font.woff", { hash: "sha256" })
  expect(hash).toMatchSnapshot()
})

test("Encode PNG - SHA256", async () => {
  const hash = await getHash("./src/fixtures/image.png", { hash: "sha256" })
  expect(hash).toMatchSnapshot()
})

test.skip("Encode text - XXHash64", async () => {
  const hash = await getHash("./src/fixtures/text.md", { hash: "xxhash64" })
  expect(hash).toMatchSnapshot()
})

test.skip("Encode WOFF - XXHash64", async () => {
  const hash = await getHash("./src/fixtures/font.woff", { hash: "xxhash64" })
  expect(hash).toMatchSnapshot()
})

test.skip("Encode PNG - XXHash64", async () => {
  const hash = await getHash("./src/fixtures/image.png", { hash: "xxhash64" })
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
  try {
    await getHash("./src/fixtures/text.md", { hash: "other" })
  } catch (error) {
    expect(error.message).toMatchSnapshot()
  }
})

test("Encode text - with invalid encoding crashes", async () => {
  try {
    await getHash("./src/fixtures/text.md", { encoding: "base51" })
  } catch (error) {
    expect(error.message).toMatchSnapshot()
  }
})

test("Class: Defaults", () => {
  const hasher = new Hasher()
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: SHA256", () => {
  const hasher = new Hasher({ hash: "sha256" })
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: Defaults - Base64", () => {
  const hasher = new Hasher({ encoding: "base64" })
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: SHA256 - Base64", () => {
  const hasher = new Hasher({ hash: "sha256", encoding: "base64" })
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: Defaults - Hex", () => {
  const hasher = new Hasher({ encoding: "hex" })
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})

test("Class: SHA256 - Hex", () => {
  const hasher = new Hasher({ hash: "sha256", encoding: "hex" })
  hasher.update(testString)
  expect(hasher.digest()).toMatchSnapshot()
})
