import hash from "hash.js";

export const SHA256_HASH_SIZE_BYTES = 32;

export function calcSha256(data: Uint8Array): Uint8Array {
  const inputArr = [].slice.call(data);
  const outputArr = hash
    .sha256()
    .update(inputArr)
    .digest();
  return new Uint8Array(outputArr);
}
