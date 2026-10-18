import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/subscribe/route.ts', import.meta.url), 'utf8');

test('group identifier remains an exact JSON string, not a JavaScript number', () => {
  assert.ok(route.includes('"groups":[${JSON.stringify(groupId)}]'));
  const id = '200513144673534994';
  assert.equal(JSON.parse(JSON.stringify({ groups: [id] })).groups[0], id);
  assert.notEqual(String(Number(id)), id);
});

test('subscriber verification requires email, numeric ID and target group', () => {
  assert.ok(route.includes('verifiedEmail===email'));
  assert.ok(route.includes('/^\\d+$/.test(verifiedId)'));
  assert.ok(route.includes('inTargetGroup'));
  assert.ok(route.includes('verifiedGroups.some('));
});

test('success is blocked unless both storage and MailerLite synchronize', () => {
  const storage = route.indexOf('if(!leadStored)');
  const sync = route.indexOf('if(mailerliteStatus!=="synced")');
  const token = route.indexOf('createChapterAccessToken');
  const success = route.lastIndexOf('createChapterAccessToken');
  assert.ok(storage >= 0);
  assert.ok(sync > storage);
  assert.ok(success > sync);
  assert.ok(route.includes('signup=error#capitulo'));
  assert.ok(token >= 0);
});

test('configured capture group mismatch never creates a fallback group', () => {
  assert.ok(route.includes('configured group ID not found; refusing fallback'));
  assert.ok(!route.includes('async function createMailerLiteGroup('));
});
