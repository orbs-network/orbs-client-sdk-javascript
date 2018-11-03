export const ED25519_PUBLIC_KEY_SIZE_BYTES  = 32;
export const ED25519_PRIVATE_KEY_SIZE_BYTES = 64;

export interface Ed25519KeyPair {
  publicKey: Uint8Array;
  privateKey: Uint8Array;
}

export function generateEd25519Key(): Ed25519KeyPair {
  // generate secure random
  const getRandomValues = require("get-random-values");
  const secureRandom = new Uint8Array(ED25519_PRIVATE_KEY_SIZE_BYTES - ED25519_PUBLIC_KEY_SIZE_BYTES);
  getRandomValues(secureRandom);

  // generate key
  const eddsa = require("elliptic").eddsa;
  const ec = new eddsa("ed25519");
  const key = ec.keyFromSecret(uint8ArrayToHexString(secureRandom));
  // console.log(key.getPublic("hex"));
  // console.log(key.getSecret("hex"));

  // return
  const publicKey = new Uint8Array(key.getPublic("bytes"));
  const privateKey = new Uint8Array(ED25519_PRIVATE_KEY_SIZE_BYTES);
  privateKey.set(new Uint8Array(key.getSecret("bytes")), 0);
  privateKey.set(publicKey, ED25519_PRIVATE_KEY_SIZE_BYTES - ED25519_PUBLIC_KEY_SIZE_BYTES);
  return { publicKey, privateKey };
}

function uint8ArrayToHexString(arr: Uint8Array): string {
  return Array.prototype.map.call(arr, (x: any) => ("00" + x.toString(16)).slice(-2)).join("");
}