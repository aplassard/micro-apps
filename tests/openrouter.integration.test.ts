import { test } from 'node:test';
import assert from 'node:assert/strict';
import { callOpenRouterJSON } from '../lib/openrouter';

const schema = {
  type: 'object',
  properties: { ok: { type: 'boolean' } },
  required: ['ok'],
} as const;

test(
  'calls OpenRouter and parses JSON',
  { skip: !process.env.OPENROUTER_API_KEY, timeout: 20000 },
  async () => {
    const result = await callOpenRouterJSON<{ ok: boolean }>(
      [
        {
          role: 'system',
          content: 'You are a helpful assistant that only responds in JSON.',
        },
        {
          role: 'user',
          content: 'Respond with {"ok": true}',
        },
      ],
      schema,
    );
    assert.deepEqual(result, { ok: true });
  },
);
