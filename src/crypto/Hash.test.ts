/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import "../membuffers/matcher-extensions";
import * as Hash from "./Hash";
import { getTextEncoder } from "../membuffers/text";

const someData = getTextEncoder().encode("testing");
const ExpectedSha256 = Buffer.from("cf80cd8aed482d5d1527d7dc72fceff84e6326592848447d2dc0b0e87dfc9a90", "hex");

test("CalcSha256", () => {
  const h = Hash.calcSha256(someData);
  expect(h).toBeEqualToUint8Array(ExpectedSha256);
});
