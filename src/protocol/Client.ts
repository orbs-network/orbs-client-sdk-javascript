import { BaseBuilder } from "./Base";
import * as Protocol from "./Protocol";
import { FieldTypes } from "../membuffers/types";
import { SignerBuilder } from "./Protocol";

export const RequestResult_Scheme = [FieldTypes.TypeUint16, FieldTypes.TypeUint64, FieldTypes.TypeUint64];

export class TransactionRefBuilder extends BaseBuilder {
  constructor(private fields: {
    protocolVersion: number,
    virtualChainId: number,
    transactionTimestamp: BigInt,
    txHash: Uint8Array
  }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeUint32(buf, this.fields.protocolVersion);
    this.builder.writeUint32(buf, this.fields.virtualChainId);
    this.builder.writeUint64(buf, this.fields.transactionTimestamp);
    this.builder.writeBytes(buf, this.fields.txHash);
  }
}

export const SendTransactionRequest_Scheme = [FieldTypes.TypeMessage];

export class SendTransactionRequestBuilder extends BaseBuilder {
  constructor(private fields: {
    signedTransaction: Protocol.SignedTransactionBuilder
  }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessage(buf, this.fields.signedTransaction);
  }
}

export const SendTransactionResponse_Scheme = [FieldTypes.TypeMessage, FieldTypes.TypeUint16, FieldTypes.TypeMessage];

export class RunQueryRequestBuilder extends BaseBuilder {
  constructor(private fields: {
    signedQuery: Protocol.SignedQueryBuilder
  }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessage(buf, this.fields.signedQuery);
  }
}

export const RunQueryResponse_Scheme = [FieldTypes.TypeMessage, FieldTypes.TypeMessage];

export class GetTransactionStatusRequestBuilder extends BaseBuilder {
  constructor(private fields: {
    transactionRef: TransactionRefBuilder
  }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessage(buf, this.fields.transactionRef);
  }
}

export const GetTransactionStatusResponse_Scheme = [FieldTypes.TypeMessage, FieldTypes.TypeUint16, FieldTypes.TypeMessage];

export class GetTransactionReceiptProofRequestBuilder extends BaseBuilder {
  constructor(private fields: {
    transactionRef: TransactionRefBuilder
  }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessage(buf, this.fields.transactionRef);
  }
}

export const GetTransactionReceiptProofResponse_Scheme = [FieldTypes.TypeMessage, FieldTypes.TypeUint16, FieldTypes.TypeMessage, FieldTypes.TypeBytes];
