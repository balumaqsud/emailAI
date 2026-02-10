import { z } from "zod";

export const GENERAL_SCHEMA_VERSION = "general_v1";
export const GENERAL_PROMPT_VERSION = "general_v1";

export const GeneralExtractionSchema = z
  .object({
    summary: z.string().optional(),
    keyEntities: z.array(z.string()).optional(),
    dates: z.array(z.string()).optional(),
  })
  .strict();

export type GeneralExtraction = z.infer<typeof GeneralExtractionSchema>;

