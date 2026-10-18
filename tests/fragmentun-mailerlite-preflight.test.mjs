import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../scripts/fragmentun-mailerlite-readonly-preflight.mjs', import.meta.url), 'utf8');
const ES = '200513144673534994';
const EN = '200513164367889456';

async function run({ pages, es = ES, en = EN, token = 'mock-token' }) {
  const messages = [];
  const requests = [];
  const context = {
    process: { env: {
      MAILERLITE_API_TOKEN: token,
      MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES: es,
      MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN: en,
    }, exitCode: 0 },
    URL, Set, Object, String, Error,
    AbortSignal,
    console: { log: message => messages.push(message), error: message => messages.push(message) },
    fetch: async (url, options) => {
      requests.push({ url: String(url), options });
      const page = pages[requests.length - 1];
      if (!page) throw new Error('Unexpected network call');
      return { ok: page.status === undefined || page.status === 200, status: page.status || 200, json: async () => page.body };
    },
  };
  await new vm.Script('(async () => {\n' + source + '\n})()').runInNewContext(context);
  return { requests, messages, exitCode: context.process.exitCode };
}

test('success across multiple pages; only GET-compatible fetch, no writes', async () => {
  const result = await run({ pages: [
    { body: { data: [{ id: ES }], links: { next: 'https://connect.mailerlite.com/api/groups?page=2' } } },
    { body: { data: [{ id: EN }], links: { next: null } } },
  ] });
  assert.equal(result.exitCode, 0);
  assert.equal(result.requests.length, 2);
  assert.ok(result.messages.some(m => m.includes('ES capture group: VERIFIED')));
  assert.ok(result.messages.some(m => m.includes('EN capture group: VERIFIED')));
  for (const request of result.requests) {
    assert.equal(request.options.method, undefined);
    assert.equal(request.options.redirect, 'error');
    assert.equal(new URL(request.url).hostname, 'connect.mailerlite.com');
  }
});

test('reject cross-domain pagination without transmitting token', async () => {
  const result = await run({ pages: [
    { body: { data: [], links: { next: 'https://evil.example/api/groups' } } },
  ] });
  assert.equal(result.exitCode, 1);
  assert.equal(result.requests.length, 1);
});

test('reject duplicated page link', async () => {
  const result = await run({ pages: [
    { body: { data: [], links: { next: 'https://connect.mailerlite.com/api/groups?limit=100' } } },
  ] });
  assert.equal(result.exitCode, 1);
  assert.equal(result.requests.length, 1);
});

test('reject invalid or duplicate group IDs before any request', async () => {
  for (const config of [{ es: 'invalid' }, { en: ES }]) {
    const result = await run({ pages: [], ...config });
    assert.equal(result.exitCode, 1);
    assert.equal(result.requests.length, 0);
  }
});

test('reject unauthorized group API responses', async () => {
  const result = await run({ pages: [{ status: 401, body: { message: 'Unauthorized' } }] });
  assert.equal(result.exitCode, 1);
  assert.equal(result.requests.length, 1);
});

test('reject malformed group response', async () => {
  const result = await run({ pages: [{ body: { data: null } }] });
  assert.equal(result.exitCode, 1);
});

test('fail when one configured group does not exist', async () => {
  const result = await run({ pages: [{ body: { data: [{ id: ES }], links: { next: null } } }] });
  assert.equal(result.exitCode, 1);
  assert.ok(result.messages.some(m => m.includes('ES capture group: VERIFIED')));
  assert.ok(result.messages.some(m => m.includes('EN capture group: NOT FOUND')));
});
