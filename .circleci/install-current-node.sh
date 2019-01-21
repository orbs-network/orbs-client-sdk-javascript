#!/usr/bin/env bash

wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash

export NVM_DIR="/opt/circleci/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"  # This loads nvm bash_completion

nvm install 11.7
