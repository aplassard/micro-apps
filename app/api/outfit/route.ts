import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zipToLatLon, getWeather, WeatherSummary } from "@/lib/geoWeather";
import { callOpenRouterJSON } from "@/lib/openrouter";
import type { Recommendation } from "@/lib/outfit";

const Input = z.object({
  zip: z.string().min(3),
  promptOverrides: z.string().optional(),
});

const OUTFIT_SCHEMA = {
  type: "object",
  properties: {
    outfit: { type: "string" },
    packingList: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 10 },
    notes: { type: "string" }
  },
  required: ["outfit","packingList","notes"],
  additionalProperties: false
};

export async function POST(req: NextRequest) {
  try {
    // Log the raw request body so we can see exactly what the client sent
    const body = await req.json();
    console.log("[outfit] request body", body);

    const { zip, promptOverrides } = Input.parse(body);
    console.log("[outfit] parsed input", { zip, promptOverrides });

    const { lat, lon } = await zipToLatLon(zip);
    console.log("[outfit] zip lookup", { lat, lon });

    const weather: WeatherSummary = await getWeather(lat, lon);
    console.log("[outfit] weather", weather);

    const basePolicy = `
You are a pediatric-outfit assistant for an 11-month-old.
Return STRICT JSON per the JSON Schema. Use American terms/sizes.

Principles:
- Weather data is in Fahrenheit (°F), mph, inches.
- <50°F: warm hat, mittens, fleece, socks; consider bunting.
- 50–65°F: long sleeves/pants, light jacket, hat.
- 65–75°F: onesie + light layer; sun hat; light blanket (stroller).
- >75°F: breathable onesie/romper; sunscreen note; extra water.
- Rain >30%: waterproof layer, stroller rain cover.
- Wind >25 mph: wind layer, ear coverage.
- High UV (>6 if provided): UPF hat/clothes + sunscreen note.
Respond with “outfit”, “packingList” (3–8 items), and “notes” (1–3 sentences). No markdown. JSON only.`;

    const extra = promptOverrides ? `\n\nExtra parent rules:\n${promptOverrides}` : "";

    const messages = [
  { role: "system" as const, content: "Output only valid JSON that conforms to the provided schema." },
  {
    role: "user" as const,
    content:
`Weather (Fahrenheit):
${JSON.stringify(weather, null, 2)}
Policy:
${basePolicy}${extra}
JSON Schema:
${JSON.stringify(OUTFIT_SCHEMA)}`
  },
];
    console.log("[outfit] messages", messages);

    const recommendation = await callOpenRouterJSON<Recommendation>(
      messages,
      OUTFIT_SCHEMA,
    );
    console.log("[outfit] recommendation", recommendation);

    return NextResponse.json({ zip, lat, lon, weather, recommendation });
  } catch (e) {
    console.error("[outfit] error", e);
    const message = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
