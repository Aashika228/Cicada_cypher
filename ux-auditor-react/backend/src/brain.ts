import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface BrainMessage {
  role: "user" | "assistant";
  content: string | Anthropic.ContentBlockParam[];
}

export async function callBrain(
  system: string,
  messages: BrainMessage[]
): Promise<string> {
  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system,
    messages: messages as Anthropic.MessageParam[],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected non-text response from brain");
  return block.text;
}

export async function callBrainWithImage(
  system: string,
  messages: BrainMessage[],
  imageBase64: string,
  mediaType: "image/png" | "image/jpeg" = "image/png"
): Promise<string> {
  const lastMsg = messages[messages.length - 1];
  const contentWithImage: Anthropic.ContentBlockParam[] = [
    { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
    ...(typeof lastMsg.content === "string"
      ? [{ type: "text" as const, text: lastMsg.content }]
      : (lastMsg.content as Anthropic.ContentBlockParam[])),
  ];

  const augmentedMessages: Anthropic.MessageParam[] = [
    ...(messages.slice(0, -1) as Anthropic.MessageParam[]),
    { role: "user", content: contentWithImage },
  ];

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 4096,
    system,
    messages: augmentedMessages,
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected non-text response from brain");
  return block.text;
}

export function parseJsonSafe<T>(raw: string): T {
  const cleaned = raw.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
  return JSON.parse(cleaned) as T;
}
