import "../membuffers/matcher-extensions";
import { decodeSendTransactionResponse, encodeSendTransactionRequest } from "./OpSendTransaction";
import { encodeCallMethodRequest, decodeCallMethodResponse } from "./OpCallMethod";
import { encodeGetTransactionStatusRequest, decodeGetTransactionStatusResponse } from "./OpGetTransactionStatus";
import { MethodArgument, Uint32Arg, Uint64Arg, StringArg, BytesArg } from "./MethodArguments";

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

      // SendTransactionRequest
      if (inputScenario.SendTransactionRequest) {
        const [encoded, txId] = encodeSendTransactionRequest({
          protocolVersion: jsonUnmarshalNumber(inputScenario.SendTransactionRequest.ProtocolVersion),
          virtualChainId: jsonUnmarshalNumber(inputScenario.SendTransactionRequest.VirtualChainId),
          timestamp: new Date(inputScenario.SendTransactionRequest.Timestamp),
          networkType: inputScenario.SendTransactionRequest.NetworkType,
          publicKey: jsonUnmarshalBase64Bytes(inputScenario.SendTransactionRequest.PublicKey),
          contractName: inputScenario.SendTransactionRequest.ContractName,
          methodName: inputScenario.SendTransactionRequest.MethodName,
          inputArguments: jsonUnmarshalMethodArguments(inputScenario.SendTransactionRequest.InputArguments, inputScenario.InputArgumentsTypes)
        }, jsonUnmarshalBase64Bytes(inputScenario.PrivateKey));
        const expected = jsonUnmarshalBase64Bytes(outputScenario.SendTransactionRequest);
        expect(encoded).toBeEqualToUint8Array(expected);
        const expectedTxId = jsonUnmarshalBase64Bytes(outputScenario.TxId);
        expect(txId).toBeEqualToUint8Array(expectedTxId);
        return;
      }

      // CallMethodRequest
      if (inputScenario.CallMethodRequest) {
        const encoded = encodeCallMethodRequest({
          protocolVersion: jsonUnmarshalNumber(inputScenario.CallMethodRequest.ProtocolVersion),
          virtualChainId: jsonUnmarshalNumber(inputScenario.CallMethodRequest.VirtualChainId),
          timestamp: new Date(inputScenario.CallMethodRequest.Timestamp),
          networkType: inputScenario.CallMethodRequest.NetworkType,
          publicKey: jsonUnmarshalBase64Bytes(inputScenario.CallMethodRequest.PublicKey),
          contractName: inputScenario.CallMethodRequest.ContractName,
          methodName: inputScenario.CallMethodRequest.MethodName,
          inputArguments: jsonUnmarshalMethodArguments(inputScenario.CallMethodRequest.InputArguments, inputScenario.InputArgumentsTypes)
        });
        const expected = jsonUnmarshalBase64Bytes(outputScenario.CallMethodRequest);
        expect(encoded).toBeEqualToUint8Array(expected);
        return;
      }

      // GetTransactionStatusRequest
      if (inputScenario.GetTransactionStatusRequest) {
        const encoded = encodeGetTransactionStatusRequest({
          txId: jsonUnmarshalBase64Bytes(inputScenario.GetTransactionStatusRequest.TxId)
        });
        const expected = jsonUnmarshalBase64Bytes(outputScenario.GetTransactionStatusRequest);
        expect(encoded).toBeEqualToUint8Array(expected);
        return;
      }

      // SendTransactionResponse
      if (inputScenario.SendTransactionResponse) {
        const decoded = decodeSendTransactionResponse(jsonUnmarshalBase64Bytes(inputScenario.SendTransactionResponse));
        const res = {
          "BlockHeight": decoded.blockHeight.toString(),
          "OutputArguments": jsonMarshalMethodArguments(decoded.outputArguments),
          "RequestStatus": decoded.requestStatus,
          "ExecutionResult": decoded.executionResult,
          "BlockTimestamp": decoded.blockTimestamp.toISOString(),
          "TxHash": jsonMarshalBase64Bytes(decoded.txHash),
          "TransactionStatus": decoded.transactionStatus
        };
        const expected = outputScenario.SendTransactionResponse;
        expect(res).toEqual(expected);
        return;
      }

      // CallMethodResponse
      if (inputScenario.CallMethodResponse) {
        const decoded = decodeCallMethodResponse(jsonUnmarshalBase64Bytes(inputScenario.CallMethodResponse));
        const res = {
          "BlockHeight": decoded.blockHeight.toString(),
          "OutputArguments": jsonMarshalMethodArguments(decoded.outputArguments),
          "RequestStatus": decoded.requestStatus,
          "ExecutionResult": decoded.executionResult,
          "BlockTimestamp": decoded.blockTimestamp.toISOString()
        };
        const expected = outputScenario.CallMethodResponse;
        expect(res).toEqual(expected);
        return;
      }

      // GetTransactionStatusResponse
      if (inputScenario.GetTransactionStatusResponse) {
        const decoded = decodeGetTransactionStatusResponse(jsonUnmarshalBase64Bytes(inputScenario.GetTransactionStatusResponse));
        const res = {
          "BlockHeight": decoded.blockHeight.toString(),
          "OutputArguments": jsonMarshalMethodArguments(decoded.outputArguments),
          "RequestStatus": decoded.requestStatus,
          "ExecutionResult": decoded.executionResult,
          "BlockTimestamp": decoded.blockTimestamp.toISOString(),
          "TxHash": jsonMarshalBase64Bytes(decoded.txHash),
          "TransactionStatus": decoded.transactionStatus
        };
        const expected = outputScenario.GetTransactionStatusResponse;
        expect(res).toEqual(expected);
        return;
      }

      fail(`unhandled input scenario:\n${JSON.stringify(inputScenario)}`);

    });
  }

});

function jsonUnmarshalNumber(str: string): number {
  return parseInt(str, 10);
}

function jsonUnmarshalBase64Bytes(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, "base64"));
}

function jsonMarshalBase64Bytes(buf: Uint8Array): string {
  return Buffer.from(buf).toString("base64");
}

function jsonUnmarshalMethodArguments(args: string[], argTypes: string[]): MethodArgument[] {
  const res: MethodArgument[] = [];
  if (args.length != argTypes.length) {
    throw new Error(`number of args ${args.length} is different than number of argTypes ${argTypes.length}`);
  }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const argType = argTypes[i];
    switch (argType) {
      case "uint32":
        res.push(new Uint32Arg(jsonUnmarshalNumber(arg)));
        break;
      case "uint64":
        res.push(new Uint64Arg(BigInt(arg)));
        break;
      case "string":
        res.push(new StringArg(arg));
        break;
      case "bytes":
        res.push(new BytesArg(jsonUnmarshalBase64Bytes(arg)));
        break;
      default:
        throw new Error(`unknown argType ${argType}`);
    }
  }
  return res;
}

function jsonMarshalMethodArguments(args: MethodArgument[]): string[] {
  const res: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg.constructor) {
      case Uint32Arg:
        res.push(arg.value.toString());
        break;
      case Uint64Arg:
        res.push(arg.value.toString());
        break;
      case StringArg:
        res.push(<string>arg.value);
        break;
      case BytesArg:
        res.push(jsonMarshalBase64Bytes(<Uint8Array>arg.value));
        break;
      default:
        throw new Error(`unsupported type in json marshal of method arguments`);
    }
  }
  return res;
}