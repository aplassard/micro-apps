export type WeatherSummary = {
  date: string;
  tempF: number;
  feelsLikeF?: number;
  precipProb?: number;
  windMph?: number;
  uvIndexMax?: number;
  conditionCode?: number | string;
};

export async function zipToLatLon(zip: string): Promise<{ lat: number; lon: number }> {
  const params = new URLSearchParams({
    postalcode: zip,
    country: "US",
    format: "json",
    limit: "1",
  });
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?${params.toString()}`,
    {
      headers: {
        "User-Agent": "micro-apps tests (contact@example.com)",
      },
    }
  );
  if (!res.ok) throw new Error("ZIP lookup failed");
  const data = await res.json();
  const hit = data?.[0];
  if (!hit?.lat || !hit?.lon) throw new Error("Invalid ZIP");
  return { lat: parseFloat(hit.lat), lon: parseFloat(hit.lon) };
}

export async function getWeather(lat: number, lon: number): Promise<WeatherSummary> {
  const w = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,apparent_temperature,precipitation,weathercode,windspeed_10m` +
      `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode,uv_index_max` +
      `&timezone=auto` +
      `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch`
  );
  if (!w.ok) throw new Error("Weather unavailable");
  const j = await w.json();
  return {
    date: new Date().toISOString().slice(0, 10),
    tempF: j.current?.temperature_2m,
    feelsLikeF: j.current?.apparent_temperature,
    precipProb: j.daily?.precipitation_probability_max?.[0],
    windMph: j.current?.windspeed_10m,
    uvIndexMax: j.daily?.uv_index_max?.[0],
    conditionCode: j.current?.weathercode,
  };
}
