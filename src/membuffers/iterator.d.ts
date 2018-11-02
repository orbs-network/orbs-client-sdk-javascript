export class Iterator {
  hasNext(): boolean;
  nextUint8(): number;
  nextUint16(): number;
  nextUint32(): number;
  nextUint64(): BigInt;
  nextMessage(): [Uint8Array, number];
  nextBytes(): Uint8Array;
  nextString(): string;
  [Symbol.iterator](): IterableIterator<number|BigInt|[Uint8Array, number]|Uint8Array|string>;
}