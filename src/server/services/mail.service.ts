import mongoose, { ClientSession, Types } from "mongoose";
import {
  Conversation,
  Mailbox,
  Message,
  User,
  type IMailbox,
  type IMessage,
} from "@/src/server/models";
import {
  SendMessageDto,
  type SendMessageDtoInput,
} from "@/src/server/dtos/message.dto";
import { MAIL_FOLDERS } from "@/src/lib/constants/folders";
import { encodeCursor, decodeCursor } from "@/src/server/utils/pagination";
import {
  HttpError,
  badRequest,
  notFound,
} from "@/src/server/utils/httpErrors";
import { getOrCreateDirectConversation } from "./conversation.service";

export type SendMailResult = {
  messageId: string;
  conversationId: string;
};

export type ListMailItem = {
  mailboxId: string;
  messageId: string;
  folder: (typeof MAIL_FOLDERS)[number];
  isRead: boolean;
  createdAt: string;
  message: {
    subject?: string;
    snippet: string;
    senderId: string;
    toUserIds: string[];
    createdAt: string;
    conversationId: string;
  };
};

export type ListMailResult = {
  items: ListMailItem[];
  nextCursor: string | null;
};

function normalizeSnippet(bodyText: string): string {
  const collapsed = bodyText.replace(/\s+/g, " ").trim();
  return collapsed.slice(0, 180);
}

export async function sendMail(params: {
  senderId: string;
  payload: SendMessageDtoInput;
}): Promise<SendMailResult> {
  const { senderId, payload } = params;

  const validated = SendMessageDto.parse(payload);

  const senderObjectId = new Types.ObjectId(senderId);

  const session: ClientSession = await mongoose.startSession();

  try {
    let result: SendMailResult | null = null;

    await session.withTransaction(async () => {
      const sender = await User.findById(senderObjectId)
        .session(session)
        .exec();
      if (!sender) {
        throw notFound("Sender not found.");
      }

      let recipientId: Types.ObjectId | null = null;

      if (validated.toUserId) {
        const recipient = await User.findById(validated.toUserId)
          .session(session)
          .exec();
        if (!recipient) {
          throw notFound("Recipient not found.");
        }
        recipientId = recipient._id;
      } else if (validated.toNickname) {
        const nicknameLower = validated.toNickname.toLowerCase();
        const recipient = await User.findOne({ nickname: nicknameLower })
          .session(session)
          .exec();
        if (!recipient) {
          throw notFound("Recipient not found.");
        }
        recipientId = recipient._id;
      } else {
        throw badRequest("Recipient is required.");
      }

      if (!recipientId) {
        throw badRequest("Recipient is required.");
      }

      if (recipientId.equals(senderObjectId)) {
        throw badRequest("You cannot send a message to yourself.");
      }

      const conversation = await getOrCreateDirectConversation({
        memberAId: senderObjectId,
        memberBId: recipientId,
        session,
      });

      const snippet = normalizeSnippet(validated.bodyText);

      const [message] = await Message.create(
        [
          {
            conversationId: conversation._id,
            senderId: senderObjectId,
            toUserIds: [recipientId],
            subject: validated.subject,
            body: {
              text: validated.bodyText,
            },
            snippet,
          },
        ],
        { session },
      );

      await Mailbox.insertMany(
        [
          {
            userId: senderObjectId,
            messageId: message._id,
            folder: "sent",
            isRead: true,
            flagged: false,
          },
          {
            userId: recipientId,
            messageId: message._id,
            folder: "inbox",
            isRead: false,
            flagged: false,
          },
        ],
        { session },
      );

      await Conversation.updateOne(
        { _id: conversation._id },
        {
          $set: {
            lastMessageAt: message.createdAt,
            lastMessageId: message._id,
          },
        },
        { session },
      );

      result = {
        messageId: message._id.toHexString(),
        conversationId: conversation._id.toHexString(),
      };
    });

    if (!result) {
      throw new HttpError(
        500,
        "INTERNAL_ERROR",
        "Failed to send message transactionally.",
      );
    }

    return result;
  } finally {
    session.endSession();
  }
}

type MailboxWithMessage = IMailbox & { messageId: IMessage };

export async function listMail(params: {
  userId: string;
  folder: (typeof MAIL_FOLDERS)[number];
  limit: number;
  cursor?: string | null;
}): Promise<ListMailResult> {
  const { userId, folder, limit, cursor } = params;

  const effectiveLimit = Math.max(1, Math.min(limit, 50));
  const userObjectId = new Types.ObjectId(userId);

  const query: Record<string, unknown> = {
    userId: userObjectId,
    folder,
  };

  if (cursor) {
    const decoded = decodeCursor(cursor);
    if (!decoded) {
      throw badRequest("Invalid cursor.");
    }
    query.$or = [
      { createdAt: { $lt: decoded.createdAt } },
      { createdAt: decoded.createdAt, _id: { $lt: decoded.id } },
    ];
  }

  const docs = await Mailbox.find(query)
    .sort({ createdAt: -1, _id: -1 })
    .limit(effectiveLimit + 1)
    .populate<{ messageId: IMessage }>("messageId")
    .exec();

  const castDocs = docs as unknown as MailboxWithMessage[];

  const hasMore = castDocs.length > effectiveLimit;
  const pageDocs = hasMore ? castDocs.slice(0, effectiveLimit) : castDocs;

  const items: ListMailItem[] = pageDocs.map((mb) => {
    const msg = mb.messageId;
    return {
      mailboxId: mb._id.toHexString(),
      messageId: msg._id.toHexString(),
      folder: mb.folder,
      isRead: mb.isRead,
      createdAt: mb.createdAt.toISOString(),
      message: {
        subject: msg.subject,
        snippet: msg.snippet,
        senderId: msg.senderId.toHexString(),
        toUserIds: msg.toUserIds.map((id) => id.toHexString()),
        createdAt: msg.createdAt.toISOString(),
        conversationId: msg.conversationId.toHexString(),
      },
    };
  });

  let nextCursor: string | null = null;
  if (hasMore) {
    const last = pageDocs[pageDocs.length - 1];
    nextCursor = encodeCursor(last.createdAt, last._id);
  }

  return { items, nextCursor };
}

export async function getMessageForUser(params: {
  userId: string;
  messageId: string;
}): Promise<{
  messageId: string;
  conversationId: string;
  subject?: string;
  body: IMessage["body"];
  attachments?: IMessage["attachments"];
  senderId: string;
  toUserIds: string[];
  createdAt: string;
  delivery: IMessage["delivery"];
}> {
  const { userId, messageId } = params;

  const userObjectId = new Types.ObjectId(userId);
  const messageObjectId = new Types.ObjectId(messageId);

  const mailbox = await Mailbox.findOne({
    userId: userObjectId,
    messageId: messageObjectId,
  }).exec();

  if (!mailbox) {
    throw notFound("Message not found.");
  }

  const message = await Message.findById(messageObjectId).exec();
  if (!message) {
    throw notFound("Message not found.");
  }

  return {
    messageId: message._id.toHexString(),
    conversationId: message.conversationId.toHexString(),
    subject: message.subject,
    body: message.body,
    attachments: message.attachments,
    senderId: message.senderId.toHexString(),
    toUserIds: message.toUserIds.map((id) => id.toHexString()),
    createdAt: message.createdAt.toISOString(),
    delivery: message.delivery,
  };
}

export async function setReadStatus(params: {
  userId: string;
  messageId: string;
  isRead: boolean;
}): Promise<void> {
  const { userId, messageId, isRead } = params;

  const userObjectId = new Types.ObjectId(userId);
  const messageObjectId = new Types.ObjectId(messageId);

  const mailbox = await Mailbox.findOne({
    userId: userObjectId,
    messageId: messageObjectId,
  }).exec();

  if (!mailbox) {
    throw notFound("Message not found.");
  }

  mailbox.isRead = isRead;
  await mailbox.save();

  if (isRead) {
    await Message.updateOne(
      { _id: messageObjectId },
      {
        $pull: { readBy: { userId: userObjectId } },
        $push: { readBy: { userId: userObjectId, readAt: new Date() } },
      },
    ).exec();
  } else {
    await Message.updateOne(
      { _id: messageObjectId },
      { $pull: { readBy: { userId: userObjectId } } },
    ).exec();
  }
}

export async function moveMessage(params: {
  userId: string;
  messageId: string;
  folder: (typeof MAIL_FOLDERS)[number];
}): Promise<void> {
  const { userId, messageId, folder } = params;

  const userObjectId = new Types.ObjectId(userId);
  const messageObjectId = new Types.ObjectId(messageId);

  const mailbox = await Mailbox.findOne({
    userId: userObjectId,
    messageId: messageObjectId,
  }).exec();

  if (!mailbox) {
    throw notFound("Message not found.");
  }

  mailbox.folder = folder;
  await mailbox.save();
}

export async function deleteForUser(params: {
  userId: string;
  messageId: string;
}): Promise<void> {
  const { userId, messageId } = params;

  const userObjectId = new Types.ObjectId(userId);
  const messageObjectId = new Types.ObjectId(messageId);

  const deletedMailbox = await Mailbox.findOneAndDelete({
    userId: userObjectId,
    messageId: messageObjectId,
  }).exec();

  if (!deletedMailbox) {
    throw notFound("Message not found.");
  }

  const remaining = await Mailbox.countDocuments({
    messageId: messageObjectId,
  }).exec();

  if (remaining === 0) {
    await Message.deleteOne({ _id: messageObjectId }).exec();
  }
}

