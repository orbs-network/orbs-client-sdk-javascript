/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import * as Encoding from "../crypto/Encoding";
import { NetworkType } from "../codec/NetworkType";
import { Argument, argString, argUint32, argBytes } from "../codec/Arguments";
import { decodeSendTransactionResponse, encodeSendTransactionRequest, SendTransactionResponse } from "../codec/OpSendTransaction";
import { RunQueryResponse, decodeRunQueryResponse, encodeRunQueryRequest } from "../codec/OpRunQuery";
import { decodeGetTransactionStatusResponse, encodeGetTransactionStatusRequest, GetTransactionStatusResponse } from "../codec/OpGetTransactionStatus";
import { decodeGetTransactionReceiptProofResponse, encodeGetTransactionReceiptProofRequest, GetTransactionReceiptProofResponse } from "../codec/OpGetTransactionReceiptProof";
import { decodeGetBlockResponse, encodeGetBlockRequest, GetBlockResponse } from "../codec/OpGetBlock";
import axios, { AxiosResponse } from "axios";
import { Signer } from "../crypto/Signer";
import { getTextDecoder } from "membuffers";

const PROTOCOL_VERSION = 1;
const CONTENT_TYPE_MEMBUFFERS = "application/membuffers";
const SEND_TRANSACTION_URL = "/api/v1/send-transaction";
const RUN_QUERY_URL = "/api/v1/run-query";
const GET_TRANSACTION_STATUS_URL = "/api/v1/get-transaction-status";
const GET_TRANSACTION_RECEIPT_PROOF_URL = "/api/v1/get-transaction-receipt-proof";
const GET_BLOCK_URL = "/api/v1/get-block";

export const PROCESSOR_TYPE_NATIVE = 1;
export const PROCESSOR_TYPE_JAVASCRIPT = 2;

export class Client {
  private nextNanoNonce: number;

  constructor(private endpoint: string, private virtualChainId: number, private networkType: NetworkType, private signer: Signer) {
    this.nextNanoNonce = 0;
  }

  bumpNanoNonce(): number {
    const res = this.nextNanoNonce;
    this.nextNanoNonce++;
    if (this.nextNanoNonce > 499999) this.nextNanoNonce = 0;
    return res;
  }

  async createTransaction(contractName: string, methodName: string, inputArguments: Argument[]): Promise<[Uint8Array, string]> {
    const [req, rawTxId] = await encodeSendTransactionRequest(
      {
        protocolVersion: PROTOCOL_VERSION,
        virtualChainId: this.virtualChainId,
        timestamp: new Date(),
        nanoNonce: this.bumpNanoNonce(),
        networkType: this.networkType,
        contractName: contractName,
        methodName: methodName,
        inputArguments: inputArguments,
      },
      this.signer,
    );
    return [req, Encoding.encodeHex(rawTxId)];
  }

  async createDeployTransaction(contractName: string, processorType: number, ...sources: Uint8Array[]): Promise<[Uint8Array, string]> {
    const inputArguments: Argument[] = [
      argString(contractName),
      argUint32(processorType),
      ...sources.map(argBytes)
    ];

    return this.createTransaction("_Deployments", "deployService", inputArguments);
  }

  async createQuery(contractName: string, methodName: string, inputArguments: Argument[]): Promise<Uint8Array> {
    return encodeRunQueryRequest({
      protocolVersion: PROTOCOL_VERSION,
      virtualChainId: this.virtualChainId,
      timestamp: new Date(),
      networkType: this.networkType,
      contractName: contractName,
      methodName: methodName,
      inputArguments: inputArguments,
    }, this.signer);
  }

  protected createGetTransactionStatusPayload(txId: string): Uint8Array {
    const rawTxId = Encoding.decodeHex(txId);
    return encodeGetTransactionStatusRequest({
      protocolVersion: PROTOCOL_VERSION,
      virtualChainId: this.virtualChainId,
      txId: rawTxId,
    });
  }

  protected createGetTransactionReceiptProofPayload(txId: string): Uint8Array {
    const rawTxId = Encoding.decodeHex(txId);
    return encodeGetTransactionReceiptProofRequest({
      protocolVersion: PROTOCOL_VERSION,
      virtualChainId: this.virtualChainId,
      txId: rawTxId,
    });
  }

  protected createGetBlockPayload(blockHeight: bigint): Uint8Array {
    return encodeGetBlockRequest({
      protocolVersion: PROTOCOL_VERSION,
      virtualChainId: this.virtualChainId,
      blockHeight: blockHeight,
    });
  }

  async sendTransaction(rawTransaction: Uint8Array): Promise<SendTransactionResponse> {
    const res = await this.sendHttpPost(SEND_TRANSACTION_URL, rawTransaction);
    return decodeSendTransactionResponse(res);
  }

  async sendQuery(rawQuery: Uint8Array): Promise<RunQueryResponse> {
    const res = await this.sendHttpPost(RUN_QUERY_URL, rawQuery);
    return decodeRunQueryResponse(res);
  }

  async getTransactionStatus(txId: string): Promise<GetTransactionStatusResponse> {
    const payload = this.createGetTransactionStatusPayload(txId);
    const res = await this.sendHttpPost(GET_TRANSACTION_STATUS_URL, payload);
    return decodeGetTransactionStatusResponse(res);
  }

  async getTransactionReceiptProof(txId: string): Promise<GetTransactionReceiptProofResponse> {
    const payload = this.createGetTransactionReceiptProofPayload(txId);
    const res = await this.sendHttpPost(GET_TRANSACTION_RECEIPT_PROOF_URL, payload);
    return decodeGetTransactionReceiptProofResponse(res);
  }

  async getBlock(blockHeight: bigint): Promise<GetBlockResponse> {
    const payload = this.createGetBlockPayload(blockHeight);
    const res = await this.sendHttpPost(GET_BLOCK_URL, payload);
    return decodeGetBlockResponse(res);
  }

  private async sendHttpPost(relativeUrl: string, payload: Uint8Array): Promise<Uint8Array> {
    if (!payload || payload.byteLength == 0) {
      throw new Error(`payload sent by http is empty`);
    }

    const res = await axios.post<Uint8Array>(this.endpoint + relativeUrl, payload, {
      headers: { "content-type": CONTENT_TYPE_MEMBUFFERS },
      responseType: "arraybuffer",
      validateStatus: status => true,
    });

    // check if we have the content type response we expect
    const contentType = res.headers["content-type"];
    if (contentType != CONTENT_TYPE_MEMBUFFERS) {
      if (contentType == "text/plain" || contentType == "application/json" || contentType == "text/html") {
        throw new Error(`http request failed: ${getTextDecoder().decode(res.data)}`);
      } else {
        throw new Error(`http request failed with unexpected Content-Type '${contentType}'`);
      }
    }

    if (!res.data) {
      throw new Error(`no response data available, http status: ${res.status} ${res.statusText}`);
    }

    if (res.data.constructor === ArrayBuffer) {
      return new Uint8Array(res.data);
    }

    return res.data;
  }
}
