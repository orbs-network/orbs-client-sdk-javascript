import * as Protocol from "../protocol/Protocol";
import { InternalMessage } from "../membuffers/message";

export type Argument = ArgUint32 | ArgUint64 | ArgString | ArgBytes;

export class ArgUint32 {
  public type = "uint32";
  constructor(public value: number) {}
}

export class ArgUint64 {
  public type = "uint64";
  public value: BigInt;
  constructor(value: BigInt | number) {
    if (typeof value === "number") {
      this.value = BigInt(value);
    } else {
      this.value = value;
    }
  }
}

export class ArgString {
  public type = "string";
  constructor(public value: string) {}
}

export class ArgBytes {
  public type = "bytes";
  constructor(public value: Uint8Array) {}
}

function argumentsBuilders(args: Argument[]): Protocol.ArgumentBuilder[] {
  const res: Protocol.ArgumentBuilder[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg.type) {
      case "uint32":
        res.push(new Protocol.ArgumentBuilder({type: 0, value: arg.value}));
        break;
      case "uint64":
        res.push(new Protocol.ArgumentBuilder({type: 1, value: arg.value}));
        break;
      case "string":
        res.push(new Protocol.ArgumentBuilder({type: 2, value: arg.value}));
        break;
      case "bytes":
        res.push(new Protocol.ArgumentBuilder({type: 3, value: arg.value}));
        break;
      default:
        throw new Error(`Argument unknown type: ${arg}`);
    }
  }
  return res;
}

function argumentsArray(args: Argument[]): InternalMessage {
  const builders = argumentsBuilders(args);
  const buf = new Protocol.ArgumentArrayBuilder({arguments: builders}).build();
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
        res.push(new ArgUint32(argumentMsg.getUint32InOffset(uint32Off)));
        break;
      case 1:
        const [, uint64Off] = argumentMsg.isUnionIndex(0, 0, 1);
        res.push(new ArgUint64(argumentMsg.getUint64InOffset(uint64Off)));
        break;
      case 2:
        const [, stringOff] = argumentMsg.isUnionIndex(0, 0, 2);
        res.push(new ArgString(argumentMsg.getStringInOffset(stringOff)));
        break;
      case 3:
        const [, bytesOff] = argumentMsg.isUnionIndex(0, 0, 3);
        res.push(new ArgBytes(argumentMsg.getBytesInOffset(bytesOff)));
        break;
      default:
        throw new Error(`received argument ${index} has unknown type: ${type}`);
    }
    index++;
  }
  return res;
}