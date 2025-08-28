import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

test('rejects requests without auth', () => {
  process.env.BASIC_AUTH_USER = 'u';
  process.env.BASIC_AUTH_PASS = 'p';
  const req = new NextRequest('https://example.com/secret');
  const res = middleware(req);
  assert.equal(res.status, 401);
});

test('allows valid auth header', () => {
  process.env.BASIC_AUTH_USER = 'u';
  process.env.BASIC_AUTH_PASS = 'p';
  const auth = Buffer.from('u:p').toString('base64');
  const req = new NextRequest('https://example.com/secret', {
    headers: { authorization: `Basic ${auth}` },
  });
  const res = middleware(req);
  assert.equal(res.status, 200);
});

test('passes through static assets', () => {
  process.env.BASIC_AUTH_USER = 'u';
  process.env.BASIC_AUTH_PASS = 'p';
  const req = new NextRequest('https://example.com/_next/test.js');
  const res = middleware(req);
  assert.equal(res.status, 200);
});

test('skips auth when env not set', () => {
  delete process.env.BASIC_AUTH_USER;
  delete process.env.BASIC_AUTH_PASS;
  const req = new NextRequest('https://example.com/secret');
  const res = middleware(req);
  assert.equal(res.status, 200);
});
