const Orbs = require("../../dist/index.js");

const GAMMA_PORT       = 8080;
const GAMMA_ENDPOINT   = "localhost";
const VIRTUAL_CHAIN_ID = 42;

test("E2E nodejs: CreateAccount", () => {
  const account = Orbs.createAccount();
  console.log(account.address);
  expect(account.publicKey.byteLength).toBe(32);
  expect(account.privateKey.byteLength).toBe(64);
});

test.skip("E2E nodejs: SimpleTransfer", async () => {
  // TODO: start gamma here

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
    [ new Orbs.Uint64Arg(10), new Orbs.BytesArg(receiver.rawAddress) ]
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
    [ new Orbs.BytesArg(receiver.rawAddress) ]
  );

  // send the payload
  const balanceResponse = await client.callMethod(payload3);
  expect(balanceResponse.requestStatus).toEqual("COMPLETED");
  expect(balanceResponse.executionResult).toEqual("SUCCESS");
  expect(balanceResponse.OutputArguments[0]).toEqual(new Orbs.Uint64Arg(10));

});