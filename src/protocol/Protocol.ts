import { BaseBuilder } from "./Base";
import { FieldTypes } from "../membuffers/types";

export function dateToUnixNano(date: Date): BigInt {
  return BigInt(date.getTime()) * BigInt(1000000);
}

export function unixNanoToDate(timestamp: BigInt): Date {
  return new Date(Number(timestamp / BigInt(1000000)));
}

export const MethodArgument_Scheme = [FieldTypes.TypeString, FieldTypes.TypeUnion];
export const MethodArgument_Unions = [[FieldTypes.TypeUint32, FieldTypes.TypeUint64, FieldTypes.TypeString, FieldTypes.TypeBytes]];

export class MethodArgumentBuilder extends BaseBuilder {
  constructor(private fields: { name: string, type: number, value: number|BigInt|string|Uint8Array }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeString(buf, this.fields.name);
    this.builder.writeUnionIndex(buf, this.fields.type);
    switch (this.fields.type) {
      case 0:
        this.builder.writeUint32(buf, <number>this.fields.value);
        break;
      case 1:
        this.builder.writeUint64(buf, <BigInt>this.fields.value);
        break;
      case 2:
        this.builder.writeString(buf, <string>this.fields.value);
        break;
      case 3:
        this.builder.writeBytes(buf, <Uint8Array>this.fields.value);
        break;
      default:
        throw new Error(`unknown MethodArgument type ${this.fields.type}`);
    }
  }
}

export const MethodArgumentArray_Scheme = [FieldTypes.TypeMessageArray];

export class MethodArgumentArrayBuilder extends BaseBuilder {
  constructor(private fields: { arguments: MethodArgumentBuilder[] }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessageArray(buf, this.fields.arguments);
  }
}

export class EdDSA01SignerBuilder extends BaseBuilder {
  constructor(private fields: { networkType: number, signerPublicKey: Uint8Array }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeUint16(buf, this.fields.networkType);
    this.builder.writeBytes(buf, this.fields.signerPublicKey);
  }
}

export class SignerBuilder extends BaseBuilder {
  constructor(private fields: { scheme: number, eddsa: EdDSA01SignerBuilder }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeUnionIndex(buf, this.fields.scheme);
    switch (this.fields.scheme) {
      case 0:
        this.builder.writeMessage(buf, this.fields.eddsa);
        break;
      default:
        throw new Error(`unknown Signer scheme ${this.fields.scheme}`);
    }
  }
}

export class TransactionBuilder extends BaseBuilder {
  constructor(private fields: {
    protocolVersion: number,
    virtualChainId: number,
    timestamp: BigInt,
    signer: SignerBuilder,
    contractName: string,
    methodName: string,
    inputArgumentArray: Uint8Array
  }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeUint32(buf, this.fields.protocolVersion);
    this.builder.writeUint32(buf, this.fields.virtualChainId);
    this.builder.writeUint64(buf, this.fields.timestamp);
    this.builder.writeMessage(buf, this.fields.signer);
    this.builder.writeString(buf, this.fields.contractName);
    this.builder.writeString(buf, this.fields.methodName);
    this.builder.writeBytes(buf, this.fields.inputArgumentArray);
  }
}

export const SignedTransaction_Scheme = [FieldTypes.TypeMessage, FieldTypes.TypeBytes];

export class SignedTransactionBuilder extends BaseBuilder {
  constructor(private fields: { transaction: TransactionBuilder, signature: Uint8Array }) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessage(buf, this.fields.transaction);
    this.builder.writeBytes(buf, this.fields.signature);
  }
}

export const TransactionReceipt_Scheme = [FieldTypes.TypeBytes, FieldTypes.TypeUint16, FieldTypes.TypeBytes];