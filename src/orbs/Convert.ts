import * as Encoding from "../crypto/Encoding";

export function addressToBytes(address: string): Uint8Array {
    return Encoding.decodeHex(address);
}

export function bytesToAddress(rawAddress: Uint8Array): string {
  return Encoding.encodeHex(rawAddress);
}
