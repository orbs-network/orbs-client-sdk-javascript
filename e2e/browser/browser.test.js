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

  it("should create the sender account", async () => {
    await clickOnElement("#create-sender-account");
    const senderAccountId = await getElementText("#sender-account-id");
    const accountIdLength = senderAccountId.split(",").length;
    expect(accountIdLength).toEqual(32);
  });

  it("should create the receiver account", async () => {
    await clickOnElement("#create-receiver-account");
    const receiverAccountId = await getElementText("#receiver-account-id");
    const accountIdLength = receiverAccountId.split(",").length;
    expect(accountIdLength).toEqual(32);
  });

  it("should create a transaction", async () => {
    await clickOnElement("#create-tx");
    const txId = await getElementText("#tx-id");
    expect(txId.length).toEqual(82);
  });

  it("should send the transaction", async () => {
    await clickOnElement("#send-tx");
    await expect(page).toMatchElement("#transfer-response-request-status", { text: "COMPLETED" });
    await expect(page).toMatchElement("#transfer-response-execution-result", { text: "SUCCESS" });
    await expect(page).toMatchElement("#transfer-response-transaction-status", { text: "COMMITTED" });
  });

  it("should verify the transaction status", async () => {
    await clickOnElement("#get-tx-status");
    await expect(page).toMatchElement("#status-response-request-status", { text: "COMPLETED" });
    await expect(page).toMatchElement("#status-response-execution-result", { text: "SUCCESS" });
    await expect(page).toMatchElement("#status-response-transaction-status", { text: "COMMITTED" });
  });

  it("should verify the transaction receipt proof", async () => {
    await clickOnElement("#get-tx-receipt-proof");
    await expect(page).toMatchElement("#proof-response-request-status", { text: "COMPLETED" });
    await expect(page).toMatchElement("#proof-response-execution-result", { text: "SUCCESS" });
    await expect(page).toMatchElement("#proof-response-transaction-status", { text: "COMMITTED" });
    const packedProofByteLength = await getElementText("#proof-response-packedproof-bytelength");
    const packedReceiptByteLength = await getElementText("#proof-response-packedreceipt-bytelength");
    expect(parseInt(packedProofByteLength)).toBeGreaterThan(20);
    expect(parseInt(packedReceiptByteLength)).toBeGreaterThan(20);
  });

  it("should send a query", async () => {
    await clickOnElement("#send-query");
    await expect(page).toMatchElement("#balance-response-request-status", { text: "COMPLETED" });
    await expect(page).toMatchElement("#balance-response-execution-result", { text: "SUCCESS" });
    await expect(page).toMatchElement("#balance-response-value", { text: "10" });
    // await page.waitFor(200000);
  });
});
