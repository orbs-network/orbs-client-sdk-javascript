/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import "../membuffers/matcher-extensions";
import * as Keys from "./Keys";

test("GenerateEd25519", () => {
  const keyPair1 = Keys.generateEd25519Key();
  console.log("pair1:", Buffer.from(keyPair1.privateKey).toString("hex"));
  expect(keyPair1.publicKey.byteLength).toBe(Keys.ED25519_PUBLIC_KEY_SIZE_BYTES);
  expect(keyPair1.privateKey.byteLength).toBe(Keys.ED25519_PRIVATE_KEY_SIZE_BYTES);

  const keyPair2 = Keys.generateEd25519Key();
  console.log("pair2:", Buffer.from(keyPair2.privateKey).toString("hex"));
  expect(keyPair1.privateKey).not.toBeEqualToUint8Array(keyPair2.privateKey);
});
