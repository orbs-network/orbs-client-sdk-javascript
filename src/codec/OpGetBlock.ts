/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import * as Hash from "../crypto/Hash";
import * as Digest from "../crypto/Digest";
import * as Client from "../protocol/Client";
import * as Protocol from "../protocol/Protocol";
import { InternalMessage } from "membuffers";
import { RequestStatus, requestStatusDecode } from "./RequestStatus";
import { ExecutionResult, executionResultDecode } from "./ExecutionResult";
import { Argument, packedArgumentsDecode } from "./Arguments";
import { Event, packedEventsDecode } from "./Events";

export interface GetBlockRequest {
  protocolVersion: number;
  virtualChainId: number;
  blockHeight: bigint;
}

export interface GetBlockResponse {
  requestStatus: RequestStatus;
  blockHeight: bigint;
  blockTimestamp: Date;
  transactionsBlockHash: Uint8Array;
  transactionsBlockHeader: TransactionsBlockHeader;
  resultsBlockHash: Uint8Array;
  resultsBlockHeader: ResultsBlockHeader;
  transactions: BlockTransaction[];
}

export interface TransactionsBlockHeader {
  protocolVersion: number;
  virtualChainId: number;
  blockHeight: bigint;
  prevBlockHash: Uint8Array;
  timestamp: Date;
  numTransactions: number;
  referenceTime: number;
  blockProposerAddress: Uint8Array;
}

export interface ResultsBlockHeader {
  protocolVersion: number;
  virtualChainId: number;
  blockHeight: bigint;
  prevBlockHash: Uint8Array;
  timestamp: Date;
  transactionsBlockHash: Uint8Array;
  numTransactionReceipts: number;
  referenceTime: number;
  blockProposerAddress: Uint8Array;
}

export interface BlockTransaction {
  txId: Uint8Array;
  txHash: Uint8Array;
  protocolVersion: number;
  virtualChainId: number;
  timestamp: Date;
  signerPublicKey: Uint8Array;
  contractName: string;
  methodName: string;
  inputArguments: Argument[];
  executionResult: ExecutionResult;
  outputArguments: Argument[];
  outputEvents: Event[];
}

export function encodeGetBlockRequest(req: GetBlockRequest): Uint8Array {
  // validate
  if (req.protocolVersion != 1) {
    throw new Error(`expected ProtocolVersion 1, ${req.protocolVersion} given`);
  }

  // encode request
  const res = new Client.GetBlockRequestBuilder({
    protocolVersion: req.protocolVersion,
    virtualChainId: req.virtualChainId,
    blockHeight: req.blockHeight,
  });

  // return
  return res.build();
}

export function decodeGetBlockResponse(buf: Uint8Array): GetBlockResponse {
  // decode response
  const getBlockResponseMsg = new InternalMessage(buf, buf.byteLength, Client.GetBlockResponse_Scheme, []);
  if (!getBlockResponseMsg.isValid()) {
    throw new Error(`response is corrupt and cannot be decoded`);
  }

  // decode request status
  const requestResultBuf = getBlockResponseMsg.getMessage(0);
  const requestResultMsg = new InternalMessage(requestResultBuf, requestResultBuf.byteLength, Client.RequestResult_Scheme, []);
  const requestStatus = requestStatusDecode(requestResultMsg.getUint16(0));

  // decode transactions block header
  const transactionsBlockHeaderBuf = getBlockResponseMsg.getMessage(1);
  const transactionsBlockHeaderMsg = new InternalMessage(transactionsBlockHeaderBuf, transactionsBlockHeaderBuf.byteLength, Protocol.TransactionsBlockHeader_Scheme, []);

  // decode results block header
  const resultsBlockHeaderBuf = getBlockResponseMsg.getMessage(5);
  const resultsBlockHeaderMsg = new InternalMessage(resultsBlockHeaderBuf, resultsBlockHeaderBuf.byteLength, Protocol.ResultsBlockHeader_Scheme, []);

  // decode transactions
  const transactions: BlockTransaction[] = [];
  const txIterator = getBlockResponseMsg.getMessageArrayIterator(3);
  for (const tx of txIterator) {
    const [txBuf]: any = tx;
    const txMsg = new InternalMessage(txBuf, txBuf.byteLength, Protocol.SignedTransaction_Scheme, []);
    const transactionBuf = txMsg.getMessage(0);
    const transactionMsg = new InternalMessage(transactionBuf, transactionBuf.byteLength, Protocol.Transaction_Scheme, []);

    // decode method arguments
    const inputArgumentArray = packedArgumentsDecode(transactionMsg.rawBufferWithHeaderForField(6, 0));

    // decode signer
    let signerPublicKey: Uint8Array = undefined;
    const signerBuf = transactionMsg.getMessage(3);
    const signerMsg = new InternalMessage(signerBuf, signerBuf.byteLength, Protocol.Signer_Scheme, Protocol.Signer_Unions);
    const [isEddsaSigner, eddsaSignerOff] = signerMsg.isUnionIndex(0, 0, 0);
    if (isEddsaSigner) {
      const eddsaSignerBuf = signerMsg.getMessageInOffset(eddsaSignerOff);
      const eddsaSignerMsg = new InternalMessage(eddsaSignerBuf, eddsaSignerBuf.byteLength, Protocol.EdDSA01Signer_Scheme, []);
      signerPublicKey = eddsaSignerMsg.getBytes(1);
    }

    // add transaction
    const txHash = Digest.calcTxHash(transactionBuf);
    const txTimestamp = transactionMsg.getUint64(2);
    transactions.push({
      txHash: txHash,
      txId: Digest.generateTxId(txHash, txTimestamp),
      protocolVersion: transactionMsg.getUint32(0),
      virtualChainId: transactionMsg.getUint32(1),
      timestamp: Protocol.unixNanoToDate(txTimestamp),
      signerPublicKey: signerPublicKey,
      contractName: transactionMsg.getString(4),
      methodName: transactionMsg.getString(5),
      inputArguments: inputArgumentArray,
      executionResult: undefined,
      outputArguments: undefined,
      outputEvents: undefined,
    });
  }

  // decode receipts
  const receiptIterator = getBlockResponseMsg.getMessageArrayIterator(6);
  for (const receipt of receiptIterator) {
    const [receiptBuf]: any = receipt;
    const receiptMsg = new InternalMessage(receiptBuf, receiptBuf.byteLength, Protocol.TransactionReceipt_Scheme, []);
    const receiptTxHash = receiptMsg.getBytes(0);
    for (const transaction of transactions) {
      if (uint8ArrayEquals(transaction.txHash, receiptTxHash)) {
        // decode execution result
        const executionResult = executionResultDecode(receiptMsg.getUint16(1));
        transaction.executionResult = executionResult;

        // decode method arguments
        const outputArgumentArray = packedArgumentsDecode(receiptMsg.rawBufferWithHeaderForField(2, 0));
        transaction.outputArguments = outputArgumentArray;

        // decode events
        const outputEventArray = packedEventsDecode(receiptMsg.rawBufferWithHeaderForField(3, 0));
        transaction.outputEvents = outputEventArray;
      }
    }
  }

  // return
  return {
    requestStatus: requestStatus,
    blockHeight: requestResultMsg.getUint64(1),
    blockTimestamp: Protocol.unixNanoToDate(requestResultMsg.getUint64(2)),
    transactionsBlockHash: Hash.calcSha256(transactionsBlockHeaderMsg.rawBuffer()),
    transactionsBlockHeader: {
      protocolVersion: transactionsBlockHeaderMsg.getUint32(0),
      virtualChainId: transactionsBlockHeaderMsg.getUint32(1),
      blockHeight: transactionsBlockHeaderMsg.getUint64(2),
      prevBlockHash: transactionsBlockHeaderMsg.getBytes(3),
      timestamp: Protocol.unixNanoToDate(transactionsBlockHeaderMsg.getUint64(4)),
      numTransactions: transactionsBlockHeaderMsg.getUint32(7),
      referenceTime: transactionsBlockHeaderMsg.getUint32(9),
      blockProposerAddress: transactionsBlockHeaderMsg.getBytes(8)
    },
    resultsBlockHash: Hash.calcSha256(resultsBlockHeaderMsg.rawBuffer()),
    resultsBlockHeader: {
      protocolVersion: resultsBlockHeaderMsg.getUint32(0),
      virtualChainId: resultsBlockHeaderMsg.getUint32(1),
      blockHeight: resultsBlockHeaderMsg.getUint64(2),
      prevBlockHash: resultsBlockHeaderMsg.getBytes(3),
      timestamp: Protocol.unixNanoToDate(resultsBlockHeaderMsg.getUint64(4)),
      transactionsBlockHash: resultsBlockHeaderMsg.getBytes(7),
      numTransactionReceipts: resultsBlockHeaderMsg.getUint32(9),
      blockProposerAddress: resultsBlockHeaderMsg.getBytes(11),
      referenceTime: resultsBlockHeaderMsg.getUint32(12)
    },
    transactions: transactions,
  };
}

function uint8ArrayEquals(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength != a.byteLength) {
    return false;
  }
  for (let i = 0; i < a.byteLength; i++) {
    if (a[i] != b[i]) {
      return false;
    }
  }
  return true;
}
