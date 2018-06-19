FROM node:9-stretch

ARG AWS_SECRET_ACCESS_KEY

ARG AWS_ACCESS_KEY_ID

ADD . /opt/orbs-sdk

WORKDIR /opt/orbs-sdk

RUN apt-get update && apt-get install -y python-pip python-dev

RUN yarn install typescript@2.8.1

RUN ./build.sh
