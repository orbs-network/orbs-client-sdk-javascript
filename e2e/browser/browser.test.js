const path = require("path");
const Gamma = require("../Gamma");

const clickOnElement = async selector => await page.click(`${selector}`);
const getElementText = async selector => await page.$eval(`${selector}`, el => el.innerText);
const fillGammaDetails = async (endpoint, virtualChainId) => {
  await page.focus("#virtual-chain-id");
  await page.keyboard.type(virtualChainId.toString());
  await page.focus("#endpoint");
  await page.keyboard.type(endpoint);
};

describe("E2E browser", () => {
  beforeAll(async () => {
    jest.setTimeout(60000);
    Promise.all[(await Gamma.start(), await page.goto(`file:${path.join(__dirname, "index.html")}`))];
    const endpoint = Gamma.getEndpoint();
    await fillGammaDetails(endpoint, Gamma.VIRTUAL_CHAIN_ID);
  });

  afterAll(async () => {
    await Gamma.shutdown();
  });

  it("should create Orbs.Client instance", async () => {
    await clickOnElement("#create-orbs-client");
    const orbsClientResult = await getElementText("#orbs-client-result");
    expect(orbsClientResult).toEqual("Created");
  });

  it("should create an account 1", async () => {
    await clickOnElement("#create-account-1");
    const account1Id = await getElementText("#account-1-id");
    const accountIdLength = account1Id.split(",").length;
    expect(accountIdLength).toEqual(32);
  });

  it("should create an account 2", async () => {
    await clickOnElement("#create-account-2");
    const account2Id = await getElementText("#account-2-id");
    const accountIdLength = account2Id.split(",").length;
    expect(accountIdLength).toEqual(32);
  });

  it("should create a transaction", async () => {
    await clickOnElement("#create-tx");
    const txId = await getElementText("#tx-id");
    expect(txId.length).toEqual(82);
  });

  it("should send the transaction", async () => {
    await clickOnElement("#create-tx");
    const txId = await getElementText("#tx-id");
    expect(txId.length).toEqual(82);
  });
  // test("SimpleTransfer", async () => {
  //   // send the transaction
  //   const transferResponse = await client.sendTransaction(tx);
  //   console.log(transferResponse);
  //   expect(transferResponse.requestStatus).toEqual("COMPLETED");
  //   expect(transferResponse.executionResult).toEqual("SUCCESS");
  //   expect(transferResponse.transactionStatus).toEqual("COMMITTED");

  //   // check the transaction status
  //   const statusResponse = await client.getTransactionStatus(txId);
  //   console.log(statusResponse);
  //   expect(statusResponse.requestStatus).toEqual("COMPLETED");
  //   expect(statusResponse.executionResult).toEqual("SUCCESS");
  //   expect(statusResponse.transactionStatus).toEqual("COMMITTED");

  //   // check the transaction receipt proof
  //   const txProofResponse = await client.getTransactionReceiptProof(txId);
  //   console.log(txProofResponse);
  //   expect(txProofResponse.requestStatus).toEqual("COMPLETED");
  //   expect(txProofResponse.executionResult).toEqual("SUCCESS");
  //   expect(txProofResponse.transactionStatus).toEqual("COMMITTED");
  //   expect(txProofResponse.packedProof.byteLength).toBeGreaterThan(20);
  //   expect(txProofResponse.packedReceipt.byteLength).toBeGreaterThan(10);

  //   // create balance query
  //   const query = client.createQuery(receiver.publicKey, "BenchmarkToken", "getBalance", [
  //     new Orbs.ArgAddress(receiver.address),
  //   ]);

  //   // send the query
  //   const balanceResponse = await client.sendQuery(query);
  //   console.log(balanceResponse);
  //   expect(balanceResponse.requestStatus).toEqual("COMPLETED");
  //   expect(balanceResponse.executionResult).toEqual("SUCCESS");
  //   expect(balanceResponse.outputArguments[0]).toEqual(new Orbs.ArgUint64(10));
  // });
});
