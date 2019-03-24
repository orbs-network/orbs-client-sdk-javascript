/**
 * Copyright 2019 the orbs-client-sdk-javascript authors
 * This file is part of the orbs-client-sdk-javascript library in the Orbs project.
 *
 * This source code is licensed under the MIT license found in the LICENSE file in the root directory of this source tree.
 * The above notice should be included in all copies or substantial portions of the software.
 */

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
