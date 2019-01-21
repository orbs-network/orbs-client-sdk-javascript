#!/usr/bin/env bash
# This bash script downloads and installs a release pre-built gamma-cli 

GAMMA_CLI_VERSION="v0.6.3"
GAMMA_CLI_URL="https://github.com/orbs-network/gamma-cli/releases/download/$GAMMA_CLI_VERSION/gammacli-linux-x86-64-$GAMMA_CLI_VERSION.tar.gz"

echo "Downloading pre-built gamma-cli ($GAMMA_CLI_VERSION) from it's official GitHub release repository.."
wget $GAMMA_CLI_URL
tar -zxvf gammacli*.tar.gz
sudo mv _bin/gamma-cli /usr/bin/gamma-cli && echo "gamma-cli successfully installed"

gamma-cli

exit 0