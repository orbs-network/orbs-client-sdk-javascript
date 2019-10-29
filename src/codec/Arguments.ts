/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { addressToBytes } from "..";
import { InternalMessage } from "membuffers";
import * as Protocol from "../protocol/Protocol";

export type Argument = ArgBool | ArgUint32 | ArgUint64 | ArgUint256 | ArgString | ArgBytes | ArgBytes20 | ArgBytes32;

export type ArgBool = {
  type: "bool";
  value: boolean;
};

export type ArgUint32 = {
  type: "uint32";
  value: number;
};

export type ArgUint64 = {
  type: "uint64";
  value: bigint;
};

export type ArgUint256 = {
  type: "uint256";
  value: bigint;
};

export type ArgString = {
  type: "string";
  value: string;
};

export type ArgBytes = {
  type: "bytes";
  value: Uint8Array;
};

export type ArgBytes20 = {
  type: "bytes20";
  value: Uint8Array;
};

export type ArgBytes32 = {
  type: "bytes32";
  value: Uint8Array;
};

export const argBool = (value: boolean): ArgBool => ({
  type: "bool",
  value,
});

export const argUint32 = (value: number): ArgUint32 => ({
  type: "uint32",
  value,
});

export const argUint64 = (value: bigint | number): ArgUint64 => ({
  type: "uint64",
  value: typeof value === "number" ? BigInt(value) : value,
});

export const argUint256 = (value: bigint): ArgUint256 => ({
  type: "uint256",
  value,
});

export const argString = (value: string): ArgString => ({
  type: "string",
  value,
});

export const argBytes = (value: Uint8Array): ArgBytes => ({
  type: "bytes",
  value,
});

export const argBytes20 = (value: Uint8Array): ArgBytes20 => ({
  type: "bytes20",
  value,
});

export const argBytes32 = (value: Uint8Array): ArgBytes32 => ({
  type: "bytes32",
  value,
});

export const argAddress = (address: string) => argBytes(addressToBytes(address));

function argumentsBuilders(args: Argument[]): Protocol.ArgumentBuilder[] {
  const res: Protocol.ArgumentBuilder[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    let type = -1;
    switch (arg.type) {
      case "uint32":
        type = Protocol.ARGUMENT_TYPE_UINT_32_VALUE;
        break;
      case "uint64":
        type = Protocol.ARGUMENT_TYPE_UINT_64_VALUE;
        break;
      case "string":
        type = Protocol.ARGUMENT_TYPE_STRING_VALUE;
        break;
      case "bytes":
        type = Protocol.ARGUMENT_TYPE_BYTES_VALUE;
        break;
      case "bool":
        type = Protocol.ARGUMENT_TYPE_BOOL_VALUE;
        break;
      case "uint256":
        type = Protocol.ARGUMENT_TYPE_UINT_256_VALUE;
        break;
      case "bytes20":
        type = Protocol.ARGUMENT_TYPE_BYTES_20_VALUE;
        break;
      case "bytes32":
        type = Protocol.ARGUMENT_TYPE_BYTES_32_VALUE;
        break;
      default:
        throw new Error(`Argument unknown type: ${arg}`);
    }
    res.push(new Protocol.ArgumentBuilder({ type: type, value: arg.value }));

  }
  return res;
}

function argumentsArray(args: Argument[]): InternalMessage {
  const builders = argumentsBuilders(args);
  const buf = new Protocol.ArgumentArrayBuilder({ arguments: builders }).build();
  return new InternalMessage(buf, buf.byteLength, Protocol.ArgumentArray_Scheme, []);
}

export function packedArgumentsEncode(args: Argument[]): Uint8Array {
  const msg = argumentsArray(args);
  return msg.rawBufferForField(0, 0);
}

export function packedArgumentsDecode(buf: Uint8Array): Argument[] {
  const res: Argument[] = [];
  const argsArrayMsg = new InternalMessage(buf, buf.byteLength, Protocol.ArgumentArray_Scheme, []);
  const iterator = argsArrayMsg.getMessageArrayIterator(0);
  let index = 0;
  while (iterator.hasNext()) {
    const [argumentBuf, argumentBufLength] = iterator.nextMessage();
    const argumentMsg = new InternalMessage(argumentBuf, argumentBufLength, Protocol.Argument_Scheme, Protocol.Argument_Unions);
    const type = argumentMsg.getUnionIndex(0, 0);
    switch (type) {
      case Protocol.ARGUMENT_TYPE_UINT_32_VALUE:
        const [, uint32Off] = argumentMsg.isUnionIndex(0, 0, 0);
        res.push(argUint32(argumentMsg.getUint32InOffset(uint32Off)));
        break;
      case Protocol.ARGUMENT_TYPE_UINT_64_VALUE:
        const [, uint64Off] = argumentMsg.isUnionIndex(0, 0, 1);
        res.push(argUint64(argumentMsg.getUint64InOffset(uint64Off)));
        break;
      case Protocol.ARGUMENT_TYPE_STRING_VALUE:
        const [, stringOff] = argumentMsg.isUnionIndex(0, 0, 2);
        res.push(argString(argumentMsg.getStringInOffset(stringOff)));
        break;
      case Protocol.ARGUMENT_TYPE_BYTES_VALUE:
        const [, bytesOff] = argumentMsg.isUnionIndex(0, 0, 3);
        res.push(argBytes(argumentMsg.getBytesInOffset(bytesOff)));
        break;
      case Protocol.ARGUMENT_TYPE_BOOL_VALUE:
        const [, boolOff] = argumentMsg.isUnionIndex(0, 0, 4);
        res.push(argBool(argumentMsg.getBoolInOffset(boolOff)));
        break;
      case Protocol.ARGUMENT_TYPE_UINT_256_VALUE:
        const [, uint256Off] = argumentMsg.isUnionIndex(0, 0, 5);
        res.push(argUint256(argumentMsg.getUint256InOffset(uint256Off)));
        break;
      case Protocol.ARGUMENT_TYPE_BYTES_20_VALUE:
        const [, bytes20Off] = argumentMsg.isUnionIndex(0, 0, 6);
        res.push(argBytes20(argumentMsg.getBytes20InOffset(bytes20Off)));
        break;
      case Protocol.ARGUMENT_TYPE_BYTES_32_VALUE:
        const [, bytes32Off] = argumentMsg.isUnionIndex(0, 0, 7);
        res.push(argBytes32(argumentMsg.getBytes32InOffset(bytes32Off)));
        break;
      default:
        throw new Error(`received argument ${index} has unknown type: ${type}`);
    }
    index++;
  }
  return res;
}
