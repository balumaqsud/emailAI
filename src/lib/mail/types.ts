import { MAIL_FOLDERS } from "@/src/lib/constants/folders";

export type MailFolder = (typeof MAIL_FOLDERS)[number];

export type MailboxItemSummary = {
  mailboxId: string;
  messageId: string;
  folder: MailFolder;
  isRead: boolean;
  createdAt: string;
  message: {
    subject?: string;
    snippet: string;
    senderId: string;
    senderNickname?: string;
    toUserIds: string[];
    createdAt: string;
    conversationId: string;
  };
};

export type MailboxListResponse = {
  items: MailboxItemSummary[];
  nextCursor: string | null;
};

export type MailMessageDetail = {
  messageId: string;
  conversationId: string;
  subject?: string;
  body: {
    text: string;
    html?: string;
  };
  attachments?: {
    filename: string;
    mimeType: string;
    size: number;
    storageKey: string;
  }[];
  senderId: string;
  senderNickname?: string;
  toUserIds: string[];
  createdAt: string;
  delivery: "sent" | "delivered" | "failed";
};

export type SendMailInput = {
  toNickname: string;
  subject?: string;
  bodyText: string;
};

export type EmailAnalysis = {
  type: string;
  extractedData: Record<string, unknown> | null;
  confidence: number;
} | null;
