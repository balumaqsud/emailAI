import { z } from "zod";
import { MAIL_FOLDERS } from "@/src/lib/constants/folders";

export const MoveMessageDto = z.object({
  messageId: z.string().min(1),
  folder: z.enum(MAIL_FOLDERS),
});

export const ToggleFlagDto = z.object({
  messageId: z.string().min(1),
  flagged: z.boolean(),
});

export type MoveMessageDtoInput = z.infer<typeof MoveMessageDto>;
export type ToggleFlagDtoInput = z.infer<typeof ToggleFlagDto>;

