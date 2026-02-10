export const MAIL_FOLDERS = ["inbox", "sent", "archive", "trash"] as const;

export type MailFolder = (typeof MAIL_FOLDERS)[number];

