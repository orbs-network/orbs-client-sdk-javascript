import * as Keys from "./Keys";
const eddsa = require("elliptic").eddsa;

export const ED25519_SIGNATURE_SIZE_BYTES = 64;

export function signEd25519(privateKey: Uint8Array, data: Uint8Array): Uint8Array {
  if (privateKey.byteLength != Keys.ED25519_PRIVATE_KEY_SIZE_BYTES) {
    throw new Error(`cannot sign with ed25519, private key invalid with length ${privateKey.byteLength}`);
  }
  const ec = new eddsa("ed25519");
  const privateKeyString = uint8ArrayToHexString(privateKey.subarray(0, 32));
  const key = ec.keyFromSecret(privateKeyString);
  // console.log(key.getPublic("hex"));
  // console.log(key.getSecret("hex"));
  return new Uint8Array(key.sign(data).toBytes());
}

export function verifyEd25519(publicKey: Uint8Array, data: Uint8Array, signature: Uint8Array): boolean {
  if (publicKey.byteLength != Keys.ED25519_PUBLIC_KEY_SIZE_BYTES) {
    throw new Error(`cannot verify with ed25519, public key invalid with length ${publicKey.byteLength}`);
  }
  const ec = new eddsa("ed25519");
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
