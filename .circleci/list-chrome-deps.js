#!/usr/bin/env node

const path = require('path');
const fs = require('fs');

const result = fs.readFileSync(path.join(__dirname, 'chrome-deps'));

console.log(result.toString().split('\n').join(' '));