# Orbs Client SDK JavaScript

> Client SDK for the Orbs blockchain in JavaScript and TypeScript for Node.js and browsers

## Installation
`$ npm install orbs-client-sdk`

## Usage (Node.js)

1. Create a few end user accounts:

   ```js
   const Orbs = require("orbs-client-sdk");
   const sender = Orbs.createAccount();
   const receiver = Orbs.createAccount();
   ```

2. Create a client instance:

   ```js
   const virtualChainId = 42;
   const client = new Orbs.Client("http://node-endpoint.com", virtualChainId, "TEST_NET");
   ```

3. Send a transaction:

   ```js
   const [tx, txId] = client.createTransaction(sender.publicKey, sender.privateKey, "BenchmarkToken", "transfer", [Orbs.argUint64(10), Orbs.argAddress(receiver.address)]);
   const response = await client.sendTransaction(tx);
   ```

4. Check the transaction status:

   ```js
   const response = await client.getTransactionStatus(txId);
   ```

5. Call a smart contract method:

   ```js
   const query = client.createQuery(receiver.publicKey, "BenchmarkToken", "getBalance", [Orbs.argAddress(receiver.address)]);
   const response = await client.sendQuery(query);
   ```

## Usage (browser)

Coming soon

## Installation (Node.js)

1. Install the NPM package:

   ```sh
   npm install orbs-client-sdk
   ```

2. Import the client in your project:

   ```js
   const Orbs = require("orbs-client-sdk");
   ```

## Installation (browser)

Coming soon

## Test

1. After running `npm install` locally, make sure folder `./contract` is created. It's needed for the contract test and cloned from the [reference implementation](https://github.com/orbs-network/orbs-client-sdk-go). The codec contract test encodes and signs all message types and compares to a [JSON file](https://github.com/orbs-network/orbs-client-sdk-go/tree/master/test/codec) containing the official result required to be compatible to the Orbs protocol specifications.

2. Build the library with `npm run build`

3. To run the end-to-end test, install [`gamma-cli`](https://github.com/orbs-network/gamma-cli)

4. Run all tests with `npm run test`
