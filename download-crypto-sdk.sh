#!/bin/bash -xe

export CRYPTO_SDK_VERSION=${CRYPTO_SDK_VERSION-22ded44b307d629e613dacfe8cca8cc56aa8615e}

export S3_PATH=s3://orbs-client-sdk/lib/$CRYPTO_SDK_VERSION

pip install awscli

rm -rf native
aws s3 sync $S3_PATH native

mkdir -p native/headers
tar zxvf native/headers.tgz -C native/headers
