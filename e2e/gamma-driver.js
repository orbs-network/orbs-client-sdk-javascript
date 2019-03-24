/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

const util = require("util");
const execFile = util.promisify(require("child_process").execFile);

const GAMMA_PORT = 8080;
const GAMMA_SERVER = "localhost";

class GammaDriver {
  constructor(server = GAMMA_SERVER, port = GAMMA_PORT, experimental = true) {
    this.server = server;
    this.port = port;
    this.experimental = experimental;
  }

  async start() {
    try {
      const { stdout, stderr } = await execFile("gamma-cli", ["start-local", "-wait", "-env", "experimental", "-port", this.port]);
      console.log(stdout);
      if (stderr) {
        console.error(stderr);
      }
    } catch (e) {
      console.error("Unable to run start gamma-cli");
    }
  }

  async stop() {
    try {
      const { stdout, stderr } = await execFile("gamma-cli", ["stop-local", "experimental", "-port", this.port]);
      console.log(stdout);
      if (stderr) {
        console.error(stderr);
      }
    } catch (e) {
      console.error("Unable to run stop gamma-cli");
    }
  }

  getEndpoint() {
    return `http://${this.server}:${this.port}`;
  }
}

module.exports = GammaDriver;
