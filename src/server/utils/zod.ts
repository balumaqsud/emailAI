import { NextApiRequest } from "next";
import { ZodSchema } from "zod";

export async function parseBody<T>(
  req: NextApiRequest,
  schema: ZodSchema<T>,
): Promise<T> {
  // Next.js automatically parses JSON body when content-type is application/json.
  const data = req.body;
  const result = await schema.safeParseAsync(data);
  if (!result.success) {
    throw Object.assign(new Error("Validation failed"), {
      status: 400,
      code: "VALIDATION_ERROR",
      issues: result.error.issues,
    });
  }
  return result.data;
}

