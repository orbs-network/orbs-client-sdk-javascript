/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import * as Client from "../protocol/Client";
import * as Protocol from "../protocol/Protocol";
import * as Keys from "../crypto/Keys";
import * as Signature from "../crypto/Signature";
import { InternalMessage } from "membuffers";
import { NetworkType, networkTypeEncode } from "./NetworkType";
import { RequestStatus, requestStatusDecode } from "./RequestStatus";
import { ExecutionResult, executionResultDecode } from "./ExecutionResult";
import { Argument, packedArgumentsDecode, packedArgumentsEncode } from "./Arguments";
import { Event, packedEventsDecode } from "./Events";
import { Signer } from "../crypto/Signature";

export interface RunQueryRequest {
  protocolVersion: number;
  virtualChainId: number;
  timestamp: Date;
  networkType: NetworkType;
  contractName: string;
  methodName: string;
  inputArguments: Argument[];
}

export interface RunQueryResponse {
  requestStatus: RequestStatus;
  executionResult: ExecutionResult;
  outputArguments: Argument[];
  outputEvents: Event[];
  blockHeight: bigint;
  blockTimestamp: Date;
}

export async function encodeRunQueryRequest(req: RunQueryRequest, signer: Signer): Promise<Uint8Array> {
  // validate
  if (req.protocolVersion != 1) {
    throw new Error(`expected ProtocolVersion 1, ${req.protocolVersion} given`);
  }
  // encode method arguments
  const inputArgumentArray = packedArgumentsEncode(req.inputArguments);

  // encode network type
  const networkType = networkTypeEncode(req.networkType);

  // encode request
  const res = new Client.RunQueryRequestBuilder({
    signedQuery: new Protocol.SignedQueryBuilder({
      query: new Protocol.QueryBuilder({
        protocolVersion: req.protocolVersion,
        virtualChainId: req.virtualChainId,
        timestamp: Protocol.dateToUnixNano(req.timestamp),
        signer: new Protocol.SignerBuilder({
          scheme: 0,
          eddsa: new Protocol.EdDSA01SignerBuilder({
            networkType: networkType,
            signerPublicKey: await signer.getPublicKey(),
          }),
        }),
        contractName: req.contractName,
        methodName: req.methodName,
        inputArgumentArray: inputArgumentArray,
      }),
      signature: null,
    }),
  });

  // return
  return res.build();
}

export function decodeRunQueryResponse(buf: Uint8Array): RunQueryResponse {
  // decode response
  const runQueryResponseMsg = new InternalMessage(buf, buf.byteLength, Client.RunQueryResponse_Scheme, []);
  if (!runQueryResponseMsg.isValid()) {
    throw new Error(`response is corrupt and cannot be decoded`);
  }

  // decode request status
  const requestResultBuf = runQueryResponseMsg.getMessage(0);
  const requestResultMsg = new InternalMessage(requestResultBuf, requestResultBuf.byteLength, Client.RequestResult_Scheme, []);
  const requestStatus = requestStatusDecode(requestResultMsg.getUint16(0));

  // decode execution result
  const queryResultBuf = runQueryResponseMsg.getMessage(1);
  const queryResultMsg = new InternalMessage(queryResultBuf, queryResultBuf.byteLength, Protocol.QueryResult_Scheme, []);
  let executionResult = ExecutionResult.EXECUTION_RESULT_NOT_EXECUTED;
  if (queryResultBuf.byteLength > 0) {
    executionResult = executionResultDecode(queryResultMsg.getUint16(0));
  }

  // decode method arguments
  const outputArgumentArray = packedArgumentsDecode(queryResultMsg.rawBufferWithHeaderForField(1, 0));

  // decode events
  const outputEventArray = packedEventsDecode(queryResultMsg.rawBufferWithHeaderForField(2, 0));

  // return
  return {
    requestStatus: requestStatus,
    executionResult: executionResult,
    outputArguments: outputArgumentArray,
    outputEvents: outputEventArray,
    blockHeight: requestResultMsg.getUint64(1),
    blockTimestamp: Protocol.unixNanoToDate(requestResultMsg.getUint64(2)),
  };
}
