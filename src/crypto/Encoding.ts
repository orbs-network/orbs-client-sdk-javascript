import * as Hash from "./Hash";
import { getTextDecoder } from "../membuffers/text";

// without 0x
function simpleHexEncodeAsCharCodeArray(data: Uint8Array): Uint8Array {
  const res = new Uint8Array(2 * data.byteLength);
  for (let i = 0; i < data.byteLength; i++) {
    const hex = "00" + data[i].toString(16).toLowerCase();
    res[2 * i] = hex.charCodeAt(hex.length - 2);
    res[2 * i + 1] = hex.charCodeAt(hex.length - 1);
  }
  return res;
}

// without 0x
function simpleHexDecode(str: string): Uint8Array {
  if (str.length % 2 != 0) {
    throw new Error(`invalid hex string '${str}'`);
  }
  const res = new Uint8Array(str.length / 2);
  for (let i = 0; i < str.length; i += 2) {
    const byte = parseInt(str.substr(i, 2), 16);
    if (isNaN(byte)) {
      throw new Error(`invalid hex string '${str}'`);
    }
    res[i / 2] = byte;
  }
  return res;
}

export function encodeHex(data: Uint8Array): string {
  const result = simpleHexEncodeAsCharCodeArray(data);
  const hashed = Hash.calcSha256(data);

  for (let i = 0; i < 2 * data.byteLength; i++) {
    const byteIndex = Math.floor(i / 2);
    let hashByte = hashed[byteIndex % Hash.SHA256_HASH_SIZE_BYTES];
    if (i % 2 == 0) {
      hashByte = hashByte >> 4;
    } else {
      hashByte &= 0xf;
    }

    // 57 = "9"
    if (result[i] >  57 && hashByte > 7) {
      result[i] -= 32;
    }
  }

  return "0x" + getTextDecoder().decode(result);
}

export function decodeHex(str: string): Uint8Array {
  if (str.startsWith("0x")) {
    str = str.slice(2);
  }

  const data = simpleHexDecode(str);

  const encoded = encodeHex(data);
  if (encoded.slice(2) != str) {
    // checksum error, we will allow if the source is in uniform case (all lower/upper)
    if (str.toUpperCase() == str || str.toLowerCase() == str) {
      return data;
    } else {
      throw new Error(`invalid checksum on hex string '${str}'`);
    }
  }

  return data;
}