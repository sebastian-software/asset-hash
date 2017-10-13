import hashFile from "./index"

test("Encode text", async () => {
  const hash = await hashFile("./src/fixtures/text.md")
  expect(hash).toMatchSnapshot()
})

test("Encode WOFF", async () => {
  const hash = await hashFile("./src/fixtures/font.woff")
  expect(hash).toMatchSnapshot()
})

test("Encode PNG", async () => {
  const hash = await hashFile("./src/fixtures/image.png")
  expect(hash).toMatchSnapshot()
})


test("Encode text - SHA256", async () => {
  const hash = await hashFile("./src/fixtures/text.md", "sha256")
  expect(hash).toMatchSnapshot()
})

test("Encode WOFF - SHA256", async () => {
  const hash = await hashFile("./src/fixtures/font.woff", "sha256")
  expect(hash).toMatchSnapshot()
})

test("Encode PNG - SHA256", async () => {
  const hash = await hashFile("./src/fixtures/image.png", "sha256")
  expect(hash).toMatchSnapshot()
})
