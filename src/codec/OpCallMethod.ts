import { NetworkType, networkTypeEncode } from "./NetworkType";
import { RequestStatus, requestStatusDecode } from "./RequestStatus";
import { ExecutionResult, executionResultDecode } from "./ExecutionResult";
import { MethodArgument, methodArgumentsOpaqueDecode, methodArgumentsOpaqueEncode } from "./MethodArguments";
import * as Client from "../protocol/Client";
import * as Protocol from "../protocol/Protocol";
import * as Keys from "../crypto/Keys";
import { InternalMessage } from "../membuffers/message";

export interface CallMethodRequest {
  protocolVersion: number;
  virtualChainId: number;
  timestamp: Date;
  networkType: NetworkType;
  publicKey: Uint8Array;
  contractName: string;
  methodName: string;
  inputArguments: MethodArgument[];
}

export interface CallMethodResponse {
  requestStatus: RequestStatus;
  executionResult: ExecutionResult;
  outputArguments: MethodArgument[];
  blockHeight: BigInt;
  blockTimestamp: Date;
}

export function encodeCallMethodRequest(req: CallMethodRequest): Uint8Array {
  // validate
  if (req.protocolVersion != 1) {
    throw new Error(`expected ProtocolVersion 1, ${req.protocolVersion} given`);
  }
  if (req.publicKey.byteLength != Keys.ED25519_PUBLIC_KEY_SIZE_BYTES) {
    throw new Error(`expected PublicKey length ${Keys.ED25519_PUBLIC_KEY_SIZE_BYTES}, ${req.publicKey.byteLength} given`);
  }

  // encode method arguments
  const inputArgumentArray = methodArgumentsOpaqueEncode(req.inputArguments);

  // encode network type
  const networkType = networkTypeEncode(req.networkType);

  // encode request
  const res = new Client.CallMethodRequestBuilder({
    transaction: new Protocol.TransactionBuilder({
      protocolVersion: req.protocolVersion,
      virtualChainId: req.virtualChainId,
      timestamp: Protocol.dateToUnixNano(req.timestamp),
      signer: new Protocol.SignerBuilder({
        scheme: 0,
        eddsa: new Protocol.EdDSA01SignerBuilder({
          networkType: networkType,
          signerPublicKey: req.publicKey
        })
      }),
      contractName: req.contractName,
      methodName: req.methodName,
      inputArgumentArray: inputArgumentArray
    })
  });

  // return
  return res.build();
}

export function decodeCallMethodResponse(buf: Uint8Array): CallMethodResponse {
  // decode response
  const callMethodResponseMsg = new InternalMessage(buf, buf.byteLength, Client.CallMethodResponse_Scheme, []);
  if (!callMethodResponseMsg.isValid()) {
    throw new Error(`response is corrupt and cannot be decoded`);
  }

  // decode request status
  const requestStatus = requestStatusDecode(callMethodResponseMsg.getUint16(0));

  // decode execution result
  const executionResult = executionResultDecode(callMethodResponseMsg.getUint16(2));

  // decode method arguments
  const outputArgumentArray = methodArgumentsOpaqueDecode(callMethodResponseMsg.rawBufferWithHeaderForField(1, 0));

  // return
  return {
    requestStatus: requestStatus,
    executionResult: executionResult,
    outputArguments: outputArgumentArray,
    blockHeight: callMethodResponseMsg.getUint64(3),
    blockTimestamp: Protocol.unixNanoToDate(callMethodResponseMsg.getUint64(4))
  };
}