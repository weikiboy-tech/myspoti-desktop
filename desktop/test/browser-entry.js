// SPDX-License-Identifier: GPL-3.0-only
// TEST ONLY. Artificial host: never shipped as the desktop application.
import React from 'react';
import { createRoot } from 'react-dom/client';
window.testCalls = [];
const listeners = new Map();
let position = 12000, playing = false, repeat = 0, shuffle = false, volume = .5;
window.Spicetify = { React, Menu: { Item: class { register() {} deregister() {} } }, Platform: { History: { push: path => window.testCalls.push(['navigate', path]) } }, Player: {
  data: { item: { uri: 'spotify:track:test', name: 'Lokaler Integrationstest', metadata: { artist_name: 'Testdaten · keine Spotify-Verbindung', album_title: 'Testalbum' } }, restrictions: { canResume: true, canPause: true, canSeek: true, canSkipNext: true, canSkipPrevious: true, canToggleShuffle: true, canToggleRepeatContext: true, canToggleRepeatTrack: true } },
  getDuration: () => 180000, getProgress: () => position, isPlaying: () => playing,
  getVolume: () => volume, getRepeat: () => repeat, getShuffle: () => shuffle,
  addEventListener: (key, fn) => listeners.set(key, fn), removeEventListener: key => listeners.delete(key),
  play: () => { playing = true; window.testCalls.push(['play']); }, pause: () => { playing = false; window.testCalls.push(['pause']); },
  next: () => { window.testCalls.push(['next']); }, back: () => { window.testCalls.push(['back']); },
  seek: value => { position = value; window.testCalls.push(['seek', value]); },
  setVolume: value => { volume = value; }, setShuffle: value => { shuffle = value; }, setRepeat: value => { repeat = value; }
} };
window.mountTestApp = () => createRoot(document.getElementById('root')).render(React.createElement(window.MyspotiDesktopApp));
