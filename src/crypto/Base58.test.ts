import "../membuffers/matcher-extensions";
import * as Base58 from "./Base58";

test("Base58Encode", () => {
  const encoded = Base58.encode(Buffer.from("helloworldandstuff1124z24"));
  expect(encoded).toEqual("j1Q1Y54mCcVfR5jVAQMMJEy6VbZEtYeM3R");
});

test("Base58Encode binary data", () => {
  const source = new Uint8Array([0x01, 0x02, 0x03]);
  const encoded = Base58.encode(source);
  const decoded = Base58.decode(encoded);
  expect(decoded).toBeEqualToUint8Array(source);
});