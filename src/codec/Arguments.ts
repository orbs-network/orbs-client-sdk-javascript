/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { addressToBytes } from "../orbs/Convert";
import { InternalMessage } from "membuffers";
import * as Protocol from "../protocol/Protocol";

export type Argument = ArgUint32 | ArgUint64 | ArgString | ArgBytes;

export type ArgUint32 = {
  type: "uint32";
  value: number;
};

export type ArgUint64 = {
  type: "uint64";
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

export const argUint32 = (value: number): ArgUint32 => ({
  type: "uint32",
  value,
});

export const argUint64 = (value: bigint | number): ArgUint64 => ({
  type: "uint64",
  value: typeof value === "number" ? BigInt(value) : value,
});

export const argString = (value: string): ArgString => ({
  type: "string",
  value,
});

export const argBytes = (value: Uint8Array): ArgBytes => ({
  type: "bytes",
  value,
});

export const argAddress = (address: string) => argBytes(addressToBytes(address));

function argumentsBuilders(args: Argument[]): Protocol.ArgumentBuilder[] {
  const res: Protocol.ArgumentBuilder[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg.type) {
      case "uint32":
        res.push(new Protocol.ArgumentBuilder({ type: 0, value: arg.value }));
        break;
      case "uint64":
        res.push(new Protocol.ArgumentBuilder({ type: 1, value: arg.value }));
        break;
      case "string":
        res.push(new Protocol.ArgumentBuilder({ type: 2, value: arg.value }));
        break;
      case "bytes":
        res.push(new Protocol.ArgumentBuilder({ type: 3, value: arg.value }));
        break;
      default:
        throw new Error(`Argument unknown type: ${arg}`);
    }
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
      case 0:
        const [, uint32Off] = argumentMsg.isUnionIndex(0, 0, 0);
        res.push(argUint32(argumentMsg.getUint32InOffset(uint32Off)));
        break;
      case 1:
        const [, uint64Off] = argumentMsg.isUnionIndex(0, 0, 1);
        res.push(argUint64(argumentMsg.getUint64InOffset(uint64Off)));
        break;
      case 2:
        const [, stringOff] = argumentMsg.isUnionIndex(0, 0, 2);
        res.push(argString(argumentMsg.getStringInOffset(stringOff)));
        break;
      case 3:
        const [, bytesOff] = argumentMsg.isUnionIndex(0, 0, 3);
        res.push(argBytes(argumentMsg.getBytesInOffset(bytesOff)));
        break;
      default:
        throw new Error(`received argument ${index} has unknown type: ${type}`);
    }
    index++;
  }
  return res;
}
