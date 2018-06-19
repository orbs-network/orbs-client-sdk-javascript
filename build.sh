#!/bin/bash -e

rm -rf deps && mkdir -p deps

yarn install

export PATH=$PATH:./node_modules/.bin

yarn run build

yarn test
