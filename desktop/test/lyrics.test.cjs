// SPDX-License-Identifier: GPL-3.0-only
const test = require('node:test'), assert = require('node:assert/strict');
const { LyricsClient } = require('../src/core.js');
const track = { title: 'A & B', artist: 'Artist', album: 'Album', duration: 180000 };
const response = (status, body, extra = {}) => ({ status, ok: status === 200, headers: { get: key => ({ 'content-type': 'application/json', ...extra })[key] || null }, text: async () => JSON.stringify(body) });
test('lyrics request encodes metadata, omits credentials, caches results', async () => {
  let requests = 0;
  const client = new LyricsClient(async (url, options) => {
    requests++; assert.equal(new URL(url).searchParams.get('track_name'), 'A & B'); assert.equal(options.credentials, 'omit'); assert.equal(options.redirect, 'error');
    return response(200, { duration: 180, syncedLyrics: '[00:10]Example' });
  });
  assert.equal((await client.get(track)).lines[0].time, 10000); await client.get(track); assert.equal(requests, 1);
});
test('lyrics refuses a different recording duration and non-JSON failures', async () => {
  await assert.rejects(new LyricsClient(async () => response(200, { duration: 190 })).get(track), /MISMATCH/);
  await assert.rejects(new LyricsClient(async () => response(502, null, { 'content-type': 'text/html' })).get(track), /NETWORK/);
  assert.equal(await new LyricsClient(async () => response(404, null)).get(track), null);
});
test('lyrics respects Retry-After without automatic retries', async () => {
  let now = 0, requests = 0;
  const client = new LyricsClient(async () => { requests++; return response(429, {}, { 'Retry-After': '120' }); }, () => now);
  await assert.rejects(client.get(track), /WAIT/); now = 119999; await assert.rejects(client.get(track), /WAIT/); assert.equal(requests, 1);
  now = 121000; await assert.rejects(client.get(track), /WAIT/); assert.equal(requests, 2);
});
test('lyrics never sends concurrent requests and releases lock after errors', async () => {
  let reject; const client = new LyricsClient(() => new Promise((_, r) => { reject = r; }));
  const pending = client.get(track); await assert.rejects(client.get(track), /WAIT/); reject(Error('offline')); await assert.rejects(pending, /offline/); assert.equal(client.busy, false);
});
