#!/bin/bash -e

rm -rf deps && mkdir -p deps

yarn install

yarn run build

yarn test
