import OpenAI from "openai";

let cachedClient: OpenAI | null = null;

function getOpenAIApiKey(): string {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is not set. Please define it in your environment.",
    );
  }
  return key;
}

/**
 * Returns a singleton OpenAI client instance.
 * This avoids creating multiple SDK instances across hot reloads.
 */
export function getOpenAIClient(): OpenAI {
  if (cachedClient) {
    return cachedClient;
  }

  const apiKey = getOpenAIApiKey();
  cachedClient = new OpenAI({ apiKey });
  return cachedClient;
}

