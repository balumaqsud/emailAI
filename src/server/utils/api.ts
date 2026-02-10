import type { NextApiRequest, NextApiResponse } from "next";

export interface ApiErrorShape {
  status: number;
  code: string;
  message: string;
}

export class ApiError extends Error implements ApiErrorShape {
  status: number;
  code: string;

  constructor(params: { status: number; code: string; message: string }) {
    super(params.message);
    this.status = params.status;
    this.code = params.code;
  }
}

export function assertMethod(
  req: NextApiRequest,
  allowed: ("GET" | "POST" | "PUT" | "PATCH" | "DELETE")[],
): void {
  if (!allowed.includes(req.method as typeof allowed[number])) {
    throw new ApiError({
      status: 405,
      code: "METHOD_NOT_ALLOWED",
      message: "Method not allowed",
    });
  }
}

export function sendJson<T>(
  res: NextApiResponse,
  status: number,
  body: T,
): void {
  res.status(status).json(body);
}

export function handleApiError(
  res: NextApiResponse,
  error: unknown,
): void {
  // Zod/validation-style error with embedded status/code
  if (
    error &&
    typeof error === "object" &&
    "status" in error &&
    "code" in error &&
    "message" in error
  ) {
    const err = error as ApiErrorShape;
    sendJson(res, err.status, {
      ok: false,
      error: { code: err.code, message: err.message },
    });
    return;
  }

  if (error instanceof ApiError) {
    sendJson(res, error.status, {
      ok: false,
      error: { code: error.code, message: error.message },
    });
    return;
  }

  // Fallback 500
  // eslint-disable-next-line no-console
  console.error("Unhandled API error:", error);
  sendJson(res, 500, {
    ok: false,
    error: { code: "INTERNAL_SERVER_ERROR", message: "Something went wrong." },
  });
}

