/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import "../matcher-extensions";
import { Argument,
  argUint32, argUint64, argString, argBytes, argBool, argUint256, argBytes20, argBytes32,
  argUint32Array, argUint64Array, argStringArray, argBytesArray, argBoolArray, argUint256Array, argBytes20Array, argBytes32Array } from "./Arguments";
import { Event } from "./Events";
import { BlockTransaction, decodeGetBlockResponse, encodeGetBlockRequest } from "./OpGetBlock";
import { decodeGetTransactionReceiptProofResponse, encodeGetTransactionReceiptProofRequest } from "./OpGetTransactionReceiptProof";
import { decodeGetTransactionStatusResponse, encodeGetTransactionStatusRequest } from "./OpGetTransactionStatus";
import { decodeRunQueryResponse, encodeRunQueryRequest } from "./OpRunQuery";
import { decodeSendTransactionResponse, encodeSendTransactionRequest } from "./OpSendTransaction";
import { LocalSigner } from "..";

describe("Codec contract", () => {
  let contractInput: any;
  let contractOutput: any;
  try {
    contractInput = require("../../contract/test/codec/input.json");
    contractOutput = require("../../contract/test/codec/output.json");
  } catch (e) {
    throw new Error(
      `Contract spec input.json and output.json not found in ROOT/contract/test/codec\nThese files are cloned from the reference implementation found at\nhttps://github.com/orbs-network/orbs-client-sdk-go.git during the prepare step of this package`,
    );
  }

  for (let index = 0; index < contractInput.length; index++) {
    const inputScenario = contractInput[index];
    const outputScenario = contractOutput[index];
    test(`Test Id: ${inputScenario.Test}`, async () => {
      // SendTransactionRequest
      if (inputScenario.SendTransactionRequest) {
        const signer = new LocalSigner({publicKey: jsonUnmarshalBase64Bytes(inputScenario.SendTransactionRequest.PublicKey), privateKey: jsonUnmarshalBase64Bytes(inputScenario.PrivateKey)});
        const req = {
          protocolVersion: jsonUnmarshalNumber(inputScenario.SendTransactionRequest.ProtocolVersion),
          virtualChainId: jsonUnmarshalNumber(inputScenario.SendTransactionRequest.VirtualChainId),
          timestamp: new Date(inputScenario.SendTransactionRequest.Timestamp),
          nanoNonce: 0,
          networkType: inputScenario.SendTransactionRequest.NetworkType,
          contractName: inputScenario.SendTransactionRequest.ContractName,
          methodName: inputScenario.SendTransactionRequest.MethodName,
          inputArguments: jsonUnmarshalArguments(inputScenario.SendTransactionRequest.InputArguments, inputScenario.SendTransactionRequest.InputArgumentsTypes),
        };
        const [encoded, txId] = await encodeSendTransactionRequest(
          req, signer);
        const expected = jsonUnmarshalBase64Bytes(outputScenario.SendTransactionRequest);
        expect(encoded).toBeEqualToUint8Array(expected);
        const expectedTxId = jsonUnmarshalBase64Bytes(outputScenario.TxId);
        expect(txId).toBeEqualToUint8Array(expectedTxId);
        return;
      }

      // RunQueryRequest
      if (inputScenario.RunQueryRequest) {
        // we don't have it in the source files but the signer can't be instantiated withouth the key
        const stubPrivateKey = "k+kZmGoiR3/aAWeJzKMMuEGhNWUJOHFPhfAACmUHa9TfwGxb4kpnre6As1q08Ue7GjXFX/he2mn0Dvgnvd7Bcw==";
        const signer = new LocalSigner({publicKey: jsonUnmarshalBase64Bytes(inputScenario.RunQueryRequest.PublicKey), privateKey: jsonUnmarshalBase64Bytes(stubPrivateKey)});

        const encoded = await encodeRunQueryRequest({
          protocolVersion: jsonUnmarshalNumber(inputScenario.RunQueryRequest.ProtocolVersion),
          virtualChainId: jsonUnmarshalNumber(inputScenario.RunQueryRequest.VirtualChainId),
          timestamp: new Date(inputScenario.RunQueryRequest.Timestamp),
          networkType: inputScenario.RunQueryRequest.NetworkType,
          contractName: inputScenario.RunQueryRequest.ContractName,
          methodName: inputScenario.RunQueryRequest.MethodName,
          inputArguments: jsonUnmarshalArguments(inputScenario.RunQueryRequest.InputArguments, inputScenario.RunQueryRequest.InputArgumentsTypes),
        }, signer);
        const expected = jsonUnmarshalBase64Bytes(outputScenario.RunQueryRequest);
        expect(encoded).toBeEqualToUint8Array(expected);
        return;
      }

      // GetTransactionStatusRequest
      if (inputScenario.GetTransactionStatusRequest) {
        const encoded = await encodeGetTransactionStatusRequest({
          protocolVersion: jsonUnmarshalNumber(inputScenario.GetTransactionStatusRequest.ProtocolVersion),
          virtualChainId: jsonUnmarshalNumber(inputScenario.GetTransactionStatusRequest.VirtualChainId),
          txId: jsonUnmarshalBase64Bytes(inputScenario.GetTransactionStatusRequest.TxId),
        });
        const expected = jsonUnmarshalBase64Bytes(outputScenario.GetTransactionStatusRequest);
        expect(encoded).toBeEqualToUint8Array(expected);
        return;
      }

      // GetTransactionReceiptProofRequest
      if (inputScenario.GetTransactionReceiptProofRequest) {
        const encoded = await encodeGetTransactionReceiptProofRequest({
          protocolVersion: jsonUnmarshalNumber(inputScenario.GetTransactionReceiptProofRequest.ProtocolVersion),
          virtualChainId: jsonUnmarshalNumber(inputScenario.GetTransactionReceiptProofRequest.VirtualChainId),
          txId: jsonUnmarshalBase64Bytes(inputScenario.GetTransactionReceiptProofRequest.TxId),
        });
        const expected = jsonUnmarshalBase64Bytes(outputScenario.GetTransactionReceiptProofRequest);
        expect(encoded).toBeEqualToUint8Array(expected);
        return;
      }

      // GetBlockRequest
      if (inputScenario.GetBlockRequest) {
        const encoded = await encodeGetBlockRequest({
          protocolVersion: jsonUnmarshalNumber(inputScenario.GetBlockRequest.ProtocolVersion),
          virtualChainId: jsonUnmarshalNumber(inputScenario.GetBlockRequest.VirtualChainId),
          blockHeight: BigInt(inputScenario.GetBlockRequest.BlockHeight),
        });
        const expected = jsonUnmarshalBase64Bytes(outputScenario.GetBlockRequest);
        expect(encoded).toBeEqualToUint8Array(expected);
        return;
      }

      // SendTransactionResponse
      if (inputScenario.SendTransactionResponse) {
        const decoded = decodeSendTransactionResponse(jsonUnmarshalBase64Bytes(inputScenario.SendTransactionResponse));
        const [args, argsTypes] = jsonMarshalArguments(decoded.outputArguments);
        const res = {
          BlockHeight: decoded.blockHeight.toString(),
          OutputArguments: args,
          OutputArgumentsTypes: argsTypes,
          OutputEvents: jsonMarshalEvents(decoded.outputEvents),
          RequestStatus: decoded.requestStatus,
          ExecutionResult: decoded.executionResult,
          BlockTimestamp: decoded.blockTimestamp.toISOString(),
          TxHash: jsonMarshalBase64Bytes(decoded.txHash),
          TransactionStatus: decoded.transactionStatus,
        };
        const expected = outputScenario.SendTransactionResponse;
        expect(res).toEqual(expected);
        return;
      }

      // RunQueryResponse
      if (inputScenario.RunQueryResponse) {
        const decoded = decodeRunQueryResponse(jsonUnmarshalBase64Bytes(inputScenario.RunQueryResponse));
        const [args, argsTypes] = jsonMarshalArguments(decoded.outputArguments);
        const res = {
          BlockHeight: decoded.blockHeight.toString(),
          OutputArguments: args,
          OutputArgumentsTypes: argsTypes,
          OutputEvents: jsonMarshalEvents(decoded.outputEvents),
          RequestStatus: decoded.requestStatus,
          ExecutionResult: decoded.executionResult,
          BlockTimestamp: decoded.blockTimestamp.toISOString(),
        };
        const expected = outputScenario.RunQueryResponse;
        expect(res).toEqual(expected);
        return;
      }

      // GetTransactionStatusResponse
      if (inputScenario.GetTransactionStatusResponse) {
        const decoded = decodeGetTransactionStatusResponse(jsonUnmarshalBase64Bytes(inputScenario.GetTransactionStatusResponse));
        const [args, argsTypes] = jsonMarshalArguments(decoded.outputArguments);
        const res = {
          BlockHeight: decoded.blockHeight.toString(),
          OutputArguments: args,
          OutputArgumentsTypes: argsTypes,
          OutputEvents: jsonMarshalEvents(decoded.outputEvents),
          RequestStatus: decoded.requestStatus,
          ExecutionResult: decoded.executionResult,
          BlockTimestamp: decoded.blockTimestamp.toISOString(),
          TxHash: jsonMarshalBase64Bytes(decoded.txHash),
          TransactionStatus: decoded.transactionStatus,
        };
        const expected = outputScenario.GetTransactionStatusResponse;
        expect(res).toEqual(expected);
        return;
      }

      // GetTransactionReceiptProofResponse
      if (inputScenario.GetTransactionReceiptProofResponse) {
        const decoded = decodeGetTransactionReceiptProofResponse(jsonUnmarshalBase64Bytes(inputScenario.GetTransactionReceiptProofResponse));
        const [args, argsTypes] = jsonMarshalArguments(decoded.outputArguments);
        const res = {
          BlockHeight: decoded.blockHeight.toString(),
          OutputArguments: args,
          OutputArgumentsTypes: argsTypes,
          OutputEvents: jsonMarshalEvents(decoded.outputEvents),
          RequestStatus: decoded.requestStatus,
          ExecutionResult: decoded.executionResult,
          BlockTimestamp: decoded.blockTimestamp.toISOString(),
          TxHash: jsonMarshalBase64Bytes(decoded.txHash),
          TransactionStatus: decoded.transactionStatus,
          PackedProof: jsonMarshalBase64Bytes(decoded.packedProof),
          PackedReceipt: jsonMarshalBase64Bytes(decoded.packedReceipt),
        };
        const expected = outputScenario.GetTransactionReceiptProofResponse;
        expect(res).toEqual(expected);
        return;
      }

      // GetBlockResponse
      if (inputScenario.GetBlockResponse) {
        const decoded = decodeGetBlockResponse(jsonUnmarshalBase64Bytes(inputScenario.GetBlockResponse));
        const res = {
          BlockHeight: decoded.blockHeight.toString(),
          BlockTimestamp: decoded.blockTimestamp.toISOString(),
          RequestStatus: decoded.requestStatus,
          TransactionsBlockHash: jsonMarshalBase64Bytes(decoded.transactionsBlockHash),
          TransactionsBlockHeader: {
            ProtocolVersion: decoded.transactionsBlockHeader.protocolVersion.toString(),
            VirtualChainId: decoded.transactionsBlockHeader.virtualChainId.toString(),
            BlockHeight: decoded.transactionsBlockHeader.blockHeight.toString(),
            Timestamp: decoded.transactionsBlockHeader.timestamp.toISOString(),
            NumTransactions: decoded.transactionsBlockHeader.numTransactions.toString(),
            PrevBlockHash: jsonMarshalBase64Bytes(decoded.transactionsBlockHeader.prevBlockHash),
          },
          ResultsBlockHash: jsonMarshalBase64Bytes(decoded.resultsBlockHash),
          ResultsBlockHeader: {
            ProtocolVersion: decoded.resultsBlockHeader.protocolVersion.toString(),
            VirtualChainId: decoded.resultsBlockHeader.virtualChainId.toString(),
            BlockHeight: decoded.resultsBlockHeader.blockHeight.toString(),
            Timestamp: decoded.resultsBlockHeader.timestamp.toISOString(),
            NumTransactionReceipts: decoded.resultsBlockHeader.numTransactionReceipts.toString(),
            PrevBlockHash: jsonMarshalBase64Bytes(decoded.resultsBlockHeader.prevBlockHash),
            TransactionsBlockHash: jsonMarshalBase64Bytes(decoded.resultsBlockHeader.transactionsBlockHash),
          },
          Transactions: jsonMarshalBlockTransactions(decoded.transactions),
        };
        const expected = outputScenario.GetBlockResponse;
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
  const buffer = Buffer.from(str, "base64");
  return new Uint8Array(buffer);
}

function jsonMarshalBase64Bytes(buf: Uint8Array): string {
  return Buffer.from(buf).toString("base64");
}

function jsonUnmarshalHexBytes(str: string): Uint8Array {
  const buffer = Buffer.from(str, "hex");
  return new Uint8Array(buffer);
}

function jsonMarshalHexBytes(buf: Uint8Array): string {
  return Buffer.from(buf).toString("hex");
}

function jsonUnmarshalBigInt(hexValue: string): bigint {
  if (hexValue.substring(0, 2) !== "0x") {
    hexValue = "0x" + hexValue;
  }
  return BigInt(hexValue);
}

function jsonMarshalBigInt(v: bigint): string {
  let hex = v.toString(16);
  if (hex.length % 2 !== 0) {
    hex = "0" + hex;
  }
  while (hex.length < 64) {
    hex = "00" + hex;
  }
  return hex;
}

function jsonUnmarshalArguments(args: string[], argTypes: string[]): Argument[] {
  const res: Argument[] = [];
  if (args.length != argTypes.length) {
    throw new Error(`number of args ${args.length} is different than number of argTypes ${argTypes.length}`);
  }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    const argType = argTypes[i];
    switch (argType) {
      case "uint32":
        res.push(argUint32(jsonUnmarshalNumber(arg)));
        break;
      case "uint64":
        res.push(argUint64(BigInt(arg)));
        break;
      case "string":
        res.push(argString(arg));
        break;
      case "bytes":
        res.push(argBytes(jsonUnmarshalHexBytes(arg)));
        break;
      case "bool":
        res.push(argBool(arg === "1"));
        break;
      case "uint256":
        res.push(argUint256(jsonUnmarshalBigInt(arg)));
        break;
      case "bytes20":
        res.push(argBytes20(jsonUnmarshalHexBytes(arg)));
        break;
      case "bytes32":
        res.push(argBytes32(jsonUnmarshalHexBytes(arg)));
        break;
      case "uint32Array":
        let arrUint32 = JSON.parse(arg);
        arrUint32 = arrUint32.map(jsonUnmarshalNumber);
        res.push(argUint32Array(arrUint32));
        break;
      case "uint64Array":
        let arrUint64 = JSON.parse(arg);
        arrUint64 = arrUint64.map(BigInt);
        res.push(argUint64Array(arrUint64));
        break;
      case "stringArray":
        const arrString = JSON.parse(arg);
        res.push(argStringArray(arrString));
        break;
      case "bytesArray":
        let arrBytes = JSON.parse(arg);
        arrBytes = arrBytes.map(jsonUnmarshalHexBytes);
        res.push(argBytesArray(arrBytes));
        break;
      case "boolArray":
        let arrBool = JSON.parse(arg);
        arrBool = arrBool.map(function(a: string): boolean { return a === "1"; });
        res.push(argBoolArray(arrBool));
        break;
      case "uint256Array":
        let arrUint256 = JSON.parse(arg);
        arrUint256 = arrUint256.map(jsonUnmarshalBigInt);
        res.push(argUint256Array(arrUint256));
        break;
      case "bytes20Array":
        let arrBytes20 = JSON.parse(arg);
        arrBytes20 = arrBytes20.map(jsonUnmarshalHexBytes);
        res.push(argBytes20Array(arrBytes20));
        break;
      case "bytes32Array":
        let arrBytes32 = JSON.parse(arg);
        arrBytes32 = arrBytes32.map(jsonUnmarshalHexBytes);
        res.push(argBytes32Array(arrBytes32));
        break;
      default:
        throw new Error(`unknown argType ${argType}`);
    }
  }
  return res;
}

function jsonMarshalArguments(args: Argument[]): [string[], string[]] {
  const res: string[] = [];
  const resTypes: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg.type) {
      case "uint32":
        res.push(arg.value.toString());
        resTypes.push("uint32");
        break;
      case "uint64":
        res.push(arg.value.toString());
        resTypes.push("uint64");
        break;
      case "string":
        res.push(<string>arg.value);
        resTypes.push("string");
        break;
      case "bytes":
        res.push(jsonMarshalHexBytes(<Uint8Array>arg.value));
        resTypes.push("bytes");
        break;
      case "bool":
        res.push(arg.value ? "1" : "0");
        resTypes.push("bool");
        break;
      case "uint256":
        res.push(jsonMarshalBigInt(arg.value));
        resTypes.push("uint256");
        break;
      case "bytes20":
        res.push(jsonMarshalHexBytes(<Uint8Array>arg.value));
        resTypes.push("bytes20");
        break;
      case "bytes32":
        res.push(jsonMarshalHexBytes(<Uint8Array>arg.value));
        resTypes.push("bytes32");
        break;
      case "uint32Array":
        const arrUint32AsString = arg.value.map(function(a: number): string { return a.toString(); });
        res.push(JSON.stringify(arrUint32AsString));
        resTypes.push("uint32Array");
        break;
      case "uint64Array":
        const arrUint64AsString = arg.value.map(function(a: bigint): string { return a.toString(); });
        res.push(JSON.stringify(arrUint64AsString));
       resTypes.push("uint64Array");
        break;
      case "stringArray":
        res.push(JSON.stringify(arg.value));
        resTypes.push("stringArray");
        break;
      case "bytesArray":
        const arrBytesAsStrings = arg.value.map(jsonMarshalHexBytes);
        res.push(JSON.stringify(arrBytesAsStrings));
        resTypes.push("bytesArray");
        break;
      case "boolArray":
        const arrBoolAsString = arg.value.map(function(a: boolean): string { return a ? "1" : "0"; });
        res.push(JSON.stringify(arrBoolAsString));
        resTypes.push("boolArray");
        break;
      case "uint256Array":
        const arrUint256AsStrings = arg.value.map(jsonMarshalBigInt);
        res.push(JSON.stringify(arrUint256AsStrings));
        resTypes.push("uint256Array");
        break;
      case "bytes20Array":
        const arrBytes20AsStrings = arg.value.map(jsonMarshalHexBytes);
        res.push(JSON.stringify(arrBytes20AsStrings));
        resTypes.push("bytes20Array");
        break;
      case "bytes32Array":
        const arrBytes32AsStrings = arg.value.map(jsonMarshalHexBytes);
        res.push(JSON.stringify(arrBytes32AsStrings));
        resTypes.push("bytes32Array");
        break;
      default:
        throw new Error(`unsupported type in json marshal of method arguments`);
    }
  }
  return [res, resTypes];
}

interface MarshaledEvent {
  ContractName: string;
  EventName: string;
  Arguments: string[];
  ArgumentsTypes: string[];
}

function jsonMarshalEvents(events: Event[]): MarshaledEvent[] {
  const res: MarshaledEvent[] = [];
  for (let i = 0; i < events.length; i++) {
    const event = events[i];
    const [args, argsTypes] = jsonMarshalArguments(event.arguments);
    res.push({
      ContractName: event.contractName,
      EventName: event.eventName,
      Arguments: args,
      ArgumentsTypes: argsTypes,
    });
  }
  return res;
}

interface MarshaledBlockTransaction {
  ProtocolVersion: string;
  VirtualChainId: string;
  Timestamp: string;
  InputArguments: string[];
  InputArgumentsTypes: string[];
  OutputArguments: string[];
  OutputArgumentsTypes: string[];
  OutputEvents: MarshaledEvent[];
  TxId: string;
  TxHash: string;
  SignerPublicKey: string;
  ContractName: string;
  MethodName: string;
  ExecutionResult: string;
}

function jsonMarshalBlockTransactions(transactions: BlockTransaction[]): MarshaledBlockTransaction[] {
  const res: MarshaledBlockTransaction[] = [];
  for (let i = 0; i < transactions.length; i++) {
    const transaction = transactions[i];
    const [inArgs, inArgsTypes] = jsonMarshalArguments(transaction.inputArguments);
    const [outArgs, outArgsTypes] = jsonMarshalArguments(transaction.outputArguments);
    res.push({
      ProtocolVersion: transaction.protocolVersion.toString(),
      VirtualChainId: transaction.virtualChainId.toString(),
      Timestamp: transaction.timestamp.toISOString(),
      InputArguments: inArgs,
      InputArgumentsTypes: inArgsTypes,
      OutputArguments: outArgs,
      OutputArgumentsTypes: outArgsTypes,
      OutputEvents: jsonMarshalEvents(transaction.outputEvents),
      TxId: jsonMarshalBase64Bytes(transaction.txId),
      TxHash: jsonMarshalBase64Bytes(transaction.txHash),
      SignerPublicKey: jsonMarshalBase64Bytes(transaction.signerPublicKey),
      ContractName: transaction.contractName,
      MethodName: transaction.methodName,
      ExecutionResult: transaction.executionResult,
    });
  }
  return res;
}
