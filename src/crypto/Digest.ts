export const TX_ID_SIZE_BYTES = 8 + 32;

export function extractTxId(txId: Uint8Array): [Uint8Array, BigInt] {
  if (txId.byteLength != TX_ID_SIZE_BYTES) {
    throw new Error(`txid has invalid length ${txId.byteLength}`);
  }
  const dataView = new DataView(txId.buffer, txId.byteOffset);
  const txTimestamp = dataView.getBigUint64(0, true);
  const txHash = txId.subarray(8);
  return [txHash, txTimestamp];
}
