import * as Digest from "../crypto/Digest";
import * as Client from "../protocol/Client";

export interface GetTransactionStatusRequest {
  txId: Uint8Array;
}

export function encodeGetTransactionStatusRequest(req: GetTransactionStatusRequest): Uint8Array {
  // validate
  if (req.txId.byteLength != Digest.TX_ID_SIZE_BYTES) {
    throw new Error(`expected TxId length ${Digest.TX_ID_SIZE_BYTES}, ${req.txId.byteLength} given`);
  }

  // extract txid
  const [txHash, txTimestamp] = Digest.extractTxId(req.txId);

  // encode request
  const res = new Client.GetTransactionStatusRequestBuilder({
    transactionTimestamp: txTimestamp,
    txHash: txHash
  });

  // return
  return res.build();
}