import "../membuffers/matcher-extensions";
import * as Encoding from "./Encoding";

const encodeStringTestTable = [
  { sourceHex: "de709f2102306220921060314715629080e2fb77", checksumEncodedHex: "0xdE709f2102306220921060314715629080e2FB77" },
  { sourceHex: "dbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB", checksumEncodedHex: "0xdBf03B407c01e7CD3CBea99509d93F8DDdc8c6Fb" },
  { sourceHex: "abcdef", checksumEncodedHex: "0xABcDEf" },
  { sourceHex: "dbF03B407c01E7cD3CBea99509d93f8DDDC8C6FBdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FB", checksumEncodedHex: "0xDBF03b407C01E7CD3CBea99509D93F8DdDC8C6FBdbF03b407C01e7Cd3cbEa99509D93f8DdDc8C6FB" },
  {
    sourceHex:
      "dbF03B407c01E7cD3CBea99509d93f8DDDC8C6FBdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FBde709f2102306220921060314715629080e2fb77dbF03B407c01E7cD3CBea99509d93f8DDDC8C6FBdbF03B407c01E7cD3CBea99509d93f8DDDC8C6FBde709f2102306220921060314715629080e2fb77",
    checksumEncodedHex:
      "0xDBf03b407C01E7Cd3CBeA99509d93F8DDdC8C6fBDBf03B407c01E7CD3cbEa99509d93f8dDDc8C6FbdE709f2102306220921060314715629080E2FB77dbf03b407C01E7Cd3CbEA99509D93f8Dddc8c6fBDbF03B407C01E7cd3cBeA99509d93f8DDDc8C6FbDE709F2102306220921060314715629080e2FB77",
  },
];

test("HexEncodeWithChecksum", () => {
  for (const pair of encodeStringTestTable) {
    const data = Buffer.from(pair.sourceHex, "hex");
    const encoded = Encoding.encodeHex(data);
    expect(encoded).toBe(pair.checksumEncodedHex);
  }
});

test("HexDecodeGoodChecksum", () => {
  for (const pair of encodeStringTestTable) {
    const rawData = Buffer.from(pair.sourceHex, "hex");
    const decoded = Encoding.decodeHex(pair.checksumEncodedHex);
    expect(decoded).toBeEqualToUint8Array(rawData);
  }
});

test("HexDecodeBadChecksum", () => {
  const pair = encodeStringTestTable[0];
  const rawData = Buffer.from(pair.sourceHex, "hex");
  const wrongCheckSum = "de" + pair.checksumEncodedHex.slice(4);
  expect(() => {
    const decoded = Encoding.decodeHex(wrongCheckSum);
  }).toThrow();
});

test("HexDecodeInvalidHex", () => {
  expect(() => {
    const decoded = Encoding.decodeHex("0");
  }).toThrow();
});
