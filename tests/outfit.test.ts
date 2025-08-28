import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/outfit/route';

function mockFetch(...[url]: Parameters<typeof fetch>): ReturnType<typeof fetch> {
  const u = typeof url === 'string' ? url : url.toString();
  if (u.startsWith('https://nominatim.openstreetmap.org')) {
    return Promise.resolve(
      new Response(JSON.stringify([{ lat: '40.0', lon: '-80.0' }]), { status: 200 })
    );
  }
  if (u.startsWith('https://api.open-meteo.com')) {
    const body = {
      current: { temperature_2m: 70 },
      daily: { precipitation_probability_max: [10], uv_index_max: [3] },
    };
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
  }
  if (u.startsWith('https://openrouter.ai')) {
    const body = {
      choices: [{ message: { content: '{"outfit":"hat","packingList":["hat"],"notes":"warm"}' } }],
    };
    return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }));
  }
  return Promise.reject(new Error('unknown url ' + u));
}

test('outfit API returns recommendation', async () => {
  process.env.OPENROUTER_API_KEY = 'test';
  process.env.VERBOSE = '';
  globalThis.fetch = mockFetch as typeof fetch;

  const req = new NextRequest('http://test/api/outfit', {
    method: 'POST',
    body: JSON.stringify({ zip: '10001' }),
  });
  const res = await POST(req);
  const data = await res.json();
  assert.equal(res.status, 200, data.error || String(res.status));
  assert.equal(data.zip, '10001');
  assert.equal(data.lat, 40);
  assert.equal(data.lon, -80);
  assert.equal(data.weather.tempF, 70);
  assert.equal(data.recommendation.outfit, 'hat');
});
