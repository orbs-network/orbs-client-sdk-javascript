let textEncoder: TextEncoder = null;
export function getTextEncoder(): TextEncoder {
  if (textEncoder === null) {
    if (typeof TextEncoder === "undefined") {
      // node.js does not support TextEncoder
      require("fast-text-encoding");
    }
    textEncoder = new TextEncoder();
  }
  return textEncoder;
}

let textDecoder: TextDecoder = null;
export function getTextDecoder(): TextDecoder {
  if (textDecoder === null) {
    if (typeof TextDecoder === "undefined") {
      // node.js does not support TextDecoder
      require("fast-text-encoding");
    }
    textDecoder = new TextDecoder("utf-8");
  }
  return textDecoder;
}

export function ch(char: string): number {
  return char.charCodeAt(0);
}
