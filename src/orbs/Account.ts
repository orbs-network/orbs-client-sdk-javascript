import * as Keys from "../crypto/Keys";
import * as Digest from "../crypto/Digest";
import * as Encoding from "../crypto/Encoding";

export interface Account {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  address: string; // hex string starting with 0x
}

export function createAccount(): Account {
  const keyPair = Keys.generateEd25519Key();
  const rawAddress = Digest.calcClientAddressOfEd25519PublicKey(keyPair.publicKey);
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    address: bytesToAddress(rawAddress)
  };
}

export function addressToBytes(address: string): Uint8Array {
  return Encoding.decodeHex(address);
}

export function bytesToAddress(rawAddress: Uint8Array): string {
  return Encoding.encodeHex(rawAddress);
}