# mime-lookup

Comprehensive MIME type mapping API based on [broofa/node-mime](https://github.com/APIs-guru/mime) module.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/Hypercubed/mime-lookup/blob/master/LICENSE)

## Difference from node-mime

1. This module does not include a mime type database.  Either supply your own, as described below, or include [mime-db](https://github.com/jshttp/mime-db).
2. No command line tool.  Since no mime types are included this is not possible using this API only module.
3. `Mime.prototype.load` has been removed to avoid dependency on Node File System.
4. Added 'glob' function to expand mime patterns by [APIs-guru](https://github.com/APIs-guru/node-mime).

## Install

Install with [npm](http://github.com/isaacs/npm) (mime-db is optional):

```bash
npm install mime-lookup mime-db
```

**mine-db is optional and only needed it you wish to use the mime-db mime-type database.**

## Contributing / Testing

```bash
npm test
```

## API

### MimeLookup(db)

This module does not include the mime types database.  Either supply your own or include the [mime-db](https://github.com/jshttp/mime-db).  Construct a new mime type lookup service by supplying a mime type database.

#### Using [mime-db](https://github.com/jshttp/mime-db)

```js
var MimeLookup = require('mime-lookup');
var mime = new MimeLookup(require('mime-db'));
```

#### Using your own types
```js
var MimeLookup = require('mime-lookup');
var mime = new MimeLookup(yourDb);
```

The mime-type database can be formatted two ways:

*Simple*
```json
{
    "text/x-some-format": ["x-sf", "x-sft", "x-sfml"],
    "application/x-my-type": ["x-mt", "x-mtt"]
}
```

*Like mime-db*
```json
{
  "text/x-some-format": {
    "source": "iana",
    "extensions": ["x-sf", "x-sft", "x-sfml"]
  },
  "application/x-my-type": {
    "source": "apache",
    "extensions": ["x-mt", "x-mtt"]
  }
}
```

**Note in this case only the "extensions" property is used**

### mime.lookup(path)

Get the mime type associated with a file, if no mime type is found `application/octet-stream` is returned. Performs a case-insensitive lookup using the extension in `path` (the substring after the last '/' or '.').  E.g.

```js
mime.lookup('file.txt');                  // => 'text/plain'
mime.lookup('.TXT');                      // => 'text/plain'
mime.lookup('htm');                       // => 'text/html'
```

### mime.default_type

Sets the mime type returned when `mime.lookup` fails to find the extension searched for

### mime.extension(type)
Get the default extension for `type`

```js
mime.extension('text/html');                 // => 'html'
mime.extension('application/octet-stream');  // => 'bin'
```

### mime.charsets.lookup()

Map mime-type to charset

```js
mime.charsets.lookup('text/plain');        // => 'UTF-8'
```

### mime.define()

Add additional custom mime/extension mappings

```js
mime.define({
    'text/x-some-format': ['x-sf', 'x-sft', 'x-sfml'],
    'application/x-my-type': ['x-mt', 'x-mtt'],
    // etc ...
});

mime.lookup('x-sft');                 // => 'text/x-some-format'
```

The first entry in the extensions array is returned by `mime.extension()`. E.g.

```js
mime.extension('text/x-some-format'); // => 'x-sf'
```

## Acknowledgements

This code is based on [broofa/node-mime](https://github.com/APIs-guru/mime) with additions from  [APIs-guru](https://github.com/APIs-guru/node-mime).

## License

Original work Copyright (c) 2010 Benjamin Thomas, Robert Kieffer
Modified work Copyright 2015 Jayson Harshbarger

[MIT License](https://github.com/Hypercubed/mime-lookup/blob/master/LICENSE)
