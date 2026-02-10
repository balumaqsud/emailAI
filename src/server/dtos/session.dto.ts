import { z } from "zod";

export const CreateSessionDto = z.object({
  refreshTokenHash: z.string().min(1),
  deviceName: z.string().min(1).optional(),
  ip: z.string().min(1).optional(),
  userAgent: z.string().min(1).optional(),
  expiresAt: z.coerce.date(),
});

export type CreateSessionDtoInput = z.infer<typeof CreateSessionDto>;

