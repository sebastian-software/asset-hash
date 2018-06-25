import { getHash, getHashedName } from "./index"

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

test("Encode text - SHA256", async () => {
  const hash = await getHash("./src/fixtures/text.md", "sha256")
  expect(hash).toMatchSnapshot()
})

test("Encode WOFF - SHA256", async () => {
  const hash = await getHash("./src/fixtures/font.woff", "sha256")
  expect(hash).toMatchSnapshot()
})

test("Encode PNG - SHA256", async () => {
  const hash = await getHash("./src/fixtures/image.png", "sha256")
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

test("Encode text - with invalid base crashes", () => {
  expect(getHash("./src/fixtures/text.md", undefined, 51)).rejects.toThrow()
})
