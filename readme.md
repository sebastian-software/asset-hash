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

## Usage

There are two main methods: `getHash(filePath)` and `getHashedName(filePath)`. Both return a Promise with there actual hash or hash file name as a result.

The hashed file name replaces the name part of the file with the hash while keeping the file extension.

### `getHash()`

```js
import { getHash } from "asset-hash"
getHash("./src/fixtures/font.woff").then((hash) => {
  console.log("Hash:", hash)
})
```

### `getHashedName()`

```js
import { getHashedName } from "asset-hash"
getHashedName("./src/fixtures/font.woff").then((hashedName) => {
  console.log("Hashed Filename:", hashedName)
})
```

## License

[Apache License; Version 2.0, January 2004](http://www.apache.org/licenses/LICENSE-2.0)

## Copyright

<img src="https://cdn.rawgit.com/sebastian-software/sebastian-software-brand/3d93746f/sebastiansoftware-en.svg" alt="Sebastian Software GmbH Logo" width="250" height="200"/>

Copyright 2017-2018<br/>[Sebastian Software GmbH](http://www.sebastian-software.de)
