import { NextRequest, NextResponse } from "next/server";
import { zipToLatLon, getWeather } from "../../../lib/geoWeather";
import { callOpenRouterJSON } from "../../../lib/openrouter";
import {
  OutfitInput,
  buildMessages,
  OUTFIT_SCHEMA,
  type Recommendation,
} from "../../../lib/outfit";
import { debug } from "../../../lib/logger";

export async function POST(req: NextRequest) {
  try {
    const { zip, promptOverrides } = OutfitInput.parse(await req.json());
    debug("[outfit] parsed input", { zip, promptOverrides });

    const { lat, lon } = await zipToLatLon(zip);
    debug("[outfit] zip lookup", { lat, lon });

    const weather = await getWeather(lat, lon);
    debug("[outfit] weather", weather);

    const messages = buildMessages(weather, promptOverrides);
    debug("[outfit] messages", messages);

    const recommendation = await callOpenRouterJSON<Recommendation>(
      messages,
      OUTFIT_SCHEMA,
    );
    debug("[outfit] recommendation", recommendation);

    return NextResponse.json({ zip, lat, lon, weather, recommendation });
  } catch (e) {
    debug("[outfit] error", e);
    const message = e instanceof Error ? e.message : "Bad request";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
