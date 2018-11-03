import { BaseBuilder } from "./Base";
import * as Protocol from "./Protocol";
import { FieldTypes } from "../membuffers/types";

export class GetTransactionStatusRequestBuilder extends BaseBuilder {
  constructor(private fields: { transactionTimestamp: BigInt, txHash: Uint8Array }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeUint64(buf, this.fields.transactionTimestamp);
    this.builder.writeBytes(buf, this.fields.txHash);
  }
}

export const GetTransactionStatusResponse_Scheme = [FieldTypes.TypeUint16, FieldTypes.TypeMessage, FieldTypes.TypeUint16, FieldTypes.TypeUint64, FieldTypes.TypeUint64];

export class CallMethodRequestBuilder extends BaseBuilder {
  constructor(private fields: { transaction: Protocol.TransactionBuilder }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessage(buf, this.fields.transaction);
  }
}

export const CallMethodResponse_Scheme = [FieldTypes.TypeUint16, FieldTypes.TypeBytes, FieldTypes.TypeUint16, FieldTypes.TypeUint64, FieldTypes.TypeUint64];

export const SendTransactionRequest_Scheme = [FieldTypes.TypeMessage];

export class SendTransactionRequestBuilder extends BaseBuilder {
  constructor(private fields: { signedTransaction: Protocol.SignedTransactionBuilder }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessage(buf, this.fields.signedTransaction);
  }
}

export const SendTransactionResponse_Scheme = [FieldTypes.TypeUint16, FieldTypes.TypeMessage, FieldTypes.TypeUint16, FieldTypes.TypeUint64, FieldTypes.TypeUint64];
