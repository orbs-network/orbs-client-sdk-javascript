export { createAccount, addressToBytes, bytesToAddress } from "./orbs/Account";
export { Client } from "./orbs/Client";
export { ArgUint32, ArgUint64, ArgString, ArgBytes } from "./codec/Arguments";

import { addressToBytes } from "./orbs/Account";
import { ArgBytes } from "./codec/Arguments";

export class ArgAddress extends ArgBytes {
  constructor(address: string) {
    super(addressToBytes(address));
  }
}
