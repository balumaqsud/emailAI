import { z } from "zod";

export const SendMessageDto = z
  .object({
    toUserId: z.string().min(1).optional(),
    toNickname: z.string().min(1).optional(),
    subject: z.string().max(200).optional(),
    bodyText: z.string().min(1).max(10_000),
  })
  .refine(
    (data) => Boolean(data.toUserId) !== Boolean(data.toNickname) || false,
    {
      message: "Provide exactly one of toUserId or toNickname.",
      path: ["toUserId"],
    },
  );

export const MarkReadDto = z.object({
  isRead: z.boolean(),
});

export type SendMessageDtoInput = z.infer<typeof SendMessageDto>;
export type MarkReadDtoInput = z.infer<typeof MarkReadDto>;

