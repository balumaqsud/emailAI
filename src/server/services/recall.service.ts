const RECALL_REGION_URLS: Record<string, string> = {
  "us-west-2": "https://us-west-2.recall.ai/api/v1",
  "us-east-1": "https://us-east-1.recall.ai/api/v1",
  "eu-central-1": "https://eu-central-1.recall.ai/api/v1",
  "ap-northeast-1": "https://ap-northeast-1.recall.ai/api/v1",
};

function getRecallApiBase(): string {
  const region = process.env.RECALL_REGION?.toLowerCase();
  if (region && RECALL_REGION_URLS[region]) {
    return RECALL_REGION_URLS[region];
  }
  const base = process.env.RECALL_API_BASE;
  if (base) return base.endsWith("/") ? base.slice(0, -1) : base;
  return RECALL_REGION_URLS["us-west-2"];
}

function getRecallApiKey(): string {
  const key = process.env.RECALL_API_KEY;
  if (!key) {
    throw new Error("RECALL_API_KEY is not set.");
  }
  return key;
}

function getWebhookUrl(): string {
  const url = process.env.RECALL_WEBHOOK_URL;
  if (url) {
    return url;
  }
  const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${base}/api/recall/webhook`;
}

export type CreateBotInput = {
  meetingUrl: string;
  webhookUrl?: string;
  metadata?: Record<string, string>;
};

export type CreateBotResult = {
  recallBotId: string;
};

export async function createBot(
  input: CreateBotInput,
): Promise<CreateBotResult> {
  const apiKey = getRecallApiKey();
  const webhookUrl = input.webhookUrl ?? getWebhookUrl();

  const body = {
    meeting_url: input.meetingUrl,
    recording_config: {
      transcript: {
        provider: {
          recallai_streaming: {},
        },
      },
      realtime_endpoints: [
        {
          type: "webhook",
          url: webhookUrl,
          events: ["transcript.data"],
        },
      ],
    },
    metadata: input.metadata ?? {},
  };

  const apiBase = getRecallApiBase();
  const res = await fetch(`${apiBase}/bot/`, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Recall API error: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { id?: string };

  if (!data.id) {
    throw new Error("Recall API did not return bot ID.");
  }

  return { recallBotId: data.id };
}
