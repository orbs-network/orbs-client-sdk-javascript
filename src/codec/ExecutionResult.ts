export enum ExecutionResult {
  EXECUTION_RESULT_SUCCESS = "SUCCESS",
  EXECUTION_RESULT_ERROR_SMART_CONTRACT = "ERROR_SMART_CONTRACT",
  EXECUTION_RESULT_ERROR_INPUT = "ERROR_INPUT",
  EXECUTION_RESULT_ERROR_CONTRACT_NOT_DEPLOYED = "ERROR_CONTRACT_NOT_DEPLOYED",
  EXECUTION_RESULT_ERROR_UNEXPECTED = "ERROR_UNEXPECTED",
  EXECUTION_RESULT_NOT_EXECUTED = "NOT_EXECUTED",
}

export function executionResultDecode(executionResult: number): ExecutionResult {
  switch (executionResult) {
    case 0:
      throw new Error(`reserved ExecutionResult received`);
    case 1:
      return ExecutionResult.EXECUTION_RESULT_SUCCESS;
    case 2:
      return ExecutionResult.EXECUTION_RESULT_ERROR_SMART_CONTRACT;
    case 3:
      return ExecutionResult.EXECUTION_RESULT_ERROR_INPUT;
    case 4:
      return ExecutionResult.EXECUTION_RESULT_ERROR_CONTRACT_NOT_DEPLOYED;
    case 5:
      return ExecutionResult.EXECUTION_RESULT_ERROR_UNEXPECTED;
    case 6:
      return ExecutionResult.EXECUTION_RESULT_NOT_EXECUTED;
    default:
      throw new Error(`unsupported ExecutionResult received: ${executionResult}`);
  }
}
