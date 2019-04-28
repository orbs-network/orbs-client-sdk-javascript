/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

export enum RequestStatus {
  REQUEST_STATUS_COMPLETED = "COMPLETED",
  REQUEST_STATUS_IN_PROCESS = "IN_PROCESS",
  REQUEST_STATUS_BAD_REQUEST = "BAD_REQUEST",
  REQUEST_STATUS_CONGESTION = "CONGESTION",
  REQUEST_STATUS_SYSTEM_ERROR = "SYSTEM_ERROR",
  REQUEST_STATUS_OUT_OF_SYNC = "OUT_OF_SYNC",
  REQUEST_STATUS_NOT_FOUND = "NOT_FOUND",
}

export function requestStatusDecode(requestStatus: number): RequestStatus {
  switch (requestStatus) {
    case 0:
      throw new Error(`reserved RequestStatus received`);
    case 1:
      return RequestStatus.REQUEST_STATUS_COMPLETED;
    case 2:
      return RequestStatus.REQUEST_STATUS_IN_PROCESS;
    case 3:
      return RequestStatus.REQUEST_STATUS_BAD_REQUEST;
    case 4:
      return RequestStatus.REQUEST_STATUS_CONGESTION;
    case 5:
      return RequestStatus.REQUEST_STATUS_SYSTEM_ERROR;
    case 6:
      return RequestStatus.REQUEST_STATUS_OUT_OF_SYNC;
    case 7:
      return RequestStatus.REQUEST_STATUS_NOT_FOUND;
    default:
      throw new Error(`unsupported RequestStatus received: ${requestStatus}`);
  }
}
