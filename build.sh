#!/bin/bash -e

rm -rf deps && mkdir -p deps

yarn install

export PATH=./node_modules/.bin:$PATH

yarn run build

yarn test
