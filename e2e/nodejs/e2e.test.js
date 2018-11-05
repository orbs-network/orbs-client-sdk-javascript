const Orbs = require("../../dist/index.js");
const { spawn } = require('child_process');

const GAMMA_PORT       = process.env.GAMMA_PORT || 34679;
const GAMMA_ENDPOINT   = "localhost";
const VIRTUAL_CHAIN_ID = 42;

test("E2E nodejs: CreateAccount", () => {
  const account = Orbs.createAccount();
  console.log(account.address);
  expect(account.publicKey.byteLength).toBe(32);
  expect(account.privateKey.byteLength).toBe(64);
});

describe("Using Gamma", async () => {

    let gamma;
    beforeEach( async () => {
      console.log("launching Gamma on port " + GAMMA_PORT);
      gamma = spawn("gamma-cli", ["start", "-port", GAMMA_PORT]);
      await new Promise(resolve => setTimeout(resolve, 500));
    });

    afterEach( async () => {
        if (gamma) {
          console.log("shutting down Gamma...");
          gamma.kill();
          await new Promise(resolve => {
              gamma.on('exit', () => {
                  console.log('Gamma exited');
                  gamma = null;
                  resolve();
              })
          });
        }
    });

    test("E2E nodejs: SimpleTransfer", async () => {
        // create sender account
        const sender = Orbs.createAccount();

        // create receiver account
        const receiver = Orbs.createAccount();

        // create client
        const endpoint = `http://${GAMMA_ENDPOINT}:${GAMMA_PORT}`;
        const client = new Orbs.Client(endpoint, VIRTUAL_CHAIN_ID, "TEST_NET");

        // create transfer transaction payload
        const [payload1, txId] = client.createSendTransactionPayload(
            sender.publicKey,
            sender.privateKey,
            "BenchmarkToken",
            "transfer",
            [new Orbs.Uint64Arg(10), new Orbs.BytesArg(receiver.rawAddress)]
        );

        // send the payload
        const transferResponse = await client.sendTransaction(payload1);
        expect(transferResponse.requestStatus).toEqual("COMPLETED");
        expect(transferResponse.executionResult).toEqual("SUCCESS");
        expect(transferResponse.transactionStatus).toEqual("COMMITTED");

        // create get status payload
        const payload2 = client.createGetTransactionStatusPayload(txId);

        // send the payload
        const statusResponse = await client.getTransactionStatus(payload2);
        expect(statusResponse.requestStatus).toEqual("COMPLETED");
        expect(statusResponse.executionResult).toEqual("SUCCESS");
        expect(statusResponse.transactionStatus).toEqual("COMMITTED");

        // create balance method call payload
        const payload3 = client.createCallMethodPayload(
            receiver.publicKey,
            "BenchmarkToken",
            "getBalance",
            [new Orbs.BytesArg(receiver.rawAddress)]
        );

        // send the payload
        const balanceResponse = await client.callMethod(payload3);
        expect(balanceResponse.requestStatus).toEqual("COMPLETED");
        expect(balanceResponse.executionResult).toEqual("SUCCESS");
        expect(balanceResponse.outputArguments[0]).toEqual(new Orbs.Uint64Arg(10));
    });
});