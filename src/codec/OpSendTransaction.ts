import { NetworkType, networkTypeEncode } from "./NetworkType";
import { MethodArgument, methodArgumentsOpaqueEncode } from "./MethodArguments";
import * as Client from "../protocol/Client";
import * as Protocol from "../protocol/Protocol";
import * as Keys from "../crypto/Keys";
import * as Signature from "../crypto/Signature";
import * as Digest from "../crypto/Digest";
import { InternalMessage } from "../membuffers/message";
import { FieldTypes } from "../membuffers/types";

export interface SendTransactionRequest {
  protocolVersion: number;
  virtualChainId: number;
  timestamp: Date;
  networkType: NetworkType;
  publicKey: Uint8Array;
  contractName: string;
  methodName: string;
  inputArguments: MethodArgument[];
}

export function encodeSendTransactionRequest(req: SendTransactionRequest, privateKey: Uint8Array): [Uint8Array, Uint8Array] {
  // validate
  if (req.protocolVersion != 1) {
    throw new Error(`expected ProtocolVersion 1, ${req.protocolVersion} given`);
  }
  if (req.publicKey.byteLength != Keys.ED25519_PUBLIC_KEY_SIZE_BYTES) {
    throw new Error(`expected PublicKey length ${Keys.ED25519_PUBLIC_KEY_SIZE_BYTES}, ${req.publicKey.byteLength} given`);
  }
  if (privateKey.byteLength != Keys.ED25519_PRIVATE_KEY_SIZE_BYTES) {
    throw new Error(`expected PublicKey length ${Keys.ED25519_PRIVATE_KEY_SIZE_BYTES}, ${privateKey.byteLength} given`);
  }

  // encode method arguments
  const inputArgumentArray = methodArgumentsOpaqueEncode(req.inputArguments);

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
            signerPublicKey: req.publicKey
          })
        }),
        contractName: req.contractName,
        methodName: req.methodName,
        inputArgumentArray: inputArgumentArray
      }),
      signature: new Uint8Array(Signature.ED25519_SIGNATURE_SIZE_BYTES)
    })
  });

  // read encoded bytes
  const buf = res.build();
  const sendTransactionRequestMsg = new InternalMessage(buf, buf.byteLength, Client.SendTransactionRequest_Scheme, []);
  const signedTransactionBuf = sendTransactionRequestMsg.getMessage(0);
  const signedTransactionMsg = new InternalMessage(signedTransactionBuf, signedTransactionBuf.byteLength, Protocol.SignedTransaction_Scheme, []);
  const transactionBuf = signedTransactionMsg.rawBufferForField(0, 0);

  // sign
  const txHash = Digest.calcTxHash(transactionBuf);
  const sig = Signature.signEd25519(privateKey, txHash);
  signedTransactionMsg.setBytes(1, sig);

  // return
  return [buf, Digest.generateTxId(txHash, timestampNano)];
}