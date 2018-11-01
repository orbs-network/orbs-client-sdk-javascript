const path = require("path");

describe('browser', () => {

  beforeAll(async () => {
    await page.goto(`file:${path.join(__dirname, 'index.html')}`);
  });

  it('should display "hello" text on page', async () => {
    await expect(page).toMatch('hello10');
  });

});