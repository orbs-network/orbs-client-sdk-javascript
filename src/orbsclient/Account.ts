import * as Keys from "../crypto/Keys";
import * as Hash from "../crypto/Hash";
import * as Base58 from "../crypto/Base58";

export interface Account {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
  address: string;
  rawAddress: Uint8Array;
}

export function createAccount(): Account {
  const keyPair = Keys.generateEd25519Key();
  const rawAddress = Hash.calcRipmd160Sha256(keyPair.publicKey);
  return {
    publicKey: keyPair.publicKey,
    privateKey: keyPair.privateKey,
    address: Base58.encode(rawAddress),
    rawAddress: rawAddress
  };
}