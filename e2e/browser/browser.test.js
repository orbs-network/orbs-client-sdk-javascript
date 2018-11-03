const path = require("path");

describe("E2E browser", () => {

  beforeAll(async () => {
    await page.goto(`file:${path.join(__dirname, "index.html")}`);
  });

  it("should display 'success' on page", async () => {
    await expect(page).toMatch("success");
  });

});