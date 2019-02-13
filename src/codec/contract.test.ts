import "../membuffers/matcher-extensions";
import { decodeSendTransactionResponse, encodeSendTransactionRequest } from "./OpSendTransaction";
import { encodeRunQueryRequest, decodeRunQueryResponse } from "./OpRunQuery";
import { encodeGetTransactionStatusRequest, decodeGetTransactionStatusResponse } from "./OpGetTransactionStatus";
import { encodeGetTransactionReceiptProofRequest, decodeGetTransactionReceiptProofResponse } from "./OpGetTransactionReceiptProof";
import { encodeGetBlockRequest, decodeGetBlockResponse, BlockTransaction } from "./OpGetBlock";
import { Argument, ArgUint32, ArgUint64, ArgString, ArgBytes } from "./Arguments";
import { Event } from "./Events";

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
    test(`Test Id: ${inputScenario.Test}`, () => {

      // SendTransactionRequest
      if (inputScenario.SendTransactionRequest) {
        const [encoded, txId] = encodeSendTransactionRequest(
          {
            protocolVersion: jsonUnmarshalNumber(inputScenario.SendTransactionRequest.ProtocolVersion),
            virtualChainId: jsonUnmarshalNumber(inputScenario.SendTransactionRequest.VirtualChainId),
            timestamp: new Date(inputScenario.SendTransactionRequest.Timestamp),
            networkType: inputScenario.SendTransactionRequest.NetworkType,
            publicKey: jsonUnmarshalBase64Bytes(inputScenario.SendTransactionRequest.PublicKey),
            contractName: inputScenario.SendTransactionRequest.ContractName,
            methodName: inputScenario.SendTransactionRequest.MethodName,
            inputArguments: jsonUnmarshalArguments(inputScenario.SendTransactionRequest.InputArguments, inputScenario.SendTransactionRequest.InputArgumentsTypes),
          },
          jsonUnmarshalBase64Bytes(inputScenario.PrivateKey),
        );
        const expected = jsonUnmarshalBase64Bytes(outputScenario.SendTransactionRequest);
        expect(encoded).toBeEqualToUint8Array(expected);
        const expectedTxId = jsonUnmarshalBase64Bytes(outputScenario.TxId);
        expect(txId).toBeEqualToUint8Array(expectedTxId);
        return;
      }

      // RunQueryRequest
      if (inputScenario.RunQueryRequest) {
        const encoded = encodeRunQueryRequest({
          protocolVersion: jsonUnmarshalNumber(inputScenario.RunQueryRequest.ProtocolVersion),
          virtualChainId: jsonUnmarshalNumber(inputScenario.RunQueryRequest.VirtualChainId),
          timestamp: new Date(inputScenario.RunQueryRequest.Timestamp),
          networkType: inputScenario.RunQueryRequest.NetworkType,
          publicKey: jsonUnmarshalBase64Bytes(inputScenario.RunQueryRequest.PublicKey),
          contractName: inputScenario.RunQueryRequest.ContractName,
          methodName: inputScenario.RunQueryRequest.MethodName,
          inputArguments: jsonUnmarshalArguments(inputScenario.RunQueryRequest.InputArguments, inputScenario.RunQueryRequest.InputArgumentsTypes),
        });
        const expected = jsonUnmarshalBase64Bytes(outputScenario.RunQueryRequest);
        expect(encoded).toBeEqualToUint8Array(expected);
        return;
      }

      // GetTransactionStatusRequest
      if (inputScenario.GetTransactionStatusRequest) {
        const encoded = encodeGetTransactionStatusRequest({
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
        const encoded = encodeGetTransactionReceiptProofRequest({
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
        const encoded = encodeGetBlockRequest({
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
  return new Uint8Array(Buffer.from(str, "base64"));
}

function jsonMarshalBase64Bytes(buf: Uint8Array): string {
  return Buffer.from(buf).toString("base64");
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
        res.push(new ArgUint32(jsonUnmarshalNumber(arg)));
        break;
      case "uint64":
        res.push(new ArgUint64(BigInt(arg)));
        break;
      case "string":
        res.push(new ArgString(arg));
        break;
      case "bytes":
        res.push(new ArgBytes(jsonUnmarshalBase64Bytes(arg)));
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
    switch (arg.constructor) {
      case ArgUint32:
        res.push(arg.value.toString());
        resTypes.push("uint32");
        break;
      case ArgUint64:
        res.push(arg.value.toString());
        resTypes.push("uint64");
        break;
      case ArgString:
        res.push(<string>arg.value);
        resTypes.push("string");
        break;
      case ArgBytes:
        res.push(jsonMarshalBase64Bytes(<Uint8Array>arg.value));
        resTypes.push("bytes");
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