/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { Client } from "./Client";
import { LocalSigner, NetworkType, createAccount } from "..";

test("multiple concurrent createTransaction with identical args have different txids", async () => {
  const NUM_TX = 10;
  
  // generate a bunch of identical transactions at the same time
  const client = new Client("http://endpoint.com", 42, NetworkType.NETWORK_TYPE_MAIN_NET, new LocalSigner(createAccount()));
  let promises = [];
  for (let i = 0; i < NUM_TX ; i++) {
    promises.push(client.createTransaction("contract1", "method1", []));
  }

  // extract their tx ids
  let txIds = [];
  const values = await Promise.all(promises);
  for (let i = 0; i < NUM_TX ; i++) {
    const [tx, txId] = values[i];
    txIds.push(txId);
  }

  // make sure all tx ids are different
  for (let i = 0; i < NUM_TX; i++) {
    for (let j = i+1; j < NUM_TX; j++) {
      expect(txIds[i]).not.toEqual(txIds[j]);
    }
  }
});

test("bumpNanoNonce is always 0 - 499,999", () => {
  const client = new Client("http://endpoint.com", 42, NetworkType.NETWORK_TYPE_MAIN_NET, new LocalSigner(createAccount()));
  for (let i = 0; i < 2000000; i++) {
    const n = client.bumpNanoNonce();
    if (n < 0 || n > 499999) throw new Error(`bumpNanoNonce returned ${n} which is not 0 - 499,999`);
  }
});