const { double } = require("../../dist/index.js");

test("nodejs", () => {
  expect(double(5)).toBe(10);
});