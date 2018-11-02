import { BaseBuilder } from "./Base";
import { TransactionBuilder } from "./Protocol";

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
  constructor(private fields: { transaction: TransactionBuilder }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessage(buf, this.fields.transaction);
  }
}
