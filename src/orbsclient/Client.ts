import { NetworkType } from "../codec/NetworkType";
import { MethodArgument } from "../codec/MethodArguments";
import { decodeSendTransactionResponse, encodeSendTransactionRequest, SendTransactionResponse } from "../codec/OpSendTransaction";
import * as Base58 from "../crypto/Base58";
import { CallMethodResponse, decodeCallMethodResponse, encodeCallMethodRequest } from "../codec/OpCallMethod";
import { decodeGetTransactionStatusResponse, encodeGetTransactionStatusRequest, GetTransactionStatusResponse } from "../codec/OpGetTransactionStatus";
import axios, { AxiosResponse } from "axios";

const PROTOCOL_VERSION = 1;
const CONTENT_TYPE = "application/membuffers";
const SEND_TRANSACTION_URL       = "/api/v1/send-transaction";
const CALL_METHOD_URL            = "/api/v1/call-method";
const GET_TRANSACTION_STATUS_URL = "/api/v1/get-transaction-status";

export class Client {

  constructor(private endpoint: string, private virtualChainId: number, private networkType: NetworkType) {}

  createSendTransactionPayload(publicKey: Uint8Array, privateKey: Uint8Array, contractName: string, methodName: string, inputArguments: MethodArgument[]): [Uint8Array, string] {
    const [req, rawTxId] = encodeSendTransactionRequest({
      protocolVersion: PROTOCOL_VERSION,
      virtualChainId: this.virtualChainId,
      timestamp: new Date(),
      networkType: this.networkType,
      publicKey: publicKey,
      contractName: contractName,
      methodName: methodName,
      inputArguments: inputArguments
    }, privateKey);
    return [req, Base58.encode(rawTxId)];
  }

  createCallMethodPayload(publicKey: Uint8Array, contractName: string, methodName: string, inputArguments: MethodArgument[]): Uint8Array {
    return encodeCallMethodRequest({
      protocolVersion: PROTOCOL_VERSION,
      virtualChainId: this.virtualChainId,
      timestamp: new Date(),
      networkType: this.networkType,
      publicKey: publicKey,
      contractName: contractName,
      methodName: methodName,
      inputArguments: inputArguments
    });
  }

  createGetTransactionStatusPayload(txId: string): Uint8Array {
    const rawTxId = Base58.decode(txId);
    return encodeGetTransactionStatusRequest({
      txId: rawTxId
    });
  }

  async sendTransaction(payload: Uint8Array): Promise<SendTransactionResponse> {
    const res = await this.sendHttpPost(SEND_TRANSACTION_URL, payload);
    return decodeSendTransactionResponse(res.data);
  }

  async callMethod(payload: Uint8Array): Promise<CallMethodResponse> {
    const res = await this.sendHttpPost(CALL_METHOD_URL, payload);
    return decodeCallMethodResponse(res.data);
  }

  async getTransactionStatus(payload: Uint8Array): Promise<GetTransactionStatusResponse> {
    const res = await this.sendHttpPost(GET_TRANSACTION_STATUS_URL, payload);
    return decodeGetTransactionStatusResponse(res.data);
  }

  private async sendHttpPost(relativeUrl: string, payload: Uint8Array): Promise<AxiosResponse> {
    if (!payload || payload.byteLength == 0) {
      throw new Error(`payload sent by http is empty`);
    }
    const res = await axios.post(this.endpoint + relativeUrl, payload, {
      headers: { "Content-Type": CONTENT_TYPE } , responseType: "arraybuffer"
    });
    if (!res.data) {
      throw new Error(`no response data available, http status: ${res.status}, ${res.statusText}`);
    }
    return res;
  }

}