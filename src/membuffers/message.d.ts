import { FieldType } from "./types";
import { Iterator } from "./iterator";

export class InternalMessage {
  constructor(buf: Uint8Array, size: number, scheme: FieldType[], unions: FieldType[][]);
  isValid(): boolean;
  rawBuffer(): Uint8Array;
  rawBufferForField(fieldNum: number, unionNum: number): Uint8Array;
  rawBufferWithHeaderForField(fieldNum: number, unionNum: number): Uint8Array;
  getUint8(fieldNum: number): number;
  setUint8(fieldNum: number, v: number): void;
  getUint16(fieldNum: number): number;
  setUint16(fieldNum: number, v: number): void;
  getUint32(fieldNum: number): number;
  setUint32(fieldNum: number, v: number): void;
  getUint64(fieldNum: number): BigInt;
  setUint64(fieldNum: number, v: BigInt): void;
  getMessage(fieldNum: number): Uint8Array;
  getBytes(fieldNum: number): Uint8Array;
  setBytes(fieldNum: number, v: Uint8Array): void;
  getString(fieldNum: number): string;
  setString(fieldNum: number, v: string): void;
  getUnionIndex(fieldNum: number, unionNum: number): number;
  getUint8ArrayIterator(fieldNum: number): Iterator;
  getUint16ArrayIterator(fieldNum: number): Iterator;
  getUint32ArrayIterator(fieldNum: number): Iterator;
  getUint64ArrayIterator(fieldNum: number): Iterator;
  getMessageArrayIterator(fieldNum: number): Iterator;
  getBytesArrayIterator(fieldNum: number): Iterator;
  getStringArrayIterator(fieldNum: number): Iterator;
}