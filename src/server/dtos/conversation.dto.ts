import { z } from "zod";

// Single direct conversation with one other member.
export const CreateDirectConversationDto = z.object({
  memberId: z.string().min(1), // string ObjectId
});

export type CreateDirectConversationDtoInput = z.infer<
  typeof CreateDirectConversationDto
>;

