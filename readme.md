# _Asset Hash_ <br/>[![Sponsored by][sponsor-img]][sponsor] [![Version][npm-version-img]][npm] [![Downloads][npm-downloads-img]][npm] [![Build Status Unix][travis-img]][travis] [![Build Status Windows][appveyor-img]][appveyor] [![Dependencies][deps-img]][deps]

_Asset Hash_ is a quick wrapper around hashing libraries for efficient and fast hashing of asset files like images, web fonts, etc. By default it uses the performance-optimized [Metrohash](https://github.com/jandrewrogers/MetroHash) and a *Base52* encoding (`[a-zA-Z]`) which works well for file names and urls and has a larger dictionary than when using hex.

[sponsor]: https://www.sebastian-software.de
[deps]: https://david-dm.org/sebastian-software/asset-hash
[npm]: https://www.npmjs.com/package/asset-hash
[travis]: https://travis-ci.org/sebastian-software/asset-hash
[appveyor]: https://ci.appveyor.com/project/swernerx/asset-hash/branch/master

[sponsor-img]: https://badgen.net/badge/Sponsored%20by/Sebastian%20Software/692446
[deps-img]: https://badgen.net/david/dep/sebastian-software/asset-hash
[npm-downloads-img]: https://badgen.net/npm/dm/asset-hash
[npm-version-img]: https://badgen.net/npm/v/asset-hash
[travis-img]: https://badgen.net/travis/sebastian-software/asset-hash?label=unix%20build
[appveyor-img]: https://badgen.net/appveyor/ci/swernerx/asset-hash?label=windows%20build

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

For speed comparisons of different algorithms we created a small repository containing the source code and some results. [Check it out](https://github.com/sebastian-software/node-hash-comparison). TLDR: Modern non-cryptographic hashing could be way faster than cryptographic solutions like MD5 or SHA1. Best algorithm right now for our use cases seems to be MetroHash128. This is why we made it the default.


## Usage

There are two main methods: `getHash(filePath, options)` and `getHashedName(filePath, options)` and a more traditional class `Hasher(options)`. Both methods return a Promise with there actual hash or hash file name as a result. The class offers the pretty traditional methods `update(data)` and `digest(options)` to send data or to retrieve the hash.

Options:

- `hash`: Any valid hashing algorithm e.g. `metrohash128` (default), `metrohash64`, `xxhash64`, `xxhash32`, `sha1`, `md5`, ...
- `encoding`: Any valid encoding for built-in digests `hex`, `base64`, `base62`, ...
- `maxLength`: Maximum length of returned digest. Keep in mind that this increases collison probability.

For supporting `xxhash` you have to install the npm module [`xxhash`](https://github.com/mscdex/node-xxhash) on your own. Because there are currently [issues with Node v12](https://github.com/mscdex/node-xxhash/pull/30) we decided to remove the direct dependency in this module.

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

### Class `Hasher`

```js
import { Hasher } from "asset-hash"
const hasher = new Hasher()
hasher.update(data)
console.log("Hashed Data:", hasher.digest()) => "Hashed Data: XDOPW"
```

### Webpack Example Config

You can use the powerful hashing of AssetHash inside Webpack as well. This leads to a) better performance and b) shorter hashes. Here is an example configuration:

```js
import { Hasher } from "asset-hash"

...

  output: {
    hashFunction: Hasher,
    hashDigest: "base52",
    hashDigestLength: 8
  }

...
```

For more details please check the [official Webpack docs](https://webpack.js.org/configuration/output/#output-hashfunction).




## License

[Apache License; Version 2.0, January 2004](http://www.apache.org/licenses/LICENSE-2.0)

## Copyright

<img src="https://cdn.rawgit.com/sebastian-software/sebastian-software-brand/0d4ec9d6/sebastiansoftware-en.svg" alt="Logo of Sebastian Software GmbH, Mainz, Germany" width="460" height="160"/>

Copyright 2017-2019<br/>[Sebastian Software GmbH](http://www.sebastian-software.de)
