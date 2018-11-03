const Base58 = require("base-58");

export function encode(source: Uint8Array): string {
  return Base58.encode(source);
}

export function decode(source: string): Uint8Array {
  return Base58.decode(source);
}