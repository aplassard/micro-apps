import { debug } from "./logger";

export async function callOpenRouterJSON<T>(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  jsonSchema: unknown,
  model = process.env.OPENROUTER_MODEL || "openai/gpt-5-nano",
): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is required");
  debug("[openrouter] request", { model, messages, jsonSchema });

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (process.env.OPENROUTER_HTTP_REFERER) {
    headers["HTTP-Referer"] = process.env.OPENROUTER_HTTP_REFERER;
  }
  if (process.env.OPENROUTER_X_TITLE) {
    headers["X-Title"] = process.env.OPENROUTER_X_TITLE;
  }

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      messages,
      response_format: {
        type: "json_schema",
        json_schema: { name: "response", schema: jsonSchema },
      },
    }),
  });
  const raw = await res.text();
  debug("[openrouter] status", res.status);
  debug("[openrouter] raw response", raw);

  if (!res.ok) throw new Error(`OpenRouter failed: ${raw}`);
  const data = JSON.parse(raw);
  const text =
    data?.choices?.[0]?.message?.content ??
    data?.output?.[0]?.content?.[0]?.text ??
    "";
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    debug("[openrouter] invalid JSON", err, text);
    throw new Error(`Invalid JSON from model: ${text}`);
  }
}
