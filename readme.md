# _Asset Hash_ <br/>[![Sponsored by][sponsor-img]][sponsor] [![Version][npm-version-img]][npm] [![Downloads][npm-downloads-img]][npm] [![Build Status Unix][travis-img]][travis] [![Build Status Windows][appveyor-img]][appveyor] [![Dependencies][deps-img]][deps]

_Asset Hash_ is a quick wrapper around hashing libraries for efficient and fast hashing of asset files like images, web fonts, etc. By default it uses the performance-optimized [xxhash](https://github.com/Cyan4973/xxHash) algorithm.

[sponsor-img]: https://img.shields.io/badge/Sponsored%20by-Sebastian%20Software-692446.svg
[sponsor]: https://www.sebastian-software.de
[deps]: https://david-dm.org/sebastian-software/asset-hash
[deps-img]: https://david-dm.org/sebastian-software/asset-hash.svg
[npm]: https://www.npmjs.com/package/asset-hash
[npm-downloads-img]: https://img.shields.io/npm/dm/asset-hash.svg
[npm-version-img]: https://img.shields.io/npm/v/asset-hash.svg
[travis-img]: https://img.shields.io/travis/sebastian-software/asset-hash/master.svg?branch=master&label=unix%20build
[appveyor-img]: https://img.shields.io/appveyor/ci/swernerx/asset-hash/master.svg?label=windows%20build
[travis]: https://travis-ci.org/sebastian-software/asset-hash
[appveyor]: https://ci.appveyor.com/project/swernerx/asset-hash/branch/master

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

For speed comparisons of different algorithms we created a small repository containing the source code and some results. [Check it out](https://github.com/sebastian-software/node-hash-comparison). TLDR: Modern non-cryptographic hashing could be way faster than cryptographic solutions like MD5 or SHA1. Best algorithm right now for our use cases seems to be MetroHash128. This is why we made it the default.


## Usage

There are two main methods: `getHash(filePath, options)` and `getHashedName(filePath, options)` and a more traditional class `Hasher(options)`. Both methods return a Promise with there actual hash or hash file name as a result. The class offers the pretty traditional methods `update(data)` and `digest(options)` to send data or to retrieve the hash.

Options:

- `encoding`: Any valid encoding for built-in digests `hex`, `base64`, `base62`, ...
- `maxLength`: Maximum length of returned digest. Keep in mind that this increases collison probability.


### `getHash()`

```js
import { getHash } from "asset-hash"
getHash("./src/fixtures/font.woff").then((hash) => {
  console.log("Hash:", hash) => "Hash: fXQovA"
})
```

### `getHashedName()`

The hashed file name replaces the name part of the file with the hash while keeping the file extension.

```js
import { getHashedName } from "asset-hash"
getHashedName("./src/fixtures/font.woff").then((hashedName) => {
  console.log("Hashed Filename:", hashedName) => "Hashed Filename: fXQovA.woff"
})
```

### `Hasher()`

The class is e.g. useful in e.g. [`output.hashFunction` in Webpack](https://webpack.js.org/configuration/output/#output-hashfunction)

```js
import { Hasher } from "asset-hash"
const hasher = new Hasher()
hasher.update(data)
console.log("Hashed Data:", hasher.digest()) => "Hashed Data: XDOPW"
```

## License

[Apache License; Version 2.0, January 2004](http://www.apache.org/licenses/LICENSE-2.0)

## Copyright

<img src="https://cdn.rawgit.com/sebastian-software/sebastian-software-brand/3d93746f/sebastiansoftware-en.svg" alt="Sebastian Software GmbH Logo" width="250" height="200"/>

Copyright 2017-2018<br/>[Sebastian Software GmbH](http://www.sebastian-software.de)
