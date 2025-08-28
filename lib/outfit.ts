import { z } from "zod";
import type { WeatherSummary } from "./geoWeather";

export const OutfitInput = z.object({
  zip: z.string().min(3),
  promptOverrides: z.string().optional(),
});

export const OUTFIT_SCHEMA = {
  type: "object",
  properties: {
    outfit: { type: "string" },
    packingList: { type: "array", items: { type: "string" }, minItems: 3, maxItems: 10 },
    notes: { type: "string" },
  },
  required: ["outfit", "packingList", "notes"],
  additionalProperties: false,
} as const;

const BASE_POLICY = `
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

export function buildMessages(weather: WeatherSummary, promptOverrides?: string) {
  const extra = promptOverrides ? `\n\nExtra parent rules:\n${promptOverrides}` : "";
  return [
    { role: "system" as const, content: "Output only valid JSON that conforms to the provided schema." },
    {
      role: "user" as const,
      content: `Weather (Fahrenheit):\n${JSON.stringify(weather, null, 2)}\nPolicy:\n${BASE_POLICY}${extra}\nJSON Schema:\n${JSON.stringify(OUTFIT_SCHEMA)}`,
    },
  ];
}

export interface Recommendation {
  outfit: string;
  packingList: string[];
  notes: string;
}

export interface OutfitResponse {
  zip: string;
  lat: number;
  lon: number;
  weather: WeatherSummary;
  recommendation: Recommendation;
}
