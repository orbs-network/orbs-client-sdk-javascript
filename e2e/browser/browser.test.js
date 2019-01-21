const path = require("path");
const Gamma = require("../Gamma");
const httpServer = require("http-server");

const STATICS_PORT = 8081;

const clickOnElement = async selector => await page.click(`${selector}`);
const getElementText = async selector => await page.$eval(`${selector}`, el => el.innerText);
const clearInputText = async selector => {
  await page.focus(selector);
  await page.$eval(selector, el => el.setSelectionRange(0, el.value.length));
  await page.keyboard.press("Backspace");
};
const setInputText = async (selector, value) => {
  await clearInputText(selector);
  await page.focus(selector);
  await page.keyboard.type(value);
};

const fillServerDetails = async (endpoint, virtualChainId) => {
  await setInputText("#virtual-chain-id", virtualChainId.toString());
  await setInputText("#endpoint", endpoint);
};

const startStaticsServer = (port, proxy) => {
  return new Promise(resolve => {
    const server = httpServer.createServer({ proxy });
    server.listen(port, "localhost", () => resolve(server));
  });
};

describe("E2E browser", () => {
  let staticsServer;

  beforeAll(async () => {
    jest.setTimeout(60000);
    await Gamma.start();
    const gammaEndpoint = Gamma.getEndpoint();
    console.log("gammaEndpoint", gammaEndpoint);
    staticsServer = await startStaticsServer(STATICS_PORT, gammaEndpoint);
    const staticsServerUrl = `http://localhost:${STATICS_PORT}`;
    await page.goto(`${staticsServerUrl}/e2e/browser/`);
    await fillServerDetails(staticsServerUrl, Gamma.VIRTUAL_CHAIN_ID);
  });

  afterAll(async () => {
    staticsServer.close();
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
    await clickOnElement("#send-tx");
    await expect(page).toMatchElement("#transfer-response-request-status", { text: "COMPLETED", timeout: 2000 });
    await expect(page).toMatchElement("#transfer-response-execution-result", { text: "SUCCESS", timeout: 2000 });
    await expect(page).toMatchElement("#transfer-response-transaction-status", { text: "COMMITTED", timeout: 2000 });
  });

  it("should verify the transaction status", async () => {
    await clickOnElement("#get-tx-status");
    await expect(page).toMatchElement("#transfer-response-request-status", { text: "COMPLETED", timeout: 2000 });
    await expect(page).toMatchElement("#transfer-response-execution-result", { text: "SUCCESS", timeout: 2000 });
    await expect(page).toMatchElement("#transfer-response-transaction-status", { text: "COMMITTED", timeout: 2000 });
    await page.waitFor(200000);
  });
  // test("SimpleTransfer", async () => {
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
