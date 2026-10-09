'use strict';
// Only the trusted parser is loaded. Input source is never imported or evaluated.
const path = require('node:path');
const ts = process.env.SCREENING_TYPESCRIPT_MODULE
  ? require(path.resolve(process.env.SCREENING_TYPESCRIPT_MODULE)) : require('typescript');
if (ts.version !== '5.9.3') throw new Error('Expected TypeScript 5.9.3');
module.exports = ts;
