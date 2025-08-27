import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { access } from 'node:fs/promises';
import path from 'node:path';

async function waitForServer(url: string, timeout = 60000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url);
      if (res.status > 0) return;
    } catch {}
    await delay(1000);
  }
  throw new Error('Server did not start');
}

async function ensureBuilt() {
  const manifest = path.join(process.cwd(), '.next', 'routes-manifest.json');
  try {
    await access(manifest);
    return; // already built
  } catch {}
  await new Promise<void>((resolve, reject) => {
    const build = spawn('npm', ['run', 'build'], {
      env: process.env,
      stdio: 'inherit',
    });
    build.on('exit', (code) => {
      code === 0 ? resolve() : reject(new Error(`build failed: ${code}`));
    });
  });
  await access(manifest);
}

test(
  'outfit API returns recommendation',
  { timeout: 180000 },
  async () => {
    process.env.OPENROUTER_MODEL = 'openai/gpt-oss-20b:free';
    process.env.BASIC_AUTH_USER = 'user';
    process.env.BASIC_AUTH_PASS = 'password';

    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY must be set');
    }

    await ensureBuilt();
    const server = spawn('npm', ['start'], {
      env: process.env,
      stdio: 'inherit',
    });
    try {
      await waitForServer('http://localhost:3000');
      const auth = Buffer.from(
        `${process.env.BASIC_AUTH_USER}:${process.env.BASIC_AUTH_PASS}`,
      ).toString('base64');
      const res = await fetch('http://localhost:3000/api/outfit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${auth}`,
        },
        body: JSON.stringify({ zip: '10001' }),
      });
      const data = await res.json();
      assert.equal(res.status, 200, data.error || res.status);
      assert.ok(data.recommendation?.outfit);
    } finally {
      server.kill();
    }
  },
);
