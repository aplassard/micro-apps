export async function callOpenRouterJSON<T>(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  jsonSchema: unknown,
  model = process.env.OPENROUTER_MODEL || "openrouter/auto"
): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is required");

  const res = await fetch("https://openrouter.ai/api/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: messages,
      response_format: {
        type: "json_schema",
        json_schema: { name: "response", schema: jsonSchema },
      },
    }),
  });
  if (!res.ok) throw new Error(`OpenRouter failed: ${await res.text()}`);
  const data = await res.json();
  const text =
    data?.output?.[0]?.content?.[0]?.text ??
    data?.choices?.[0]?.message?.content ??
    "";
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON from model: ${text}`);
  }
}
