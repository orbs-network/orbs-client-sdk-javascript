/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

import { InternalBuilder } from "membuffers";

export abstract class BaseBuilder {
  protected builder: InternalBuilder;
  constructor() {
    this.builder = new InternalBuilder();
  }
  abstract write(buf: Uint8Array): void;
  getSize() {
    return this.builder.getSize();
  }
  calcRequiredSize() {
    this.write(null);
    return this.builder.getSize();
  }
  build() {
    const buf = new Uint8Array(this.calcRequiredSize());
    this.write(buf);
    return buf;
  }
}
