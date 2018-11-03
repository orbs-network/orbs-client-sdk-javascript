export enum ExecutionResult {
  EXECUTION_RESULT_SUCCESS = "SUCCESS",
  EXECUTION_RESULT_ERROR_SMART_CONTRACT = "ERROR_SMART_CONTRACT",
  EXECUTION_RESULT_ERROR_INPUT = "ERROR_INPUT",
  EXECUTION_RESULT_ERROR_UNEXPECTED = "ERROR_UNEXPECTED",
  EXECUTION_RESULT_STATE_WRITE_IN_A_CALL= "STATE_WRITE_IN_A_CALL"
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
      return ExecutionResult.EXECUTION_RESULT_ERROR_UNEXPECTED;
    case 5:
      return ExecutionResult.EXECUTION_RESULT_STATE_WRITE_IN_A_CALL;
    default:
      throw new Error(`unsupported ExecutionResult received: ${executionResult}`);
  }
}