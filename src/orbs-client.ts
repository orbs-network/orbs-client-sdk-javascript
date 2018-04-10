import { delay } from "bluebird";

import { Transaction, UniversalAddress, SendTransactionOutput } from "orbs-interfaces";
import PublicApiConnection from "./public-api-connection";
import * as request from "request-promise";

export class OrbsClient {
  private endpoint: string;
  private senderAddress: string;
  private sendTransactionTimeoutMs: number;

  constructor(endpoint: string, senderAddress: string, sendTransactionTimeoutMs = 5000) {
    this.senderAddress = senderAddress;
    this.endpoint = endpoint;
    this.sendTransactionTimeoutMs = sendTransactionTimeoutMs;
  }

  async sendTransaction(contractAddress: string, payload: string): Promise<SendTransactionOutput> {
    const transaction = this.generateTransaction(contractAddress, payload);

    const res = await request.post({
      url: `${this.endpoint}/public/sendTransaction`,
      body: { transaction },
      json: true
    });
    await delay(this.sendTransactionTimeoutMs);
    return res;
  }

  async call(contractAddress: string, payload: string) {
    const body = await request.post({
      url: `${this.endpoint}/public/callContract`,
      body: {
        sender: this.getSenderAddress(),
        contractAddress: {address: contractAddress},
        payload: payload
      },
      json: true
    });

    return JSON.parse(body.resultJson);
  }

  public generateTransaction(contractAddress: string, payload: string, timestamp: number = Date.now()): Transaction {
    return {
      header: {
        version: 0,
        sender: this.getSenderAddress(),
        timestamp: timestamp.toString()
      },
      body: {
        contractAddress: {address: contractAddress},
        payload: payload
      },
    };
  }

  public getSenderAddress(): UniversalAddress {
    if (this.senderAddress == undefined) {
      throw new Error("sender address is not set");
    }
    // temporary hacky mapping
    return {id: new Buffer(this.senderAddress), scheme: 0, networkId: 0, checksum: 0 };
  }
 }
