#!/bin/bash -xe

export CRYPTO_SDK_VERSION=${CRYPTO_SDK_VERSION-22ded44b307d629e613dacfe8cca8cc56aa8615e}

export S3_URL=http://orbs-client-sdk.s3-website-us-west-2.amazonaws.com/lib

rm -rf native

function curl_download() {
    mkdir -p native/$1

    local LIB_NAME=libcryptosdk.so

    if [ "$1" == "mac" ] ; then
        local LIB_NAME=libcryptosdk.dylib
    fi

    curl -s -o native/$1/$LIB_NAME $S3_URL/$CRYPTO_SDK_VERSION/$1/$LIB_NAME
    curl -s -o native/$1/$LIB_NAME.md5 $S3_URL/$CRYPTO_SDK_VERSION/$1/$LIB_NAME.md5
}

curl_download mac
curl_download linux
curl_download android/armv7-a
curl_download android/armv8-a
curl_download android/i686
curl_download android/westmere

mkdir -p native/headers

curl -s -o native/headers.tgz $S3_URL/$CRYPTO_SDK_VERSION/headers.tgz
curl -s -o native/headers.tgz.md5 $S3_URL/$CRYPTO_SDK_VERSION/headers.tgz.md5

tar xvf native/headers.tgz -C native/headers
