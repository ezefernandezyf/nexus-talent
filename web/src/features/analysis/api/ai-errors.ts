export const AI_ERROR_CODES = {
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  TRANSIENT_FAILURE: "TRANSIENT_FAILURE",
  PERMANENT_FAILURE: "PERMANENT_FAILURE",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type AIErrorCode = (typeof AI_ERROR_CODES)[keyof typeof AI_ERROR_CODES];

interface CreateAIOrchestratorErrorOptions {
  cause?: unknown;
  details?: unknown;
  retryable?: boolean;
  status?: number;
}

export class AIOrchestratorError extends Error {
  code: AIErrorCode;
  details?: unknown;
  retryable: boolean;
  status?: number;

  constructor(code: AIErrorCode, message: string, options: CreateAIOrchestratorErrorOptions = {}) {
    super(message);
    this.name = "AIOrchestratorError";
    this.code = code;
    this.cause = options.cause;
    this.details = options.details;
    this.retryable = options.retryable ?? code === AI_ERROR_CODES.TRANSIENT_FAILURE;
    this.status = options.status;
  }
}

export function createAIOrchestratorError(code: AIErrorCode, message: string, options: CreateAIOrchestratorErrorOptions = {}) {
  return new AIOrchestratorError(code, message, options);
}

export function isAIOrchestratorError(value: unknown): value is AIOrchestratorError {
  return value instanceof AIOrchestratorError;
}