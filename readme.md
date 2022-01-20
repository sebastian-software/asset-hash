# _Asset Hash_

[![Sponsored by][sponsor-img]][sponsor] [![Version][npm-version-img]][npm] [![M1 Ready][apple-img]][m1] [![WASM Powered][wasm-img]][wasm]
<br/>
[![Downloads][npm-downloads-img]][npm] [![Build Status][github-img]][github]

_Asset Hash_ is a quick wrapper around hashing libraries for efficient and fast hashing of asset files like images, web fonts, etc. By default it uses the cross-platform performance-optimized [XXHash-WASM](https://github.com/jungomi/xxhash-wasm) and a _Base52_ encoding (`[a-zA-Z]`) which works well for file names and urls and has a larger dictionary than when using traditional hex.

[sponsor]: https://www.sebastian-software.de
[m1]: https://en.wikipedia.org/wiki/Apple_M1
[wasm]: https://en.wikipedia.org/wiki/WebAssembly
[npm]: https://www.npmjs.com/package/asset-hash
[github]: https://github-ci.org/sebastian-software/asset-hash
[sponsor-img]: https://badgen.net/badge/Sponsored%20by/Sebastian%20Software/c41e54
[apple-img]: https://badgen.net/badge/M1/Ready/cyan?icon=apple
[wasm-img]: https://badgen.net/badge/WASM/Powered/654ff0
[npm-downloads-img]: https://badgen.net/npm/dm/asset-hash
[npm-version-img]: https://badgen.net/npm/v/asset-hash
[github-img]: https://badgen.net/github/status/sebastian-software/asset-hash?label=tests&icon=github

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

**Table of Contents**

- [Installation](#installation)
  - [NPM](#npm)
  - [Yarn](#yarn)
- [Speed](#speed)
- [Usage](#usage)
  - [`getHash()`](#gethash)
  - [`getHashedName()`](#gethashedname)
  - [Class `Hasher`](#class-hasher)
  - [Webpack Example Config](#webpack-example-config)
- [License](#license)
- [Copyright](#copyright)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

### NPM

```console
$ npm install asset-hash
```

### Yarn

```console
$ yarn add asset-hash
```

## Speed

For speed comparisons of different algorithms we created a small repository containing the source code and some results. [Check it out](https://github.com/sebastian-software/node-hash-comparison). TLDR: Modern non-cryptographic hashing could be way faster than traditional solutions like MD5 or SHA1. Best algorithms right now for our use cases seems to be XXHash (WASM) and Farmhash. This is why we integrated both while making the WASM powered XXHash the default for improved developer experience.

## Usage

There are two main methods: `getHash(filePath, options)` and `getHashedName(filePath, options)` and a more traditional class `Hasher(options)`. Both methods return a Promise with there actual hash or hash file name as a result. The class offers the pretty traditional methods `update(data)` and `digest(options)` to send data or to retrieve the hash.

Options:

- `algorithm`: Any valid hashing algorithm e.g. `xxhash64` (default), `xxhash32`, `farmhash32`, `farmhash64`, `sha1`, `md5`, ...
- `encoding`: Any valid encoding for built-in digests `hex`, `base64`, `base62`, ...
- `maxLength`: Maximum length of returned digest. Keep in mind that this increases collision probability.

Please note:

- `farmhash32` and `farmhash64` do not support streaming. When using the file hashing APIs it's collecting all data first before producing the hash. This might result in higher memory usage!

### `getHash()`

```js
import { getHash } from "asset-hash"
...

const hash = await getHash("./src/fixtures/font.woff")
console.log("Hash:", hash) => "Hash: fXQovA"
```

### `getHashedName()`

The hashed file name replaces the name part of the file with the hash while keeping the file extension.

```js
import { getHashedName } from "asset-hash"
...

const hashedName = await getHashedName("./src/fixtures/font.woff")
console.log("Hashed Filename:", hashedName) => "Hashed Filename: fXQovA.woff"
```

### Class `Hasher`

```js
import { Hasher } from "asset-hash"
const hasher = new Hasher()
hasher.update(data)
console.log("Hashed Data:", hasher.digest()) => "Hashed Data: XDOPW"
```

### Webpack Example Config

You can use the powerful hashing of AssetHash [inside Webpack as well](https://webpack.js.org/configuration/output/#outputhashfunction). This leads to a) better performance and b) shorter hashes. Wo correctly support the WASM-based hashes your [Webpack configuration should be created using an async function](https://webpack.js.org/configuration/configuration-types/#exporting-a-promise).

Here is an example configuration:

```js
import { Hasher, initHashClasses } from "asset-hash"

module.exports = async () => {
  await initHashClasses()

  return {
    ...
    output: {
      hashFunction: Hasher,
      hashDigest: "base52",
      hashDigestLength: 8
    }
    ...
  }
}
```

## License

[Apache License; Version 2.0, January 2004](http://www.apache.org/licenses/LICENSE-2.0)

## Copyright

<img src="https://cdn.rawgit.com/sebastian-software/sebastian-software-brand/0d4ec9d6/sebastiansoftware-en.svg" alt="Logo of Sebastian Software GmbH, Mainz, Germany" width="460" height="160"/>

Copyright 2017-2022<br/>[Sebastian Software GmbH](http://www.sebastian-software.de)
