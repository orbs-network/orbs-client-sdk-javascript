/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

export enum NetworkType {
  NETWORK_TYPE_MAIN_NET = "MAIN_NET",
  NETWORK_TYPE_TEST_NET = "TEST_NET",
}

export function networkTypeEncode(networkType: NetworkType): number {
  switch (networkType) {
    case NetworkType.NETWORK_TYPE_MAIN_NET:
      return 77;
    case NetworkType.NETWORK_TYPE_TEST_NET:
      return 84;
    default:
      throw new Error(`unsupported network type given ${networkType}`);
  }
}
