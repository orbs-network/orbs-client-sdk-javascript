/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import hash from "hash.js";

export const SHA256_HASH_SIZE_BYTES = 32;

export function calcSha256(data: Uint8Array): Uint8Array {
  const inputArr = [].slice.call(data);
  const outputArr = hash
    .sha256()
    .update(inputArr)
    .digest();
  return new Uint8Array(outputArr);
}
