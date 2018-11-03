import "../membuffers/matcher-extensions";
import * as Hash from "./Hash";
import { getTextEncoder } from "../membuffers/text";

const someData = getTextEncoder().encode("testing");
const ExpectedSha256 = Buffer.from("cf80cd8aed482d5d1527d7dc72fceff84e6326592848447d2dc0b0e87dfc9a90", "hex");
const ExpectedSha256Ripmd160 = Buffer.from("1acb19a469206161ed7e5ed9feb996a6e24be441", "hex");

test("CalcSha256", () => {
  const h = Hash.calcSha256(someData);
  expect(h).toBeEqualToUint8Array(ExpectedSha256);
});

test("CalcRipmd160Sha256", () => {
  const h = Hash.calcRipmd160Sha256(someData);
  expect(h).toBeEqualToUint8Array(ExpectedSha256Ripmd160);
});