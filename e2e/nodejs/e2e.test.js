const Orbs = require("../../dist/index.js");
const Gamma = require("./../Gamma");

describe("E2E nodejs", () => {

  beforeEach(async () => {
    jest.setTimeout(60000);
    await Gamma.start();
  });

  afterEach(async () => {
    await Gamma.shutdown();
  });

  test("SimpleTransfer", async () => {

    // create sender account
    const sender = Orbs.createAccount();

    // create receiver account
    const receiver = Orbs.createAccount();

    // create client
    const endpoint = Gamma.getEndpoint();
    const client = new Orbs.Client(endpoint, Gamma.VIRTUAL_CHAIN_ID, "TEST_NET");

    // create transfer transaction
    const [tx, txId] = client.createTransaction(
      sender.publicKey,
      sender.privateKey,
      "BenchmarkToken",
      "transfer",
      [new Orbs.ArgUint64(10), new Orbs.ArgAddress(receiver.address)]
    );

    // send the transaction
    const transferResponse = await client.sendTransaction(tx);
    console.log(transferResponse);
    expect(transferResponse.requestStatus).toEqual("COMPLETED");
    expect(transferResponse.executionResult).toEqual("SUCCESS");
    expect(transferResponse.transactionStatus).toEqual("COMMITTED");

    // check the transaction status
    const statusResponse = await client.getTransactionStatus(txId);
    console.log(statusResponse);
    expect(statusResponse.requestStatus).toEqual("COMPLETED");
    expect(statusResponse.executionResult).toEqual("SUCCESS");
    expect(statusResponse.transactionStatus).toEqual("COMMITTED");

    // check the transaction receipt proof
    const txProofResponse = await client.getTransactionReceiptProof(txId);
    console.log(txProofResponse);
    expect(txProofResponse.requestStatus).toEqual("COMPLETED");
    expect(txProofResponse.executionResult).toEqual("SUCCESS");
    expect(txProofResponse.transactionStatus).toEqual("COMMITTED");
    expect(txProofResponse.packedProof.byteLength).toBeGreaterThan(20);
    expect(txProofResponse.packedReceipt.byteLength).toBeGreaterThan(10);

    // create balance query
    const query = client.createQuery(
      receiver.publicKey,
      "BenchmarkToken",
      "getBalance",
      [new Orbs.ArgAddress(receiver.address)]
    );

    // send the query
    const balanceResponse = await client.sendQuery(query);
    console.log(balanceResponse);
    expect(balanceResponse.requestStatus).toEqual("COMPLETED");
    expect(balanceResponse.executionResult).toEqual("SUCCESS");
    expect(balanceResponse.outputArguments[0]).toEqual(new Orbs.ArgUint64(10));

  });

  test("TextualError", async () => {

    // create client
    const endpoint = Gamma.getEndpoint();
    const client = new Orbs.Client(endpoint, Gamma.VIRTUAL_CHAIN_ID, "TEST_NET");

    // send a corrupt transaction
    let error;
    try {
      const transferResponse = await client.sendTransaction(new Uint8Array([0x01, 0x02, 0x03]));
    } catch (e) {
      error = e;
    }
    expect(error.toString()).toMatch("http request is not a valid membuffer");

  });

});