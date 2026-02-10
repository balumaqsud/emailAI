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
    toUserIds: string[];
    createdAt: string;
    conversationId: string;
  };
};

export type MailboxListResponse = {
  items: MailboxItemSummary[];
  nextCursor: string | null;
};

export type SendMailInput = {
  toNickname: string;
  subject?: string;
  bodyText: string;
};

