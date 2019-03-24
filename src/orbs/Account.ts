/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

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
    address: bytesToAddress(rawAddress),
  };
}

export function addressToBytes(address: string): Uint8Array {
  return Encoding.decodeHex(address);
}

export function bytesToAddress(rawAddress: Uint8Array): string {
  return Encoding.encodeHex(rawAddress);
}
