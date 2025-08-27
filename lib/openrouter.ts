export async function callOpenRouterJSON<T>(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  jsonSchema: unknown,
  model = process.env.OPENROUTER_MODEL || "openrouter/auto"
): Promise<T> {
  const res = await fetch("https://openrouter.ai/api/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      input: messages,
      response_format: { type: "json_schema", json_schema: jsonSchema },
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
