/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

const Orbs = require("../../dist/orbs-client-sdk.js");
const GammaDriver = require("../gamma-driver");
const { readFileSync } = require("fs");

const VIRTUAL_CHAIN_ID = 42; // gamma-cli config default
describe("E2E nodejs", () => {
  const gammeDriver = new GammaDriver();

  beforeEach(async () => {
    jest.setTimeout(60000);
    await gammeDriver.start();
  });

  afterEach(async () => {
    await gammeDriver.stop();
  });

  test("SimpleTransfer", async () => {
    // create sender account
    const sender = Orbs.createAccount();

    // create receiver account
    const receiver = Orbs.createAccount();

    // create client
    const endpoint = gammeDriver.getEndpoint();
    const senderClient = new Orbs.Client(endpoint, VIRTUAL_CHAIN_ID, "TEST_NET", new Orbs.DefaultSigner(sender));

    // create transfer transaction
    const [tx, txId] = senderClient.createTransaction("BenchmarkToken", "transfer", [Orbs.argUint64(10), Orbs.argAddress(receiver.address)]);

    // send the transaction
    const transferResponse = await senderClient.sendTransaction(tx);
    console.log("Transfer response:");
    console.log(transferResponse);
    expect(transferResponse.requestStatus).toEqual("COMPLETED");
    expect(transferResponse.executionResult).toEqual("SUCCESS");
    expect(transferResponse.transactionStatus).toEqual("COMMITTED");

    // check the transaction status
    const statusResponse = await senderClient.getTransactionStatus(txId);
    console.log("Status response:");
    console.log(statusResponse);
    expect(statusResponse.requestStatus).toEqual("COMPLETED");
    expect(statusResponse.executionResult).toEqual("SUCCESS");
    expect(statusResponse.transactionStatus).toEqual("COMMITTED");

    // check the transaction receipt proof
    const txProofResponse = await senderClient.getTransactionReceiptProof(txId);
    console.log("Receipt proof response:");
    console.log(txProofResponse);
    expect(txProofResponse.requestStatus).toEqual("COMPLETED");
    expect(txProofResponse.executionResult).toEqual("SUCCESS");
    expect(txProofResponse.transactionStatus).toEqual("COMMITTED");
    expect(txProofResponse.packedProof.byteLength).toBeGreaterThan(20);
    expect(txProofResponse.packedReceipt.byteLength).toBeGreaterThan(10);

    // create balance query
    const query = senderClient.createQuery("BenchmarkToken", "getBalance", [Orbs.argAddress(receiver.address)]);

    // send the query
    const balanceResponse = await senderClient.sendQuery(query);
    console.log("Query response:");
    console.log(balanceResponse);
    expect(balanceResponse.requestStatus).toEqual("COMPLETED");
    expect(balanceResponse.executionResult).toEqual("SUCCESS");
    expect(balanceResponse.outputArguments[0]).toEqual(Orbs.argUint64(10));

    // get the block which contains the transfer transaction
    const blockResponse = await senderClient.getBlock(transferResponse.blockHeight);
    expect(blockResponse.blockHeight).toEqual(transferResponse.blockHeight);
    expect(blockResponse.transactionsBlockHeader.blockHeight).toEqual(transferResponse.blockHeight);
    expect(blockResponse.transactionsBlockHeader.numTransactions).toEqual(1);
    expect(blockResponse.resultsBlockHeader.blockHeight).toEqual(transferResponse.blockHeight);
    expect(Orbs.bytesToAddress(blockResponse.resultsBlockHeader.transactionsBlockHash)).toEqual(Orbs.bytesToAddress(blockResponse.transactionsBlockHash));
    expect(blockResponse.resultsBlockHeader.numTransactionReceipts).toEqual(1);
    expect(blockResponse.transactions[0].contractName).toEqual("BenchmarkToken");
    expect(blockResponse.transactions[0].methodName).toEqual("transfer");
    expect(blockResponse.transactions[0].inputArguments[0]).toEqual(Orbs.argUint64(10));
    expect(Orbs.bytesToAddress(blockResponse.transactions[0].inputArguments[1].value)).toEqual(receiver.address);
  });

  test("TextualError", async () => {
    // create client
    const endpoint = gammeDriver.getEndpoint();
    const client = new Orbs.Client(endpoint, VIRTUAL_CHAIN_ID, "TEST_NET", new Orbs.DefaultSigner(Orbs.createAccount()));

    // send a corrupt transaction
    let error;
    try {
      const transferResponse = await client.sendTransaction(new Uint8Array([0x01, 0x02, 0x03]));
    } catch (e) {
      error = e;
    }
    expect(error.toString()).toMatch("http request is not a valid membuffer");
  });

  test("Deployment", async () => {
    // create sender account
    const sender = Orbs.createAccount();

    // create receiver account
    const receiver = Orbs.createAccount();

    // create client
    const endpoint = gammeDriver.getEndpoint();
    const client = new Orbs.Client(endpoint, VIRTUAL_CHAIN_ID, "TEST_NET", new Orbs.DefaultSigner(sender));

    const sources = [
      readFileSync(`${__dirname}/../contract/increment_base.go`),
      readFileSync(`${__dirname}/../contract/increment_functions.go`)
    ];

    // create transfer transaction
    const [deploymentTx, deploymentTxId] = client.createDeployTransaction("Inc", Orbs.PROCESSOR_TYPE_NATIVE, ...sources);

    // send the transaction
    const deploymentResponse = await client.sendTransaction(deploymentTx);
    console.log("Deployment response:");
    console.log(deploymentResponse);
    expect(deploymentResponse.requestStatus).toEqual("COMPLETED");
    expect(deploymentResponse.executionResult).toEqual("SUCCESS");
    expect(deploymentResponse.transactionStatus).toEqual("COMMITTED");

    // create transfer transaction
    const [tx, txId] = client.createTransaction("BenchmarkToken", "transfer", [Orbs.argUint64(10), Orbs.argAddress(receiver.address)]);
  
    // send the transaction
    const transferResponse = await client.sendTransaction(tx);
    console.log("Transfer response:");
    console.log(transferResponse);
    expect(transferResponse.requestStatus).toEqual("COMPLETED");
    expect(transferResponse.executionResult).toEqual("SUCCESS");
    expect(transferResponse.transactionStatus).toEqual("COMMITTED");
  
    // create balance query
    const query = client.createQuery("BenchmarkToken", "getBalance", [Orbs.argAddress(receiver.address)]);
  
    // send the query
    const balanceResponse = await client.sendQuery(query);
    console.log("Query response:");
    console.log(balanceResponse);
    expect(balanceResponse.requestStatus).toEqual("COMPLETED");
    expect(balanceResponse.executionResult).toEqual("SUCCESS");
    expect(balanceResponse.outputArguments[0]).toEqual(Orbs.argUint64(10));
  });
});
