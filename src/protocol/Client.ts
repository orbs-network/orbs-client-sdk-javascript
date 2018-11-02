import { InternalBuilder } from "../membuffers/builder";

abstract class BaseBuilder {
  protected builder: InternalBuilder;
  constructor() {
    this.builder = new InternalBuilder();
  }
  abstract write(buf: Uint8Array): void;
  getSize() {
    return this.builder.getSize();
  }
  calcRequiredSize() {
    this.write(null);
    return this.builder.getSize();
  }
  build() {
    const buf = new Uint8Array(this.calcRequiredSize());
    this.write(buf);
    return buf;
  }
}

export class GetTransactionStatusRequestBuilder extends BaseBuilder {
  constructor(private fields: {transactionTimestamp: BigInt, txHash: Uint8Array}) {
    super();
  }
  write(buf: Uint8Array) {
    this.builder.reset();
    this.builder.writeUint64(buf, this.fields.transactionTimestamp);
    this.builder.writeBytes(buf, this.fields.txHash);
  }
}