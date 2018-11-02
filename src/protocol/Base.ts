import { InternalBuilder } from "../membuffers/builder";

export abstract class BaseBuilder {
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