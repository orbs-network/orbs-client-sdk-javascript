/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import * as Keys from "./Keys";
import elliptic from "elliptic";

export const ED25519_SIGNATURE_SIZE_BYTES = 64;

export interface Signer {
  getPublicKey(): Promise<Uint8Array>;
  signEd25519(data: Uint8Array): Promise<Uint8Array>;
}

export class DefaultSigner implements Signer {
  constructor(
      private fields: {
          publicKey: Uint8Array;
          privateKey: Uint8Array;
      }
  ) {
    if (this.fields.publicKey.byteLength != Keys.ED25519_PUBLIC_KEY_SIZE_BYTES) {
      throw new Error(`expected PublicKey length ${Keys.ED25519_PUBLIC_KEY_SIZE_BYTES}, ${this.fields.publicKey.byteLength} given`);
    }

    if (this.fields.privateKey.byteLength != Keys.ED25519_PRIVATE_KEY_SIZE_BYTES) {
      throw new Error(`expected PublicKey length ${Keys.ED25519_PRIVATE_KEY_SIZE_BYTES}, ${this.fields.privateKey.byteLength} given`);
    }
  }

  async signEd25519(data: Uint8Array): Promise<Uint8Array> {
      return signEd25519(this.fields.privateKey, data);
  }

  async getPublicKey(): Promise<Uint8Array> {
      return this.fields.publicKey;
  }
}

export function signEd25519(privateKey: Uint8Array, data: Uint8Array): Uint8Array {
  if (privateKey.byteLength != Keys.ED25519_PRIVATE_KEY_SIZE_BYTES) {
    throw new Error(`cannot sign with ed25519, private key invalid with length ${privateKey.byteLength}`);
  }
  const ec = new elliptic.eddsa("ed25519");
  const privateKeyString = uint8ArrayToHexString(privateKey.subarray(0, Keys.ED25519_PRIVATE_KEY_SIZE_BYTES - Keys.ED25519_PUBLIC_KEY_SIZE_BYTES));
  const key = ec.keyFromSecret(privateKeyString);
  // console.log(key.getPublic("hex"));
  // console.log(key.getSecret("hex"));
  return new Uint8Array(key.sign(data).toBytes());
}

export function verifyEd25519(publicKey: Uint8Array, data: Uint8Array, signature: Uint8Array): boolean {
  if (publicKey.byteLength != Keys.ED25519_PUBLIC_KEY_SIZE_BYTES) {
    throw new Error(`cannot verify with ed25519, public key invalid with length ${publicKey.byteLength}`);
  }
  const ec = new elliptic.eddsa("ed25519");
  const publicKeyString = uint8ArrayToHexString(publicKey);
  const key = ec.keyFromPublic(publicKeyString);
  // console.log(key.getPublic("hex"));
  // console.log(key.getSecret("hex"));
  const signatureBytes = [].slice.call(signature);
  return key.verify(data, signatureBytes);
}

function uint8ArrayToHexString(arr: Uint8Array): string {
  return Array.prototype.map.call(arr, (x: any) => ("00" + x.toString(16)).slice(-2)).join("");
}
