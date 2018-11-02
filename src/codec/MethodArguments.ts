import * as Protocol from "../protocol/Protocol";
import { InternalMessage } from "../membuffers/message";
import { FieldTypes } from "../membuffers/types";

export type MethodArgument = Uint32 | Uint64 | String | Bytes;

export class Uint32 {
  constructor(public value: number) {}
}

export class Uint64 {
  constructor(public value: BigInt) {}
}

export class String {
  constructor(public value: string) {}
}

export class Bytes {
  constructor(public value: Uint8Array) {}
}

function methodArgumentsBuilders(args: MethodArgument[]): Protocol.MethodArgumentBuilder[] {
  const res: Protocol.MethodArgumentBuilder[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg.constructor) {
      case Uint32:
        res.push(new Protocol.MethodArgumentBuilder({name: "uint32", type: 0, value: arg.value}));
        break;
      case Uint64:
        res.push(new Protocol.MethodArgumentBuilder({name: "uint64", type: 1, value: arg.value}));
        break;
      case String:
        res.push(new Protocol.MethodArgumentBuilder({name: "string", type: 2, value: arg.value}));
        break;
      case Bytes:
        res.push(new Protocol.MethodArgumentBuilder({name: "bytes", type: 3, value: arg.value}));
        break;
      default:
        throw new Error(`MethodArgument unknown type: ${arg}`);
    }
  }
  return res;
}

function methodArgumentsArray(args: MethodArgument[]): InternalMessage {
  const builders = methodArgumentsBuilders(args);
  const buf = new Protocol.MethodArgumentArrayBuilder({arguments: builders}).build();
  return new InternalMessage(buf, buf.byteLength, [FieldTypes.TypeMessageArray], []);
}

export function methodArgumentsOpaqueEncode(args: MethodArgument[]): Uint8Array {
  const msg = methodArgumentsArray(args);
  return msg.rawBufferForField(0, 0);
}