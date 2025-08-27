"use client";
import { useState } from "react";

export default function OutfitApp() {
  const [zip, setZip] = useState("44118");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setLoading(true); setErr(null); setResult(null);
    const r = await fetch("/api/outfit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ zip })
    });
    if (!r.ok) { setErr(await r.text()); setLoading(false); return; }
    setResult(await r.json());
    setLoading(false);
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-2">Baby Outfit</h1>
      <p className="text-sm text-gray-600 mb-4">Weather → outfit & packing list</p>

      <div className="flex gap-2 mb-4">
        <input
          className="border rounded px-3 py-2 flex-1"
          value={zip}
          onChange={(e)=>setZip(e.target.value)}
          placeholder="ZIP (e.g., 44118)"
        />
        <button
          onClick={run}
          className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Thinking…" : "Get Outfit"}
        </button>
      </div>

      {err && <pre className="text-red-600 whitespace-pre-wrap text-sm">{err}</pre>}

      {result && (
        <div className="space-y-3">
          <div className="text-sm text-gray-600">
            Lat/Lon: {result.lat}, {result.lon} | Temp: {result.weather?.tempF}°F
          </div>
          <section className="border rounded p-3">
            <h2 className="font-medium mb-1">Recommendation</h2>
            <div className="mb-2"><strong>Outfit:</strong> {result.recommendation?.outfit}</div>
            <div className="mb-2">
              <strong>Packing List:</strong>
              <ul className="list-disc pl-5">
                {(result.recommendation?.packingList ?? []).map((x: string, i: number) => <li key={i}>{x}</li>)}
              </ul>
            </div>
            <div className="text-sm text-gray-700"><strong>Notes:</strong> {result.recommendation?.notes}</div>
          </section>
        </div>
      )}
    </main>
  );
}
