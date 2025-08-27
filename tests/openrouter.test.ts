import { test } from 'node:test';
import assert from 'node:assert/strict';
import { callOpenRouterJSON } from '../lib/openrouter';

function mockFetch(response: Response) {
  (globalThis as unknown as { fetch: typeof fetch }).fetch = () =>
    Promise.resolve(response);
}

test('parses JSON from OpenRouter output', async () => {
  process.env.OPENROUTER_API_KEY = 'test-key';
  const body = { output: [{ content: [{ text: '{"a":1}' }] }] };
  mockFetch(new Response(JSON.stringify(body), { status: 200 }));
  const result = await callOpenRouterJSON<{ a: number }>([], {});
  assert.deepEqual(result, { a: 1 });
});

test('throws on invalid JSON', async () => {
  process.env.OPENROUTER_API_KEY = 'test-key';
  const body = { output: [{ content: [{ text: 'not json' }] }] };
  mockFetch(new Response(JSON.stringify(body), { status: 200 }));
  await assert.rejects(() => callOpenRouterJSON([], {}), /Invalid JSON/);
});

test('throws on non-ok response', async () => {
  process.env.OPENROUTER_API_KEY = 'test-key';
  mockFetch(new Response('bad', { status: 500 }));
  await assert.rejects(() => callOpenRouterJSON([], {}), /OpenRouter failed/);
});
