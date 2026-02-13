export type MeetingListItem = {
  id: string;
  title: string;
  startAt: string;
  endAt: string;
  timezone: string;
  status: string;
  meetUrl?: string;
  createdAt: string;
};

export type MeetingDetail = MeetingListItem & {
  calendarEventId?: string;
  attendeeEmails: string[];
  artifact?: {
    summary?: string;
    actionItems: Array<{ text: string; owner?: string; dueAt?: string }>;
    topics: string[];
    completedAt: string;
  };
  botState?: string;
};

export type TranscriptChunkDTO = {
  id: string;
  seq: number;
  speakerName?: string;
  text: string;
  startMs?: number;
  endMs?: number;
  receivedAt: string;
};

export type MeetingsListResponse = {
  items: MeetingListItem[];
  nextCursor?: string;
};
