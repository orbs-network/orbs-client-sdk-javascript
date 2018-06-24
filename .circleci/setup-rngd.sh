#!/bin/bash -xe

sudo apt-get update && sudo apt-get install -y rng-tools
sudo rngd -o /dev/random -r /dev/urandom
