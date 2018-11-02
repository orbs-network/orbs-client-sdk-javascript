type BigInt = number;
declare const BigInt: typeof Number;

/*
interface BigInt extends Object {}
interface BigIntConstructor {
  new(value: any): BigInt;
  (value: any): BigInt;
  asUintN(bits: number, bigint: BigInt): BigInt;
  asIntN(bits: number, bigint: BigInt): BigInt;
}
declare var BigInt: BigIntConstructor;
*/

interface DataView {
  getBigInt64(byteOffset: number, littleEndian?: boolean): BigInt;
  getBigUint64(byteOffset: number, littleEndian?: boolean): BigInt;
  setBigInt64(byteOffset: number, value: BigInt, littleEndian?: boolean): void;
  setBigUint64(byteOffset: number, value: BigInt, littleEndian?: boolean): void;
}
