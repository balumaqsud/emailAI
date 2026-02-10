import { ClientSession, Types } from "mongoose";
import { Conversation, type IConversation } from "@/src/server/models";

export async function getOrCreateDirectConversation(params: {
  memberAId: Types.ObjectId;
  memberBId: Types.ObjectId;
  session?: ClientSession;
}): Promise<IConversation> {
  const { memberAId, memberBId, session } = params;

  const memberIdsSorted = [memberAId.toHexString(), memberBId.toHexString()]
    .sort()
    .map((id) => new Types.ObjectId(id));

  const memberKey = memberIdsSorted.map((id) => id.toHexString()).join(":");

  const baseQuery = Conversation.findOne({ memberKey });
  const existing = session ? await baseQuery.session(session) : await baseQuery;

  if (existing) {
    return existing;
  }

  const createdDocs = await Conversation.create(
    [
      {
        type: "direct",
        memberIds: memberIdsSorted,
        memberKey,
      },
    ],
    session ? { session } : undefined,
  );

  return createdDocs[0];
}

