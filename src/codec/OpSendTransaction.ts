/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { NetworkType, networkTypeEncode } from "./NetworkType";
import * as Client from "../protocol/Client";
import * as Protocol from "../protocol/Protocol";
import * as Keys from "../crypto/Keys";
import * as Signature from "../crypto/Signature";
import * as Digest from "../crypto/Digest";
import { InternalMessage } from "../membuffers/message";
import { Argument, packedArgumentsDecode, packedArgumentsEncode } from "./Arguments";
import { Event, packedEventsDecode } from "./Events";
import { RequestStatus, requestStatusDecode } from "./RequestStatus";
import { ExecutionResult, executionResultDecode } from "./ExecutionResult";
import { TransactionStatus, transactionStatusDecode } from "./TransactionStatus";
import { Signer } from "../crypto/Signature";

export interface SendTransactionRequest {
  protocolVersion: number;
  virtualChainId: number;
  timestamp: Date;
  networkType: NetworkType;
  contractName: string;
  methodName: string;
  inputArguments: Argument[];
}

export interface SendTransactionResponse {
  requestStatus: RequestStatus;
  txHash: Uint8Array;
  executionResult: ExecutionResult;
  outputArguments: Argument[];
  outputEvents: Event[];
  transactionStatus: TransactionStatus;
  blockHeight: bigint;
  blockTimestamp: Date;
}

export function encodeSendTransactionRequest(req: SendTransactionRequest, signer: Signer): [Uint8Array, Uint8Array] {
  // validate
  if (req.protocolVersion != 1) {
    throw new Error(`expected ProtocolVersion 1, ${req.protocolVersion} given`);
  }

  // encode method arguments
  const inputArgumentArray = packedArgumentsEncode(req.inputArguments);

  // encode network type
  const networkType = networkTypeEncode(req.networkType);

  // encode timestamp
  const timestampNano = Protocol.dateToUnixNano(req.timestamp);

  // encode request
  const res = new Client.SendTransactionRequestBuilder({
    signedTransaction: new Protocol.SignedTransactionBuilder({
      transaction: new Protocol.TransactionBuilder({
        protocolVersion: req.protocolVersion,
        virtualChainId: req.virtualChainId,
        timestamp: timestampNano,
        signer: new Protocol.SignerBuilder({
          scheme: 0,
          eddsa: new Protocol.EdDSA01SignerBuilder({
            networkType: networkType,
            signerPublicKey: signer.getPublicKey(),
          }),
        }),
        contractName: req.contractName,
        methodName: req.methodName,
        inputArgumentArray: inputArgumentArray,
      }),
      signature: new Uint8Array(Signature.ED25519_SIGNATURE_SIZE_BYTES),
    }),
  });

  // read encoded bytes
  const buf = res.build();
  const sendTransactionRequestMsg = new InternalMessage(buf, buf.byteLength, Client.SendTransactionRequest_Scheme, []);
  const signedTransactionBuf = sendTransactionRequestMsg.getMessage(0);
  const signedTransactionMsg = new InternalMessage(signedTransactionBuf, signedTransactionBuf.byteLength, Protocol.SignedTransaction_Scheme, []);
  const transactionBuf = signedTransactionMsg.rawBufferForField(0, 0);

  // sign
  const txHash = Digest.calcTxHash(transactionBuf);
  const sig = signer.signEd25519(txHash);
  signedTransactionMsg.setBytes(1, sig);

  // return
  return [buf, Digest.generateTxId(txHash, timestampNano)];
}

export function decodeSendTransactionResponse(buf: Uint8Array): SendTransactionResponse {
  // decode response
  const sendTransactionResponseMsg = new InternalMessage(buf, buf.byteLength, Client.SendTransactionResponse_Scheme, []);
  if (!sendTransactionResponseMsg.isValid()) {
    throw new Error(`response is corrupt and cannot be decoded`);
  }

  // decode request status
  const requestResultBuf = sendTransactionResponseMsg.getMessage(0);
  const requestResultMsg = new InternalMessage(requestResultBuf, requestResultBuf.byteLength, Client.RequestResult_Scheme, []);
  const requestStatus = requestStatusDecode(requestResultMsg.getUint16(0));

  // decode execution result
  const transactionReceiptBuf = sendTransactionResponseMsg.getMessage(2);
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
  const transactionStatus = transactionStatusDecode(sendTransactionResponseMsg.getUint16(1));

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
  };
}
