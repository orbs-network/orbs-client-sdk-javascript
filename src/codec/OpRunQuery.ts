import * as Client from "../protocol/Client";
import * as Protocol from "../protocol/Protocol";
import * as Keys from "../crypto/Keys";
import * as Signature from "../crypto/Signature";
import { InternalMessage } from "../membuffers/message";
import { NetworkType, networkTypeEncode } from "./NetworkType";
import { RequestStatus, requestStatusDecode } from "./RequestStatus";
import { ExecutionResult, executionResultDecode } from "./ExecutionResult";
import { Argument, packedArgumentsDecode, packedArgumentsEncode } from "./Arguments";
import { Event, packedEventsDecode } from "./Events";

export interface RunQueryRequest {
  protocolVersion: number;
  virtualChainId: number;
  timestamp: Date;
  networkType: NetworkType;
  publicKey: Uint8Array;
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

export function encodeRunQueryRequest(req: RunQueryRequest): Uint8Array {
  // validate
  if (req.protocolVersion != 1) {
    throw new Error(`expected ProtocolVersion 1, ${req.protocolVersion} given`);
  }
  if (req.publicKey.byteLength != Keys.ED25519_PUBLIC_KEY_SIZE_BYTES) {
    throw new Error(`expected PublicKey length ${Keys.ED25519_PUBLIC_KEY_SIZE_BYTES}, ${req.publicKey.byteLength} given`);
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
            signerPublicKey: req.publicKey,
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
