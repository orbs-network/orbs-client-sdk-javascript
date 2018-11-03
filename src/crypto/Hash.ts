const hash = require("hash.js");

const SHA256_HASH_SIZE_BYTES = 32;
const RIPMD160_HASH_SIZE_BYTES = 20;

export function calcSha256(data: Uint8Array): Uint8Array {
  const inputArr = [].slice.call(data);
  const outputArr = hash.sha256().update(inputArr).digest();
  return new Uint8Array(outputArr);
}

export function calcRipmd160Sha256(data: Uint8Array): Uint8Array {
  const inputArr = [].slice.call(data);
  const outputArr1 = hash.sha256().update(inputArr).digest();
  const outputArr2 = hash.ripemd160().update(outputArr1).digest();
  return new Uint8Array(outputArr2);
}