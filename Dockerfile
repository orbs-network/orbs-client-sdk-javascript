FROM node:9-stretch

ADD . /opt/orbs-sdk

WORKDIR /opt/orbs-sdk

RUN ./build.sh
