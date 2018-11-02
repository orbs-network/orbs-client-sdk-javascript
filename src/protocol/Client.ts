import { BaseBuilder } from "./Base";
import * as Protocol from "./Protocol";

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

export class CallMethodRequestBuilder extends BaseBuilder {
  constructor(private fields: { transaction: Protocol.TransactionBuilder }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessage(buf, this.fields.transaction);
  }
}

export class SendTransactionRequestBuilder extends BaseBuilder {
  constructor(private fields: { signedTransaction: Protocol.SignedTransactionBuilder }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessage(buf, this.fields.signedTransaction);
  }
}
