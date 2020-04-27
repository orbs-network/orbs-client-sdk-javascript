# Orbs Client SDK JavaScript

> Client SDK for the Orbs blockchain in JavaScript and TypeScript for Node.js and browsers

This page describes SDK API `v2.0.0`, for upgrade from `v1.x` please [follow the instructions](https://github.com/orbs-network/orbs-client-sdk-javascript/pull/21).

## Installation

### Node.js

1. Install the NPM package:

   ```sh
   npm install orbs-client-sdk
   ```

2. Import the client in your project

   ```js
   const Orbs = require("orbs-client-sdk");
   ```

### Browser

1. Install via NPM package:


   ```sh
   npm install orbs-client-sdk
   ```

2. Import the client in your project

   ```js
   import { createAccount, Client } from 'orbs-client-sdk'
   ```

## Usage

1. Create a few end user accounts:

   ```js
   const Orbs = require("orbs-client-sdk");
   const sender = Orbs.createAccount();
   const receiver = Orbs.createAccount();
   ```

2. Create a client instance:

   ```js
   const virtualChainId = 42;
   const client = new Orbs.Client("http://node-endpoint.com", virtualChainId, "TEST_NET", new Orbs.LocalSigner(sender));
   ```

3. Send a transaction:

   ```js
   const [tx, txId] = await client.createTransaction( "BenchmarkToken", "transfer", [Orbs.argUint64(10), Orbs.argAddress(receiver.address)]);
   const response = await client.sendTransaction(tx);
   ```

4. Check the transaction status:

   ```js
   const response = await client.getTransactionStatus(txId);
   ```

5. Deploy a smart contract:

   ```js
   // Load the content of the contract file(s) that we want to deploy
   // NOTE : These two file are part of the same contract. 
   const sources = [
         readFileSync(`${__dirname}/../contract/increment_base.go`),
         readFileSync(`${__dirname}/../contract/increment_functions.go`)
   ];

   // Build The deployment query
   // Notice that in this case the contract's name will be "Inc"
   const [deploymentTx, deploymentTxId] = await client.createDeployTransaction("Inc", Orbs.PROCESSOR_TYPE_NATIVE, ...sources);

   // Execute the deployment query
   const deploymentResponse = await client.sendTransaction(deploymentTx);
   ```

6. Call a smart contract method:

   ```js
   const query = await client.createQuery("BenchmarkToken", "getBalance", [Orbs.argAddress(receiver.address)]);
   const response = await client.sendQuery(query);
   ```

## Test

1. After running `npm install` locally, make sure folder `./contract` is created. It's needed for the contract test and cloned from the [reference implementation](https://github.com/orbs-network/orbs-client-sdk-go). The codec contract test encodes and signs all message types and compares to a [JSON file](https://github.com/orbs-network/orbs-client-sdk-go/tree/master/test/codec) containing the official result required to be compatible to the Orbs protocol specifications.

2. Build the library with `npm run build`

3. To run the end-to-end test, install [`gamma-cli`](https://github.com/orbs-network/gamma-cli)

4. Run all tests (unit and e2e) with `npm run test`
