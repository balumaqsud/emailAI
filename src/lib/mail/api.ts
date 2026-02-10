import type {
  MailboxListResponse,
  MailFolder,
  SendMailInput,
} from "./types";

type ListParams = {
  folder: MailFolder;
  limit?: number;
  cursor?: string | null;
};

type ApiErrorShape = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

type ApiListSuccess = {
  ok: true;
  data: MailboxListResponse;
};

type ApiSendSuccess = {
  ok: true;
  data: {
    messageId: string;
    conversationId: string;
  };
};

async function parseJson<T>(res: Response): Promise<T | ApiErrorShape> {
  try {
    return (await res.json()) as T | ApiErrorShape;
  } catch {
    throw new Error("Unexpected server response.");
  }
}

function ensureOk<T>(
  res: Response,
  data: T | ApiErrorShape,
): T {
  if (!res.ok) {
    if (!("ok" in (data as ApiErrorShape))) {
      throw new Error(`Request failed with status ${res.status}.`);
    }
  }

  if ("ok" in (data as ApiErrorShape) && !(data as ApiErrorShape).ok) {
    const err = data as ApiErrorShape;
    throw new Error(err.error?.message ?? "Request failed.");
  }

  return data as T;
}

export async function listMailbox(
  params: ListParams,
  token: string,
): Promise<MailboxListResponse> {
  const search = new URLSearchParams();
  search.set("folder", params.folder);
  if (params.limit != null) {
    search.set("limit", String(params.limit));
  }
  if (params.cursor) {
    search.set("cursor", params.cursor);
  }

  const res = await fetch(`/api/mail?${search.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
  });

  const data = await parseJson<ApiListSuccess>(res);
  const okData = ensureOk<ApiListSuccess>(res, data);
  return okData.data;
}

export async function sendMail(
  input: SendMailInput,
  token: string,
): Promise<{ messageId: string; conversationId: string }> {
  const res = await fetch("/api/mail/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify(input),
  });

  const data = await parseJson<ApiSendSuccess>(res);
  const okData = ensureOk<ApiSendSuccess>(res, data);
  return okData.data;
}

export async function markRead(
  messageId: string,
  isRead: boolean,
  token: string,
): Promise<void> {
  const res = await fetch(`/api/mail/${messageId}/read`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    credentials: "include",
    body: JSON.stringify({ isRead }),
  });

  if (!res.ok) {
    const data = await parseJson<unknown>(res);
    if ("ok" in (data as ApiErrorShape) && !(data as ApiErrorShape).ok) {
      const err = data as ApiErrorShape;
      throw new Error(err.error?.message ?? "Failed to update read state.");
    }
    throw new Error("Failed to update read state.");
  }
}

