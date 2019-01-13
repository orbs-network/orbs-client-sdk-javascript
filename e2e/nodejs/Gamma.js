const util = require("util");
const execFile = util.promisify(require("child_process").execFile);

const GAMMA_PORT       = 8080;
const GAMMA_ENDPOINT   = "localhost";
const VIRTUAL_CHAIN_ID = 42; // gamma-cli config default

async function gammaCliRun(args) {
  try {
    args.push("-port", GAMMA_PORT);
    const { stdout, stderr } = await execFile("gamma-cli", args);
    console.log(stdout);
    if (stderr) {
      console.error(stderr);
    }
  } catch (e) {
    console.error("Unable to run E2E, please install gamma-cli (https://github.com/orbs-network/orbs-contract-sdk/blob/master/GAMMA.md)");
  }
}

async function start() {
  return gammaCliRun(["start-local", "-wait"]);
}

async function shutdown() {
  return gammaCliRun(["stop-local"]);
}

function getEndpoint() {
  const endpoint = process.env.GAMMA_ENDPOINT;
  if (endpoint) {
    return endpoint;
  }
  return `http://${GAMMA_ENDPOINT}:${GAMMA_PORT}`;
}

module.exports = {
  VIRTUAL_CHAIN_ID,
  start,
  shutdown,
  getEndpoint
};