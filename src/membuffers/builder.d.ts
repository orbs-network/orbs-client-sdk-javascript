interface MessageWriter {
  write(buf: Uint8Array): void;
  getSize(): number;
  calcRequiredSize(): number;
}

export class InternalBuilder implements MessageWriter {
  reset(): void;
  write(buf: Uint8Array): void;
  calcRequiredSize(): number;
  getSize(): number;
  writeUint8(buf: Uint8Array, v: number): void;
  writeUint16(buf: Uint8Array, v: number): void;
  writeUint32(buf: Uint8Array, v: number): void;
  writeUint64(buf: Uint8Array, v: BigInt): void;
  writeBytes(buf: Uint8Array, v: Uint8Array): void;
  writeString(buf: Uint8Array, v: string): void;
  writeUnionIndex(buf: Uint8Array, unionIndex: number): void;
  writeUint8Array(buf: Uint8Array, v: number[]): void;
  writeUint16Array(buf: Uint8Array, v: number[]): void;
  writeUint32Array(buf: Uint8Array, v: number[]): void;
  writeUint64Array(buf: Uint8Array, v: BigInt[]): void;
  writeBytesArray(buf: Uint8Array, v: Uint8Array[]): void;
  writeStringArray(buf: Uint8Array, v: string[]): void;
  writeMessage(buf: Uint8Array, v: MessageWriter): void;
  writeMessageArray(buf: Uint8Array, v: MessageWriter[]): void;
}
