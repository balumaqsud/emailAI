import { Types } from "mongoose";
import { dbConnect } from "@/src/server/db";
import { Conversation, Mailbox, Message, User } from "@/src/server/models";
import { refreshGmailAccessToken } from "@/src/server/auth/gmail.service";

type GmailMessage = {
  id: string;
  internalDate?: string;
  snippet?: string;
  payload?: {
    headers?: Array<{ name?: string; value?: string }>;
    mimeType?: string;
    body?: { data?: string };
    parts?: GmailPart[];
  };
};

type GmailPart = {
  mimeType?: string;
  filename?: string;
  body?: { data?: string };
  parts?: GmailPart[];
  headers?: Array<{ name?: string; value?: string }>;
};

function decodeBase64Url(data: string | undefined): string {
  if (!data) return "";
  const padded = data.replace(/-/g, "+").replace(/_/g, "/");
  const buff = Buffer.from(padded, "base64");
  return buff.toString("utf8");
}

function getHeader(
  msg: GmailMessage,
  name: string,
): string | undefined {
  const headers = msg.payload?.headers ?? [];
  const found = headers.find(
    (h) => h.name?.toLowerCase() === name.toLowerCase(),
  );
  return found?.value;
}

function extractBodyParts(msg: GmailMessage): { text: string; html?: string } {
  const result: { text: string; html?: string } = { text: "" };

  function walk(part: GmailPart | undefined): void {
    if (!part) return;
    const mimeType = part.mimeType ?? "";
    if (part.body?.data) {
      const decoded = decodeBase64Url(part.body.data);
      if (mimeType === "text/plain" || mimeType.startsWith("text/plain")) {
        result.text += decoded;
      } else if (
        mimeType === "text/html" ||
        mimeType.startsWith("text/html")
      ) {
        result.html = (result.html ?? "") + decoded;
      }
    }
    if (part.parts && part.parts.length > 0) {
      part.parts.forEach((p) => walk(p));
    }
  }

  if (msg.payload) {
    walk(msg.payload);
  }

  if (!result.text && result.html) {
    // Fallback: strip basic HTML tags for text-only body.
    result.text = result.html.replace(/<[^>]+>/g, " ");
  }

  return result;
}

function normalizeSnippetFromBody(bodyText: string): string {
  const collapsed = bodyText.replace(/\s+/g, " ").trim();
  return collapsed.slice(0, 180);
}

async function ensureAccessToken(user: typeof User.prototype): Promise<string> {
  if (
    user.gmailAccessToken &&
    user.gmailTokenExpiresAt &&
    user.gmailTokenExpiresAt.getTime() > Date.now() + 60_000
  ) {
    return user.gmailAccessToken;
  }

  if (!user.gmailRefreshToken) {
    throw new Error("No Gmail refresh token available for user.");
  }

  const refreshed = await refreshGmailAccessToken(user.gmailRefreshToken);
  user.gmailAccessToken = refreshed.accessToken;
  user.gmailTokenExpiresAt = refreshed.expiresAt;
  await user.save();
  return refreshed.accessToken;
}

export async function syncGmailForUser(userId: string): Promise<{
  importedCount: number;
  updatedCount: number;
}> {
  await dbConnect();

  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found for Gmail sync.");
  }
  if (!user.gmailEmail) {
    throw new Error("User has not connected Gmail.");
  }

  const accessToken = await ensureAccessToken(user);

  // For v1, fetch a small batch of most recent messages from INBOX.
  const listRes = await fetch(
    "https://www.googleapis.com/gmail/v1/users/me/messages?maxResults=20&labelIds=INBOX",
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (!listRes.ok) {
    const text = await listRes.text();
    throw new Error(`Failed to list Gmail messages: ${text}`);
  }

  const listData = (await listRes.json()) as {
    messages?: { id: string }[];
  };

  const messageIds = listData.messages?.map((m) => m.id) ?? [];
  if (messageIds.length === 0) {
    return { importedCount: 0, updatedCount: 0 };
  }

  let importedCount = 0;
  let updatedCount = 0;

  const userObjectId = new Types.ObjectId(user._id);

  for (const id of messageIds) {
    const getRes = await fetch(
      `https://www.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(id)}?format=full`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!getRes.ok) {
      // Skip problematic messages but continue sync.
      // eslint-disable-next-line no-console
      console.error("Failed to fetch Gmail message", id, await getRes.text());
      continue;
    }

    const gm = (await getRes.json()) as GmailMessage;

    const subject = getHeader(gm, "Subject") ?? undefined;
    const dateHeader = getHeader(gm, "Date");
    const internalDateMs = gm.internalDate
      ? Number.parseInt(gm.internalDate, 10)
      : Number.NaN;
    const createdAt =
      !Number.isNaN(internalDateMs) && internalDateMs > 0
        ? new Date(internalDateMs)
        : dateHeader
          ? new Date(dateHeader)
          : new Date();

    const body = extractBodyParts(gm);
    const textBody = body.text || "(no content)";
    const snippet = gm.snippet || normalizeSnippetFromBody(textBody);

    // Ensure a dedicated Gmail conversation per message owner for now.
    const memberIds = [userObjectId];
    const memberKey = memberIds
      .map((oid) => oid.toHexString())
      .sort()
      .join(":");

    let conversation = await Conversation.findOne({ memberKey }).exec();
    if (!conversation) {
      conversation = await Conversation.create({
        type: "direct",
        memberIds,
        memberKey,
        lastMessageAt: createdAt,
      });
    }

    // Upsert Message by gmailMessageId stored in a custom field on Message.
    // For v1, we reuse snippet uniqueness scope: we can instead add a
    // dedicated field via future migration. Here we simply avoid duplicate
    // Mailbox rows per message id.

    let message = await Message.findOne({
      snippet,
      "body.text": textBody,
      senderId: userObjectId,
      conversationId: conversation._id,
    }).exec();

    if (!message) {
      message = await Message.create({
        conversationId: conversation._id,
        senderId: userObjectId,
        toUserIds: [userObjectId],
        subject,
        body: {
          textBody,
          text: textBody,
          html: body.html,
        },
        snippet,
        delivery: "delivered",
      } as unknown as Parameters<typeof Message.create>[0]);
      importedCount++;
    } else {
      updatedCount++;
    }

    const existingMailbox = await Mailbox.findOne({
      userId: userObjectId,
      messageId: message._id,
    }).exec();

    if (!existingMailbox) {
      await Mailbox.create({
        userId: userObjectId,
        messageId: message._id,
        folder: "inbox",
        isRead: false,
        flagged: false,
      });
    }

    conversation.lastMessageAt = createdAt;
    conversation.lastMessageId = message._id;
    await conversation.save();
  }

  return { importedCount, updatedCount };
}

