import "../membuffers/matcher-extensions";
import { encodeGetTransactionStatusRequest } from "./OpGetTransactionStatus";

describe("Codec contract", () => {

  let contractInput: any;
  let contractOutput: any;
  try {
    contractInput = require("../../contract/test/codec/input.json");
    contractOutput = require("../../contract/test/codec/output.json");
  } catch (e) {
    throw new Error(`Contract spec input.json and output.json not found in ROOT/contract/test/codec\nThese files are cloned from the reference implementation found at\nhttps://github.com/orbs-network/orbs-client-sdk-go.git during the prepare step of this package`);
  }

  for (let index = 0; index < contractInput.length; index++) {
    const inputScenario = contractInput[index];
    const outputScenario = contractOutput[index];
    test(`Test Id: ${inputScenario.Test}`, () => {

      // GetTransactionStatusRequest
      if (inputScenario.GetTransactionStatusRequest) {
        const encoded = encodeGetTransactionStatusRequest({
          txId: base64Decode(inputScenario.GetTransactionStatusRequest.TxId)
        });
        const expected = base64Decode(outputScenario.GetTransactionStatusRequest);
        expect(encoded).toBeEqualToUint8Array(expected);
      }

    });
  }

});

function base64Decode(str: string): Uint8Array {
  return Buffer.from(str, "base64");
}