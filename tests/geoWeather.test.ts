import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getWeather, zipToLatLon } from '../lib/geoWeather';

function mockFetch(response: Response) {
  (globalThis as unknown as { fetch: typeof fetch }).fetch = () =>
    Promise.resolve(response);
}

test('zipToLatLon returns coordinates', async () => {
  const body = [{ lat: '40.0', lon: '-80.0' }];
  mockFetch(new Response(JSON.stringify(body), { status: 200 }));
  const result = await zipToLatLon('12345');
  assert.deepEqual(result, { lat: 40, lon: -80 });
});

test('zipToLatLon throws on invalid data', async () => {
  mockFetch(new Response(JSON.stringify([]), { status: 200 }));
  await assert.rejects(() => zipToLatLon('00000'), /Invalid ZIP/);
});

test('getWeather maps API response to summary', async () => {
  const body = {
    current: {
      temperature_2m: 70,
      apparent_temperature: 72,
      windspeed_10m: 5,
      weathercode: 1,
    },
    daily: {
      precipitation_probability_max: [10],
      uv_index_max: [3],
    },
  };
  mockFetch(new Response(JSON.stringify(body), { status: 200 }));
  const summary = await getWeather(0, 0);
  assert.equal(summary.tempF, 70);
  assert.equal(summary.feelsLikeF, 72);
  assert.equal(summary.precipProb, 10);
  assert.equal(summary.windMph, 5);
  assert.equal(summary.uvIndexMax, 3);
  assert.equal(summary.conditionCode, 1);
});

test('getWeather throws on network error', async () => {
  mockFetch(new Response('err', { status: 500 }));
  await assert.rejects(() => getWeather(0, 0), /Weather unavailable/);
});
