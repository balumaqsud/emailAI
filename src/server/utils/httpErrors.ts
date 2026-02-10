import { ZodError } from "zod";

export class HttpError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function fromZodError(error: ZodError): HttpError {
  const firstIssue = error.issues[0];
  const message =
    firstIssue?.message ?? "Request validation failed. Please check input.";
  return new HttpError(400, "VALIDATION_ERROR", message);
}

export function unauthorized(message = "Unauthorized"): HttpError {
  return new HttpError(401, "UNAUTHORIZED", message);
}

export function notFound(message = "Not found"): HttpError {
  return new HttpError(404, "NOT_FOUND", message);
}

export function conflict(message = "Conflict"): HttpError {
  return new HttpError(409, "CONFLICT", message);
}

export function badRequest(message = "Bad request"): HttpError {
  return new HttpError(400, "BAD_REQUEST", message);
}

export function internalError(message = "Internal server error"): HttpError {
  return new HttpError(500, "INTERNAL_ERROR", message);
}

