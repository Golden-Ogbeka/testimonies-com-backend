/**
 * Machine-readable error codes for API responses. Use these in sendErrorFeedback/sendCatchFeedback.
 */
export const ErrorCodes = {
  // Auth
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  INVALID_OR_EXPIRED_OTP: "INVALID_OR_EXPIRED_OTP",
  API_KEY_REQUIRED: "API_KEY_REQUIRED",
  INVALID_API_KEY: "INVALID_API_KEY",
  UNAUTHORIZED: "UNAUTHORIZED",
  ACCESS_DENIED: "ACCESS_DENIED",

  // Validation
  VALIDATION_ERROR: "VALIDATION_ERROR",

  // Resources
  NOT_FOUND: "NOT_FOUND",
  ALREADY_EXISTS: "ALREADY_EXISTS",

  // Server
  INTERNAL_ERROR: "INTERNAL_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
