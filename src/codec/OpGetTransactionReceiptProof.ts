import * as Digest from "../crypto/Digest";
import * as Client from "../protocol/Client";
import * as Protocol from "../protocol/Protocol";
import { InternalMessage } from "../membuffers/message";
import { RequestStatus, requestStatusDecode } from "./RequestStatus";
import { ExecutionResult, executionResultDecode } from "./ExecutionResult";
import { Argument, packedArgumentsDecode } from "./Arguments";
import { Event, packedEventsDecode } from "./Events";
import { TransactionStatus, transactionStatusDecode } from "./TransactionStatus";

export interface GetTransactionReceiptProofRequest {
  protocolVersion: number;
  virtualChainId: number;
  txId: Uint8Array;
}

export interface GetTransactionReceiptProofResponse {
  requestStatus: RequestStatus;
  txHash: Uint8Array;
  executionResult: ExecutionResult;
  outputArguments: Argument[];
  outputEvents: Event[];
  transactionStatus: TransactionStatus;
  blockHeight: bigint;
  blockTimestamp: Date;
  packedProof: Uint8Array;
  packedReceipt: Uint8Array;
}

export function encodeGetTransactionReceiptProofRequest(req: GetTransactionReceiptProofRequest): Uint8Array {
  // validate
  if (req.protocolVersion != 1) {
    throw new Error(`expected ProtocolVersion 1, ${req.protocolVersion} given`);
  }
  if (req.txId.byteLength != Digest.TX_ID_SIZE_BYTES) {
    throw new Error(`expected TxId length ${Digest.TX_ID_SIZE_BYTES}, ${req.txId.byteLength} given`);
  }

  // extract txid
  const [txHash, txTimestamp] = Digest.extractTxId(req.txId);

  // encode request
  const res = new Client.GetTransactionReceiptProofRequestBuilder({
    transactionRef: new Client.TransactionRefBuilder({
      protocolVersion: req.protocolVersion,
      virtualChainId: req.virtualChainId,
      transactionTimestamp: txTimestamp,
      txHash: txHash,
    }),
  });

  // return
  return res.build();
}

export function decodeGetTransactionReceiptProofResponse(buf: Uint8Array): GetTransactionReceiptProofResponse {
  // decode response
  const getTransactionReceiptProofResponseMsg = new InternalMessage(buf, buf.byteLength, Client.GetTransactionReceiptProofResponse_Scheme, []);
  if (!getTransactionReceiptProofResponseMsg.isValid()) {
    throw new Error(`response is corrupt and cannot be decoded`);
  }

  // decode request status
  const requestResultBuf = getTransactionReceiptProofResponseMsg.getMessage(0);
  const requestResultMsg = new InternalMessage(requestResultBuf, requestResultBuf.byteLength, Client.RequestResult_Scheme, []);
  const requestStatus = requestStatusDecode(requestResultMsg.getUint16(0));

  // decode execution result
  const transactionReceiptBuf = getTransactionReceiptProofResponseMsg.getMessage(2);
  const transactionReceiptMsg = new InternalMessage(transactionReceiptBuf, transactionReceiptBuf.byteLength, Protocol.TransactionReceipt_Scheme, []);
  let executionResult = ExecutionResult.EXECUTION_RESULT_NOT_EXECUTED;
  if (transactionReceiptBuf.byteLength > 0) {
    executionResult = executionResultDecode(transactionReceiptMsg.getUint16(1));
  }

  // decode method arguments
  const outputArgumentArray = packedArgumentsDecode(transactionReceiptMsg.rawBufferWithHeaderForField(2, 0));

  // decode events
  const outputEventArray = packedEventsDecode(transactionReceiptMsg.rawBufferWithHeaderForField(3, 0));

  // decode transaction status
  const transactionStatus = transactionStatusDecode(getTransactionReceiptProofResponseMsg.getUint16(1));

  // return
  return {
    requestStatus: requestStatus,
    txHash: transactionReceiptMsg.getBytes(0),
    executionResult: executionResult,
    outputArguments: outputArgumentArray,
    outputEvents: outputEventArray,
    transactionStatus: transactionStatus,
    blockHeight: requestResultMsg.getUint64(1),
    blockTimestamp: Protocol.unixNanoToDate(requestResultMsg.getUint64(2)),
    packedProof: getTransactionReceiptProofResponseMsg.getBytes(3),
    packedReceipt: transactionReceiptBuf,
  };
}
