import * as Digest from "../crypto/Digest";
import * as Client from "../protocol/Client";
import { RequestStatus, requestStatusDecode } from "./RequestStatus";
import { ExecutionResult, executionResultDecode } from "./ExecutionResult";
import { MethodArgument, methodArgumentsOpaqueDecode } from "./MethodArguments";
import { TransactionStatus, transactionStatusDecode } from "./TransactionStatus";
import { InternalMessage } from "../membuffers/message";
import * as Protocol from "../protocol/Protocol";
import { SendTransactionResponse } from "./OpSendTransaction";

export interface GetTransactionStatusRequest {
  txId: Uint8Array;
}

export interface GetTransactionStatusResponse {
  requestStatus: RequestStatus;
  txHash: Uint8Array;
  executionResult: ExecutionResult;
  outputArguments: MethodArgument[];
  transactionStatus: TransactionStatus;
  blockHeight: BigInt;
  blockTimestamp: Date;
}

export function encodeGetTransactionStatusRequest(req: GetTransactionStatusRequest): Uint8Array {
  // validate
  if (req.txId.byteLength != Digest.TX_ID_SIZE_BYTES) {
    throw new Error(`expected TxId length ${Digest.TX_ID_SIZE_BYTES}, ${req.txId.byteLength} given`);
  }

  // extract txid
  const [txHash, txTimestamp] = Digest.extractTxId(req.txId);

  // encode request
  const res = new Client.GetTransactionStatusRequestBuilder({
    transactionTimestamp: txTimestamp,
    txHash: txHash
  });

  // return
  return res.build();
}

export function decodeGetTransactionStatusResponse(buf: Uint8Array): GetTransactionStatusResponse {
  // decode response
  const getTransactionStatusResponseMsg = new InternalMessage(buf, buf.byteLength, Client.GetTransactionStatusResponse_Scheme, []);
  if (!getTransactionStatusResponseMsg.isValid()) {
    throw new Error(`response is corrupt and cannot be decoded`);
  }

  // decode request status
  const requestStatus = requestStatusDecode(getTransactionStatusResponseMsg.getUint16(0));

  // decode execution result
  const transactionReceiptBuf = getTransactionStatusResponseMsg.getMessage(1);
  const transactionReceiptMsg = new InternalMessage(transactionReceiptBuf, transactionReceiptBuf.byteLength, Protocol.TransactionReceipt_Scheme, []);
  const executionResult = executionResultDecode(transactionReceiptMsg.getUint16(1));

  // decode method arguments
  const outputArgumentArray = methodArgumentsOpaqueDecode(transactionReceiptMsg.rawBufferWithHeaderForField(2, 0));

  // decode transaction status
  const transactionStatus = transactionStatusDecode(getTransactionStatusResponseMsg.getUint16(2));

  // return
  return {
    requestStatus: requestStatus,
    txHash: transactionReceiptMsg.getBytes(0),
    executionResult: executionResult,
    outputArguments: outputArgumentArray,
    transactionStatus: transactionStatus,
    blockHeight: getTransactionStatusResponseMsg.getUint64(3),
    blockTimestamp: Protocol.unixNanoToDate(getTransactionStatusResponseMsg.getUint64(4))
  };
}