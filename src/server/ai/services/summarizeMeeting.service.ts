import { z } from "zod";
import { getOpenAIClient } from "@/src/server/ai";

export type SummarizeMeetingResult = {
  summary: string;
  actionItems: Array<{ text: string; owner?: string; dueAt?: string }>;
  topics: string[];
};

const ActionItemSchema = z.object({
  text: z.string(),
  owner: z.string().optional(),
  dueAt: z.string().optional(),
});

const SummarizeSchema = z.object({
  summary: z.string(),
  actionItems: z.array(ActionItemSchema),
  topics: z.array(z.string()),
});

function getModelName(): string {
  return process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
}

export async function summarizeMeeting(
  finalTranscript: string,
): Promise<SummarizeMeetingResult> {
  if (!finalTranscript.trim()) {
    return { summary: "", actionItems: [], topics: [] };
  }

  try {
    const client = getOpenAIClient();
    const model = getModelName();

    const prompt = [
      "You are an AI that summarizes meeting transcripts.",
      "",
      "Return STRICT JSON only, matching exactly this structure:",
      "",
      '{ "summary": "string", "actionItems": [{ "text": "string", "owner": "optional", "dueAt": "optional ISO date" }], "topics": ["string"] }',
      "",
      "Rules:",
      "- summary: 2-4 sentence overview of the meeting",
      "- actionItems: concrete tasks with owners and due dates when mentioned",
      "- topics: main discussion topics as short strings",
      "- No comments or explanations in the JSON",
      "",
      "Transcript:",
      finalTranscript.slice(0, 50000),
    ].join("\n");

    const response = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "You are a strict JSON-only meeting summarization engine. Return only valid JSON.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0,
    });

    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      return { summary: "", actionItems: [], topics: [] };
    }

    const parsed = JSON.parse(content);
    const result = SummarizeSchema.safeParse(parsed);
    if (!result.success) {
      return { summary: "", actionItems: [], topics: [] };
    }

    return result.data;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[summarizeMeeting] OpenAI failed:", err);
    return { summary: "", actionItems: [], topics: [] };
  }
}
