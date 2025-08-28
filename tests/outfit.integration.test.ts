import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { POST } from '../app/api/outfit/route';

// Full end-to-end test hitting real external services
// Skip when OPENROUTER_API_KEY is not provided

test(
  'outfit API returns real recommendation',
  { skip: !process.env.OPENROUTER_API_KEY, timeout: 30000 },
  async () => {
    process.env.VERBOSE = '';

    const req = new NextRequest('http://test/api/outfit', {
      method: 'POST',
      body: JSON.stringify({ zip: '10001' }),
    });
    const res = await POST(req);
    const data = await res.json();

    assert.equal(res.status, 200, data.error || String(res.status));
    assert.equal(data.zip, '10001');
    assert.ok(data.lat > 40 && data.lat < 41);
    assert.ok(data.lon > -75 && data.lon < -73);
    assert.equal(typeof data.weather.tempF, 'number');
    assert.equal(typeof data.recommendation.outfit, 'string');
    assert.equal(Array.isArray(data.recommendation.packingList), true);
    assert.equal(typeof data.recommendation.notes, 'string');
  }
);
