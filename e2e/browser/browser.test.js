const path = require("path");

const runStep = async step => await page.click(`#step${step} .action-button`);
const getStepResult = async step => await page.$eval(`#step${step} .result`, el => el.innerText);

describe("E2E browser", () => {
  beforeAll(async () => {
    await page.goto(`file:${path.join(__dirname, "index.html")}`);
  });

  it("should create an account", async () => {
    await runStep(1);
    const accountBytes = await getStepResult(1);
    const accountIdLength = accountBytes.split(",").length;
    expect(accountIdLength).toEqual(32);
  });

  it("should create an account 2", async () => {
    await runStep(2);
    const accountBytes = await getStepResult(2);
    const accountIdLength = accountBytes.split(",").length;
    expect(accountIdLength).toEqual(32);
  });
});
