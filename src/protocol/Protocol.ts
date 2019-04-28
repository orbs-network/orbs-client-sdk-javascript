/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { BaseBuilder } from "./Base";
import { FieldTypes } from "../membuffers/types";

export function dateToUnixNano(date: Date): bigint {
  return BigInt(date.getTime()) * BigInt(1000000);
}

export function unixNanoToDate(timestamp: bigint): Date {
  return new Date(Number(timestamp / BigInt(1000000)));
}

export const Argument_Scheme = [FieldTypes.TypeUnion];
export const Argument_Unions = [[FieldTypes.TypeUint32, FieldTypes.TypeUint64, FieldTypes.TypeString, FieldTypes.TypeBytes]];

export class ArgumentBuilder extends BaseBuilder {
  constructor(
    private fields: {
      type: number;
      value: number | bigint | string | Uint8Array;
    },
  ) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeUnionIndex(buf, this.fields.type);
    switch (this.fields.type) {
      case 0:
        this.builder.writeUint32(buf, <number>this.fields.value);
        break;
      case 1:
        this.builder.writeUint64(buf, <bigint>this.fields.value);
        break;
      case 2:
        this.builder.writeString(buf, <string>this.fields.value);
        break;
      case 3:
        this.builder.writeBytes(buf, <Uint8Array>this.fields.value);
        break;
      default:
        throw new Error(`unknown Argument type ${this.fields.type}`);
    }
  }
}

export const ArgumentArray_Scheme = [FieldTypes.TypeMessageArray];

export class ArgumentArrayBuilder extends BaseBuilder {
  constructor(
    private fields: {
      arguments: ArgumentBuilder[];
    },
  ) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessageArray(buf, this.fields.arguments);
  }
}

export const Event_Scheme = [FieldTypes.TypeString, FieldTypes.TypeString, FieldTypes.TypeBytes];

export const EventsArray_Scheme = [FieldTypes.TypeMessageArray];

export class EdDSA01SignerBuilder extends BaseBuilder {
  constructor(
    private fields: {
      networkType: number;
      signerPublicKey: Uint8Array;
    },
  ) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeUint16(buf, this.fields.networkType);
    this.builder.writeBytes(buf, this.fields.signerPublicKey);
  }
}

export class SignerBuilder extends BaseBuilder {
  constructor(
    private fields: {
      scheme: number;
      eddsa: EdDSA01SignerBuilder;
    },
  ) {
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

export const Signer_Scheme = [FieldTypes.TypeUnion];
export const Signer_Unions = [[FieldTypes.TypeMessage, FieldTypes.TypeMessage]];

export const EdDSA01Signer_Scheme = [FieldTypes.TypeUint16, FieldTypes.TypeBytes];

export class TransactionBuilder extends BaseBuilder {
  constructor(
    private fields: {
      protocolVersion: number;
      virtualChainId: number;
      timestamp: bigint;
      signer: SignerBuilder;
      contractName: string;
      methodName: string;
      inputArgumentArray: Uint8Array;
    },
  ) {
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

export const Transaction_Scheme = [FieldTypes.TypeUint32, FieldTypes.TypeUint32, FieldTypes.TypeUint64, FieldTypes.TypeMessage, FieldTypes.TypeString, FieldTypes.TypeString, FieldTypes.TypeBytes];

export const SignedTransaction_Scheme = [FieldTypes.TypeMessage, FieldTypes.TypeBytes];

export class SignedTransactionBuilder extends BaseBuilder {
  constructor(
    private fields: {
      transaction: TransactionBuilder;
      signature: Uint8Array;
    },
  ) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessage(buf, this.fields.transaction);
    this.builder.writeBytes(buf, this.fields.signature);
  }
}

export const TransactionReceipt_Scheme = [FieldTypes.TypeBytes, FieldTypes.TypeUint16, FieldTypes.TypeBytes, FieldTypes.TypeBytes];

export class QueryBuilder extends BaseBuilder {
  constructor(
    private fields: {
      protocolVersion: number;
      virtualChainId: number;
      timestamp: bigint;
      signer: SignerBuilder;
      contractName: string;
      methodName: string;
      inputArgumentArray: Uint8Array;
    },
  ) {
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

export const SignedQuery_Scheme = [FieldTypes.TypeMessage, FieldTypes.TypeBytes];

export class SignedQueryBuilder extends BaseBuilder {
  constructor(
    private fields: {
      query: QueryBuilder;
      signature: Uint8Array;
    },
  ) {
    super();
  }
  write(buf: Uint8Array): void {
    this.builder.reset();
    this.builder.writeMessage(buf, this.fields.query);
    this.builder.writeBytes(buf, this.fields.signature);
  }
}

export const QueryResult_Scheme = [FieldTypes.TypeUint16, FieldTypes.TypeBytes, FieldTypes.TypeBytes];

export const TransactionsBlockHeader_Scheme = [FieldTypes.TypeUint32, FieldTypes.TypeUint32, FieldTypes.TypeUint64, FieldTypes.TypeBytes, FieldTypes.TypeUint64, FieldTypes.TypeBytes, FieldTypes.TypeBytes, FieldTypes.TypeUint32];

export const ResultsBlockHeader_Scheme = [
  FieldTypes.TypeUint32,
  FieldTypes.TypeUint32,
  FieldTypes.TypeUint64,
  FieldTypes.TypeBytes,
  FieldTypes.TypeUint64,
  FieldTypes.TypeBytes,
  FieldTypes.TypeBytes,
  FieldTypes.TypeBytes,
  FieldTypes.TypeBytes,
  FieldTypes.TypeUint32,
  FieldTypes.TypeUint32,
];
