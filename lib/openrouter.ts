export async function callOpenRouterJSON<T>(
  messages: { role: "system" | "user" | "assistant"; content: string }[],
  jsonSchema: unknown,
  model = process.env.OPENROUTER_MODEL || "openrouter/auto"
): Promise<T> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error("OPENROUTER_API_KEY is required");
  console.log("[openrouter] request", { model, messages, jsonSchema });

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
  const raw = await res.text();
  console.log("[openrouter] status", res.status);
  console.log("[openrouter] raw response", raw);

  if (!res.ok) throw new Error(`OpenRouter failed: ${raw}`);
  const data = JSON.parse(raw);
  const text =
    data?.output?.[0]?.content?.[0]?.text ??
    data?.choices?.[0]?.message?.content ??
    "";
  try {
    return JSON.parse(text) as T;
  } catch (err) {
    console.error("[openrouter] invalid JSON", err, text);
    throw new Error(`Invalid JSON from model: ${text}`);
  }
}
