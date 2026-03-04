import express from "express";
import { Result, ValidationError } from "express-validator";
import errorLogger from "../middleware/error-logger";
import { ErrorCodes } from "../utils/error-codes";
import { NODE_ENV } from "./env";

/**
 * Gets the request ID from the response's attached request (set by request-id middleware).
 * @param res - Express response.
 * @returns The request ID string, or undefined if not set.
 */
function getRequestId(res: express.Response): string | undefined {
  return (res as express.Response & { req?: { requestId?: string } }).req
    ?.requestId;
}

/** Acronyms to show uppercase in user-facing messages (e.g. "id" -> "ID"). */
const ACRONYM_MAP: Record<string, string> = { id: "ID" };

/**
 * Formats a message for display to users: sentence case (first letter capitalized)
 * and whole-word replacements for acronyms (e.g. "id" -> "ID").
 */
export function toUserFacingMessage(message: string): string {
  if (!message || typeof message !== "string") return message;
  let out = message;
  for (const [word, replacement] of Object.entries(ACRONYM_MAP)) {
    out = out.replace(new RegExp(`\\b${word}\\b`, "gi"), replacement);
  }
  return out.charAt(0).toUpperCase() + out.slice(1);
}

/**
 * Sends a 500 JSON response for caught errors. Logs the error and includes message, code, and optional requestId.
 * In non-production, includes the error object in the response.
 * @param res - Express response.
 * @param error - The caught error.
 * @returns The Express response after sending JSON (for chaining).
 */
export const sendCatchFeedback = (res: express.Response, error: Error) => {
  const reqId = getRequestId(res);
  errorLogger.error(
    `${reqId ? `[${reqId}] ` : ""}Error: ${error.message}\nStack: ${error.stack}`,
  );
  const body: Record<string, unknown> = {
    message: error?.message || "Internal Server Error",
    code: ErrorCodes.INTERNAL_ERROR,
  };
  if (reqId) body.requestId = reqId;
  if (NODE_ENV !== "production") body.error = error;
  return res.status(500).json(body);
};

/**
 * Sends a 422 JSON response for express-validator validation errors. Uses the first error's message.
 * @param res - Express response.
 * @param errors - Result from validationResult(req).
 * @param code - Optional error code (defaults to VALIDATION_ERROR).
 * @returns The Express response after sending JSON, or undefined if no errors in array.
 */
export const sendValidationErrorFeedback = (
  res: express.Response,
  errors: Result<ValidationError>,
  code?: string,
) => {
  const errorArray = errors.array();
  if (errorArray?.length) {
    const payload: Record<string, unknown> = {
      message: toUserFacingMessage(String(errorArray[0].msg)),
      code: code || ErrorCodes.VALIDATION_ERROR,
    };
    const reqId = getRequestId(res);
    if (reqId) payload.requestId = reqId;
    return res.status(422).json(payload);
  }
};

/**
 * Sends a JSON error response with the given status and message. Merges in additionalObjects (e.g. code, requestId).
 * @param res - Express response.
 * @param status - HTTP status code (e.g. 400, 403, 404).
 * @param message - Human-readable error message.
 * @param additionalObjects - Optional object merged into the JSON body (e.g. { code: ErrorCodes.NOT_FOUND }).
 * @returns The Express response after sending JSON.
 */
export const sendErrorFeedback = (
  res: express.Response,
  status: number,
  message: string,
  additionalObjects?: Record<string, unknown>,
) => {
  const reqId = getRequestId(res);
  const payload = {
    message: toUserFacingMessage(message),
    ...additionalObjects,
  };
  if (reqId && !(additionalObjects && "requestId" in additionalObjects))
    (payload as Record<string, unknown>).requestId = reqId;
  return res.status(status).json(payload);
};

/**
 * Sends a JSON success response with message and optional extra data. Status defaults to 200.
 * @param res - Express response.
 * @param message - Success message string.
 * @param additionalObjects - Optional object merged into the JSON body (e.g. { user, token }).
 * @param status - HTTP status code (defaults to 200).
 * @returns The Express response after sending JSON.
 */
export const sendSuccessFeedback = (
  res: express.Response,
  message: string,
  additionalObjects?: Record<string, unknown>,
  status?: number,
) => {
  const reqId = getRequestId(res);
  const payload = { message, ...additionalObjects };
  if (reqId) (payload as Record<string, unknown>).requestId = reqId;
  return res.status(status || 200).json(payload);
};
