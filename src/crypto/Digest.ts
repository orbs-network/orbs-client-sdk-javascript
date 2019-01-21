import * as Hash from "./Hash";
import { calcSha256, SHA256_HASH_SIZE_BYTES } from "./Hash";
import { ED25519_PUBLIC_KEY_SIZE_BYTES } from "./Keys";

export const CLIENT_ADDRESS_SIZE_BYTES = 20;
export const CLIENT_ADDRESS_SHA256_OFFSET = SHA256_HASH_SIZE_BYTES - CLIENT_ADDRESS_SIZE_BYTES;

export const TX_ID_SIZE_BYTES = 8 + 32;

export function calcClientAddressOfEd25519PublicKey(publicKey: Uint8Array): Uint8Array {
  if (publicKey.byteLength != ED25519_PUBLIC_KEY_SIZE_BYTES) {
    throw new Error(`public key has invalid length ${publicKey.byteLength}`);
  }
  return calcSha256(publicKey).slice(CLIENT_ADDRESS_SHA256_OFFSET);
}

export function calcTxHash(transactionBuf: Uint8Array): Uint8Array {
  return Hash.calcSha256(transactionBuf);
}

export function generateTxId(txHash: Uint8Array, txTimestamp: BigInt): Uint8Array {
  const res = new Uint8Array(TX_ID_SIZE_BYTES);
  const dataView = new DataView(res.buffer, res.byteOffset);
  dataView.setBigUint64(0, txTimestamp, true);
  res.set(txHash, 8);
  return res;
}

export function extractTxId(txId: Uint8Array): [Uint8Array, BigInt] {
  if (txId.byteLength != TX_ID_SIZE_BYTES) {
    throw new Error(`txid has invalid length ${txId.byteLength}`);
  }
  const dataView = new DataView(txId.buffer, txId.byteOffset);
  const txTimestamp = dataView.getBigUint64(0, true);
  const txHash = txId.subarray(8);
  return [txHash, txTimestamp];
}

export function calcQueryHash(queryBuf: Uint8Array): Uint8Array {
  return Hash.calcSha256(queryBuf);
}
