// SPDX-License-Identifier: GPL-3.0-only
const test = require('node:test');
const assert = require('node:assert/strict');
const { Adapter, SleepTimer, parseLrc, activeLine, readSettings, safeImage } = require('../src/core.js');
function host(restrictions = {}) {
  const calls = [], listeners = new Map();
  const Player = { data: { item: { uri: 'spotify:track:test', metadata: { title: 'Test' } }, restrictions },
    getDuration: () => 100000, getProgress: () => 20000, isPlaying: () => true,
    getVolume: () => .5, getRepeat: () => 0, getShuffle: () => false,
    addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key) };
  for (const key of ['pause', 'play', 'seek', 'next', 'back', 'setVolume', 'setShuffle', 'setRepeat']) Player[key] = value => calls.push([key, value]);
  return { Player, calls, listeners };
}
test('no host or empty session fails closed', async () => {
  const adapter = new Adapter({}); assert.equal(adapter.snapshot().connected, false); await assert.rejects(adapter.command('play'));
  const h = host(); h.Player.data = null; assert.equal(new Adapter(h).allowed('next'), false);
});
test('host restrictions and context restrictions are enforced', async () => {
  const h = host({ disallow_skipping_next_reasons: ['premium'] }); const a = new Adapter(h);
  await assert.rejects(a.command('next')); assert.equal(h.calls.length, 0);
  h.Player.data.context_restrictions = { disallow_seeking_reasons: ['ad'] }; await assert.rejects(a.command('seek', 500));
});
test('advertisements cannot be skipped even with missing restriction metadata', async () => {
  const h = host(); h.Player.data.item.uri = 'spotify:ad:example'; const a = new Adapter(h);
  await assert.rejects(a.command('next')); await assert.rejects(a.command('seek', 9000)); await a.command('pause');
  assert.deepEqual(h.calls, [['pause', undefined]]);
});
test('player commands bound values and reject invalid modes', async () => {
  const h = host(), a = new Adapter(h); await a.command('seek', 200000); await a.command('setVolume', -2);
  assert.deepEqual(h.calls, [['seek', 100000], ['setVolume', 0]]);
  await assert.rejects(a.command('setRepeat', 8)); await assert.rejects(a.command('setShuffle', 'false'));
  await assert.rejects(a.command('constructor'));
});
test('track repeat restriction differs from context repeat', async () => {
  const h = host({ disallow_toggling_repeat_track_reasons: ['restricted'] }), a = new Adapter(h);
  await assert.rejects(a.command('setRepeat', 2)); await a.command('setRepeat', 1); assert.equal(h.calls.length, 1);
});
test('Spicetify 2.46 camelCase restrictions and capabilities are enforced', async () => {
  for (const restrictions of [{ canSkipNext: false }, { disallowSkippingNextReasons: ['restricted'] }]) {
    const h = host(restrictions); await assert.rejects(new Adapter(h).command('next')); assert.equal(h.calls.length, 0);
  }
  const a = new Adapter(host({ canToggleRepeatTrack: false, canToggleRepeatContext: true }));
  await assert.rejects(a.command('setRepeat', 2)); await a.command('setRepeat', 1);
});
test('host errors propagate without logging tokens', async () => {
  const h = host(); h.Player.pause = async () => { throw Error('network unavailable'); };
  await assert.rejects(new Adapter(h).command('pause'), /network/);
});
test('subscriptions are removed on navigation away', () => {
  const h = host(); const dispose = new Adapter(h).subscribe(() => {}); assert.equal(h.listeners.size, 3); dispose(); assert.equal(h.listeners.size, 0);
});
test('LRC parses repeated stamps, offset and decimal precision; rejects oversized input', () => {
  const lines = parseLrc('[offset:-100]\n[00:01.5][00:03.050]First\n[00:02]Second\n[00:80]Invalid');
  assert.deepEqual(lines, [{ time: 1400, text: 'First' }, { time: 1900, text: 'Second' }, { time: 2950, text: 'First' }]);
  assert.equal(activeLine(lines, 1399), -1); assert.equal(activeLine(lines, 1900), 1); assert.equal(activeLine([], 0), -1);
  assert.throws(() => parseLrc('x'.repeat(500001)));
});
test('settings recover from corruption and allowlist persisted fields', () => {
  for (const raw of ['invalid', 'null', '[]']) assert.equal(readSettings({ getItem: () => raw }).mode, 'classic');
  assert.equal(readSettings({ getItem: () => '{"mode":"immersive","accent":"url(evil)"}' }).accent, '');
  assert.equal(safeImage('https://127.0.0.1/image'), ''); assert.equal(safeImage('javascript:alert(1)'), '');
  assert.equal(safeImage('https://i.scdn.co/image/a'), 'https://i.scdn.co/image/a');
});
test('sleep timer executes exactly once, cancels, and reports failures', async () => {
  let now = 100, count = 0; const timer = new SleepTimer(async () => { count++; }, () => now);
  timer.start(1); await timer.tick(); assert.equal(count, 0); now += 60000; await Promise.all([timer.tick(), timer.tick()]); assert.equal(count, 1);
  timer.start(1); timer.cancel(); now += 60000; await timer.tick(); assert.equal(count, 1); assert.throws(() => timer.start(NaN));
  const failing = new SleepTimer(async () => { throw Error('secret'); }, () => now); failing.start(1); now += 60000; await failing.tick(); assert.match(failing.error, /nicht pausieren/); assert.ok(!failing.error.includes('secret'));
});
