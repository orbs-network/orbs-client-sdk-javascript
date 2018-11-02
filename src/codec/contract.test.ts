import "../membuffers/matcher-extensions";
import { encodeCallMethodRequest } from "./OpCallMethod";
import { encodeGetTransactionStatusRequest } from "./OpGetTransactionStatus";
import { MethodArgument, Uint32, Uint64, String, Bytes } from "./MethodArguments";

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

      // CallMethodRequest
      if (inputScenario.CallMethodRequest) {
        const encoded = encodeCallMethodRequest({
          protocolVersion: numberDecode(inputScenario.CallMethodRequest.ProtocolVersion),
          virtualChainId: numberDecode(inputScenario.CallMethodRequest.VirtualChainId),
          timestamp: new Date(inputScenario.CallMethodRequest.Timestamp),
          networkType: inputScenario.CallMethodRequest.NetworkType,
          publicKey: base64Decode(inputScenario.CallMethodRequest.PublicKey),
          contractName: inputScenario.CallMethodRequest.ContractName,
          methodName: inputScenario.CallMethodRequest.MethodName,
          inputArguments: methodArgumentsDecode(inputScenario.CallMethodRequest.InputArguments, inputScenario.InputArgumentsTypes)
        });
        const expected = base64Decode(outputScenario.CallMethodRequest);
        expect(encoded).toBeEqualToUint8Array(expected);
      }

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

function numberDecode(str: string): number {
  return parseInt(str, 10);
}

function base64Decode(str: string): Uint8Array {
  return Buffer.from(str, "base64");
}

function methodArgumentsDecode(args: string[], argTypes: string[]): MethodArgument[] {
  const res: MethodArgument[] = [];
  if (args.length != argTypes.length) {
    throw new Error(`number of args ${args.length} is different than number of argTypes ${argTypes.length}`);
  }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const argType = argTypes[i];
    switch (argType) {
      case "uint32":
        res.push(new Uint32(numberDecode(arg)));
        break;
      case "uint64":
        res.push(new Uint64(BigInt(arg)));
        break;
      case "string":
        res.push(new String(arg));
        break;
      case "bytes":
        res.push(new Bytes(base64Decode(arg)));
        break;
      default:
        throw new Error(`unknown argType ${argType}`);
    }
  }
  return res;
}