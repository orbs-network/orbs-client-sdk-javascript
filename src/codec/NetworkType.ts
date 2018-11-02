export enum NetworkType {
  NETWORK_TYPE_MAIN_NET = "MAIN_NET",
  NETWORK_TYPE_TEST_NET = "TEST_NET"
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