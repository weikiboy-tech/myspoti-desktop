// SPDX-License-Identifier: GPL-3.0-only
// Myspoti Desktop, derived from the Myspoti project: https://github.com/kota-zo/myspoti
(function (root) {
  'use strict';
  const finite = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, finite(value)));
  const restrictions = {
    play: 'disallow_resuming_reasons', pause: 'disallow_pausing_reasons',
    next: 'disallow_skipping_next_reasons', back: 'disallow_skipping_prev_reasons',
    seek: 'disallow_seeking_reasons', setShuffle: 'disallow_toggling_shuffle_reasons',
    setRepeat: 'disallow_toggling_repeat_context_reasons', setVolume: 'disallow_setting_volume_reasons'
  };
  const capabilities = { play: 'canResume', pause: 'canPause', next: 'canSkipNext', back: 'canSkipPrevious', seek: 'canSeek', setShuffle: 'canToggleShuffle', setRepeat: 'canToggleRepeatContext', setVolume: 'canSetVolume' };
  const reasonNames = { play: 'disallowResumingReasons', pause: 'disallowPausingReasons', next: 'disallowSkippingNextReasons', back: 'disallowSkippingPreviousReasons', seek: 'disallowSeekingReasons', setShuffle: 'disallowTogglingShuffleReasons', setRepeat: 'disallowTogglingRepeatContextReasons', setVolume: 'disallowSettingVolumeReasons' };
  function trackOf(data) { return data?.item || data?.track || null; }
  function safeImage(value) {
    if (typeof value !== 'string') return '';
    if (/^spotify:image:[a-f0-9]+$/i.test(value)) return value;
    try { const u = new URL(value); return u.protocol === 'https:' && /(^|\.)scdn\.co$/.test(u.hostname) ? u.href : ''; } catch { return ''; }
  }
  function readSettings(storage) {
    let value;
    try { value = JSON.parse(storage.getItem('myspoti.desktop.v1') || '{}'); } catch { value = {}; }
    value = value && typeof value === 'object' ? value : {};
    return { mode: value.mode === 'immersive' ? 'immersive' : 'classic', amoled: value.amoled === true,
      accent: /^#[a-f0-9]{6}$/i.test(value.accent || '') ? value.accent : '', reduceMotion: value.reduceMotion === true };
  }
  function parseLrc(text) {
    if (typeof text !== 'string' || text.length > 500000) throw new Error('LRC-Datei zu groß oder ungültig.');
    const result = [];
    const offset = finite(text.match(/\[offset:([+-]?\d+)\]/i)?.[1]);
    for (const line of text.split(/\r?\n/)) {
      const tags = [...line.matchAll(/\[(\d+):(\d{2})(?:\.(\d{1,3}))?\]/g)];
      const words = line.replace(/\[[^\]]*\]/g, '').trim();
      for (const tag of tags) {
        if (Number(tag[2]) >= 60) continue;
        result.push({ time: Math.max(0, Number(tag[1]) * 60000 + Number(tag[2]) * 1000 + Number((tag[3] || '').padEnd(3, '0')) + offset), text: words });
      }
    }
    return result.sort((a, b) => a.time - b.time);
  }
  function activeLine(lines, ms) {
    let low = 0, high = lines.length;
    while (low < high) { const mid = (low + high) >>> 1; if (lines[mid].time <= ms) low = mid + 1; else high = mid; }
    return low - 1;
  }
  class Adapter {
    constructor(host) { this.host = host; }
    allowed(method, argument) {
      const p = this.host?.Player, data = p?.data;
      if (!p || typeof p[method] !== 'function' || !trackOf(data)) return false;
      const item = trackOf(data);
      if ((item.uri?.startsWith('spotify:ad:') || item.metadata?.is_advertisement === 'true') && !['play', 'pause', 'setVolume'].includes(method)) return false;
      const key = method === 'setRepeat' && argument === 2 ? 'disallow_toggling_repeat_track_reasons' : restrictions[method];
      const capability = method === 'setRepeat' && argument === 2 ? 'canToggleRepeatTrack' : capabilities[method];
      const reason = method === 'setRepeat' && argument === 2 ? 'disallowTogglingRepeatTrackReasons' : reasonNames[method];
      return ![data.restrictions, data.context_restrictions].some(r => r?.[capability] === false || r?.[reason]?.length > 0 || r?.[key]?.length > 0);
    }
    async command(method, argument) {
      if (!Object.hasOwn(restrictions, method) || !this.allowed(method, argument)) throw new Error('Diese Aktion ist im aktuellen Spotify-Zustand nicht verfügbar.');
      if (method === 'seek') argument = clamp(argument, 0, this.snapshot().duration);
      if (method === 'setVolume') argument = clamp(argument, 0, 1);
      if (method === 'setRepeat' && ![0, 1, 2].includes(argument)) throw new Error('Ungültiger Wiederholungsmodus.');
      if (method === 'setShuffle' && typeof argument !== 'boolean') throw new Error('Ungültiger Shuffle-Zustand.');
      // Spotify remains the final authority on entitlement and runtime restrictions.
      return await this.host.Player[method](argument);
    }
    snapshot() {
      const p = this.host?.Player, data = p?.data, item = trackOf(data), meta = item?.metadata || {};
      const read = (name, fallback) => { try { return typeof p?.[name] === 'function' ? p[name]() : fallback; } catch { return fallback; } };
      return { connected: !!p, uri: item?.uri || '', title: meta.title || item?.name || 'Keine Wiedergabe',
        artist: meta.artist_name || '', album: meta.album_title || '', image: safeImage(meta.image_xlarge_url || meta.image_url),
        duration: Math.max(0, finite(read('getDuration', data?.duration))), position: Math.max(0, finite(read('getProgress', 0))),
        playing: !!read('isPlaying', false), volume: clamp(read('getVolume', 0), 0, 1),
        shuffle: !!read('getShuffle', false), repeat: finite(read('getRepeat', 0)) };
    }
    subscribe(listener) {
      const p = this.host?.Player;
      const events = ['songchange', 'onplaypause', 'onprogress'];
      if (!p?.addEventListener || !p?.removeEventListener) return () => {};
      for (const event of events) p.addEventListener(event, listener);
      return () => { for (const event of events) p.removeEventListener(event, listener); };
    }
  }
  class SleepTimer {
    constructor(pause, now = Date.now) { this.pause = pause; this.now = now; this.deadline = 0; this.pending = false; this.error = ''; }
    start(minutes) {
      if (!Number.isFinite(minutes) || minutes < 1 || minutes > 180) throw new Error('Timer: 1 bis 180 Minuten.');
      this.deadline = this.now() + minutes * 60000; this.error = '';
    }
    cancel() { this.deadline = 0; }
    async tick() {
      if (!this.deadline || this.pending || this.now() < this.deadline) return;
      this.deadline = 0; this.pending = true;
      try { await this.pause(); } catch { this.error = 'Sleep Timer konnte Spotify nicht pausieren.'; }
      finally { this.pending = false; }
    }
  }
  class LyricsClient {
    constructor(fetcher = globalThis.fetch, now = Date.now) { this.fetcher = fetcher; this.now = now; this.retryAt = 0; this.busy = false; this.cache = new Map(); }
    async get(track, signal) {
      if (!track.title || !track.artist || track.duration < 1000 || track.duration > 3600000) throw Error('LYRICS_METADATA');
      const query = new URLSearchParams({ track_name: track.title, artist_name: track.artist, album_name: track.album || '', duration: String(track.duration / 1000) });
      const key = query.toString();
      if (this.cache.has(key)) return this.cache.get(key);
      if (this.busy || this.now() < this.retryAt) throw Error('LYRICS_WAIT');
      this.busy = true;
      try {
        const response = await this.fetcher('https://lrclib.net/api/get?' + key, { signal, credentials: 'omit', redirect: 'error', headers: { 'Lrclib-Client': 'MyspotiDesktop/0.1.0 (https://github.com/kota-zo/myspoti)', Accept: 'application/json' } });
        if (response.status === 429 || response.status === 503) {
          const retry = response.headers.get('Retry-After');
          const seconds = Number(retry);
          const delay = retry && Number.isFinite(seconds) ? seconds * 1000 : Math.max(0, Date.parse(retry) - this.now()) || 60000;
          this.retryAt = this.now() + Math.max(1000, delay) + 500;
          throw Error('LYRICS_WAIT');
        }
        if (response.status === 404) return null;
        if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw Error('LYRICS_NETWORK');
        if (Number(response.headers.get('content-length')) > 1000000) throw Error('LYRICS_SIZE');
        const text = await response.text(); if (text.length > 1000000) throw Error('LYRICS_SIZE');
        const data = JSON.parse(text);
        if (!Number.isFinite(data.duration) || Math.abs(data.duration * 1000 - track.duration) > 2000) throw Error('LYRICS_MISMATCH');
        const value = { lines: data.syncedLyrics ? parseLrc(data.syncedLyrics) : [], plain: typeof data.plainLyrics === 'string' ? data.plainLyrics.slice(0,500000) : '', instrumental: data.instrumental === true };
        if (this.cache.size >= 20) this.cache.delete(this.cache.keys().next().value);
        this.cache.set(key, value); return value;
      } finally { this.busy = false; this.retryAt = Math.max(this.retryAt, this.now() + 500); }
    }
  }
  const api = { Adapter, SleepTimer, LyricsClient, readSettings, parseLrc, activeLine, safeImage, clamp };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.MyspotiDesktopCore = api;
})(globalThis);
