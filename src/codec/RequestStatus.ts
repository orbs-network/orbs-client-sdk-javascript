export enum RequestStatus {
  REQUEST_STATUS_COMPLETED = "COMPLETED",
  REQUEST_STATUS_IN_PROCESS = "IN_PROCESS",
  REQUEST_STATUS_NOT_FOUND = "NOT_FOUND",
  REQUEST_STATUS_REJECTED = "REJECTED",
  REQUEST_STATUS_CONGESTION = "CONGESTION",
  REQUEST_STATUS_SYSTEM_ERROR = "SYSTEM_ERROR"
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
      return RequestStatus.REQUEST_STATUS_NOT_FOUND;
    case 4:
      return RequestStatus.REQUEST_STATUS_REJECTED;
    case 5:
      return RequestStatus.REQUEST_STATUS_CONGESTION;
    case 6:
      return RequestStatus.REQUEST_STATUS_SYSTEM_ERROR;
    default:
      throw new Error(`unsupported RequestStatus received: ${requestStatus}`);
  }
}