import { z } from "zod";

const nicknameSchema = z
  .string()
  .min(3)
  .max(30)
  .regex(/^[a-zA-Z0-9_]+$/, {
    message: "Nickname must be alphanumeric and may include underscores.",
  });

export const RegisterDto = z.object({
  nickname: nicknameSchema,
  password: z.string().min(8),
  email: z.string().email().optional(),
});

export const LoginDto = z.object({
  /**
   * Identifier can be either nickname or email.
   */
  identifier: z.string().min(1),
  password: z.string().min(1),
});

export const UpdateProfileDto = z.object({
  nickname: nicknameSchema.optional(),
  email: z.string().email().optional(),
});

export type RegisterDtoInput = z.infer<typeof RegisterDto>;
export type LoginDtoInput = z.infer<typeof LoginDto>;
export type UpdateProfileDtoInput = z.infer<typeof UpdateProfileDto>;

