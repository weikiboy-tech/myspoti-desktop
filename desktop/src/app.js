// SPDX-License-Identifier: GPL-3.0-only
// Myspoti and BitChord design attribution: see ../../../THIRD_PARTY_NOTICES.md.
function render() { return Spicetify.React.createElement(MyspotiDesktopApp); }
function MyspotiDesktopApp() {
  const R = Spicetify.React, h = R.createElement, C = globalThis.MyspotiDesktopCore;
  const adapter = R.useMemo(() => new C.Adapter(Spicetify), []);
  const [state, setState] = R.useState(() => adapter.snapshot());
  const [settings, setSettings] = R.useState(() => C.readSettings(localStorage));
  const [error, setError] = R.useState('');
  const [query, setQuery] = R.useState('');
  const [lyrics, setLyrics] = R.useState({ uri: '', lines: [] });
  const [lyricsStatus, setLyricsStatus] = R.useState('');
  const lyricsClient = R.useMemo(() => new C.LyricsClient(), []);
  const lyricsAbort = R.useRef(null);
  const [tab, setTab] = R.useState('player');
  const [tick, setTick] = R.useState(0);
  const panel = R.useRef(null), lyricRef = R.useRef(null);
  const timer = globalThis.MyspotiDesktopRuntime?.timer;
  const run = async action => { try { await action(); setError(''); setState(adapter.snapshot()); } catch { setError('Aktion fehlgeschlagen oder von Spotify abgelehnt. Bitte erneut versuchen.'); } };
  R.useEffect(() => {
    const refresh = () => setState(adapter.snapshot());
    const unsubscribe = adapter.subscribe(refresh);
    const interval = setInterval(() => { refresh(); setTick(x => x + 1); }, 1000);
    return () => { unsubscribe(); clearInterval(interval); };
  }, [adapter]);
  const lines = lyrics.uri === state.uri ? lyrics.lines : [];
  R.useEffect(() => { lyricsAbort.current?.abort(); setLyricsStatus(''); return () => lyricsAbort.current?.abort(); }, [state.uri]);
  const active = C.activeLine(lines, state.position);
  R.useEffect(() => { lyricRef.current?.scrollIntoView({ behavior: settings.reduceMotion ? 'auto' : 'smooth', block: 'nearest' }); }, [active, settings.reduceMotion]);
  function update(patch) {
    const next = { ...settings, ...patch };
    try { localStorage.setItem('myspoti.desktop.v1', JSON.stringify(next)); setSettings(next); } catch { setError('Einstellungen konnten nicht gespeichert werden.'); }
  }
  function navigate(path) { return run(() => { if (!Spicetify.Platform?.History?.push) throw Error(); Spicetify.Platform.History.push(path); }); }
  const button = (label, action, disabled = false, extra = {}) => h('button', { type: 'button', onClick: () => void run(action), disabled, ...extra }, label);
  const command = (label, method, argument) => button(label, () => adapter.command(method, argument), !adapter.allowed(method, argument));
  const time = ms => { const s = Math.floor(Math.max(0, ms) / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
  async function loadLyrics(event) {
    const file = event.target.files?.[0]; if (!file) return;
    const uri = state.uri;
    if (file.size > 500000) { setError('LRC-Datei darf maximal 500 KB groß sein.'); return; }
    try { const parsed = C.parseLrc(await file.text()); if (!parsed.length) throw Error(); setLyrics({ uri, lines: parsed }); setLyricsStatus('Quelle: eigene LRC-Datei'); setError(''); }
    catch { setError('Keine gültigen zeitgestempelten LRC-Zeilen gefunden.'); }
    event.target.value = '';
  }
  async function findLyrics() {
    lyricsAbort.current?.abort(); const controller = new AbortController(); lyricsAbort.current = controller;
    const timeout = setTimeout(() => controller.abort(), 12000), uri = state.uri;
    setLyricsStatus('Songtext wird gesucht …');
    try {
      const result = await lyricsClient.get(state, controller.signal);
      if (controller.signal.aborted || adapter.snapshot().uri !== uri) return;
      setLyrics({ uri, lines: result?.lines || [], plain: result?.plain || '' });
      setLyricsStatus(result?.instrumental ? 'Instrumentaltitel' : result ? 'Quelle: LRCLIB' : 'Kein passender Songtext gefunden.');
    } catch (failure) {
      if (adapter.snapshot().uri === uri) setLyricsStatus(failure.message === 'LYRICS_WAIT' ? 'LRCLIB verlangt eine Wartezeit. Bitte später erneut versuchen.' : 'Songtext nicht verfügbar. Netzwerk, Zeitlimit oder abweichende Aufnahme.');
    } finally { clearTimeout(timeout); }
  }
  const navigation = h('nav', { 'aria-label': 'Spotify-Navigation' },
    ...[['Startseite', '/'], ['Suche', '/search'], ['Bibliothek', '/collection'], ['Lieblingssongs', '/collection/tracks'], ['Warteschlange', '/queue']].map(([label, path]) => button(label, () => navigate(path))),
    button('Einstellungen', () => setTab(tab === 'settings' ? 'player' : 'settings')));
  const search = h('form', { onSubmit: event => { event.preventDefault(); if (query.trim()) void navigate('/search/' + encodeURIComponent(query.trim())); } },
    h('input', { type: 'search', 'aria-label': 'In Spotify suchen', placeholder: 'Titel, Künstler, Album …', value: query, onChange: e => setQuery(e.target.value), maxLength: 500 }), h('button', { type: 'submit', disabled: !query.trim() }, 'Suchen'));
  const player = h('div', { className: 'msp-player-grid' },
    h('section', { className: 'msp-now', 'aria-label': 'Aktueller Titel' },
      state.image ? h('img', { className: 'msp-cover', src: state.image, alt: `Cover: ${state.album}`, referrerPolicy: 'no-referrer' }) : h('div', { className: 'msp-cover msp-empty' }, 'Myspoti'),
      h('h2', null, state.title), h('p', { className: 'msp-muted' }, state.artist || 'Starte einen Titel in Spotify.'),
      h('label', null, 'Position', h('input', { type: 'range', min: 0, max: Math.max(state.duration, 1), step: 1000, value: Math.min(state.position, state.duration), disabled: !adapter.allowed('seek'), 'aria-valuetext': time(state.position), onChange: e => void run(() => adapter.command('seek', Number(e.target.value))) })),
      h('div', { className: 'msp-times' }, h('span', null, time(state.position)), h('span', null, time(state.duration))),
      h('div', { className: 'msp-controls' }, command('Zurück', 'back'), command(state.playing ? 'Pause' : 'Abspielen', state.playing ? 'pause' : 'play'), command('Weiter', 'next')),
      h('div', { className: 'msp-controls' }, command(state.shuffle ? 'Shuffle: an' : 'Shuffle: aus', 'setShuffle', !state.shuffle), command(['Repeat: aus', 'Repeat: alle', 'Repeat: Titel'][state.repeat] || 'Repeat', 'setRepeat', (state.repeat + 1) % 3)),
      h('label', null, 'Lautstärke', h('input', { type: 'range', min: 0, max: 1, step: .01, value: state.volume, disabled: !adapter.allowed('setVolume'), onChange: e => void run(() => adapter.command('setVolume', Number(e.target.value))) }))),
    h('section', { className: 'msp-detail' }, h('h2', null, 'Songtexte'),
      h('p', { className: 'msp-muted' }, 'Eigene LRC-Datei für den aktuellen Titel laden. Die Datei bleibt in dieser Sitzung.'),
      button('Bei LRCLIB suchen', findLyrics, !state.uri || !state.artist || lyricsStatus === 'Songtext wird gesucht …'),
      h('p', { className: 'msp-muted' }, 'Bei der Suche werden Titel, Künstler, Album und Dauer an LRCLIB gesendet.'),
      h('p', { role: 'status' }, lyricsStatus),
      h('label', { className: 'msp-file' }, 'LRC importieren', h('input', { type: 'file', accept: '.lrc,text/plain', disabled: !state.uri, onChange: loadLyrics })),
      h('div', { className: 'msp-lyrics', 'aria-label': 'Synchronisierte Songtexte' }, lines.length ? lines.map((line, index) => h('button', {
        type: 'button', key: index, ref: index === active ? lyricRef : null, className: index === active ? 'active' : '',
        'aria-current': index === active ? 'true' : undefined, disabled: !adapter.allowed('seek'), onClick: () => void run(() => adapter.command('seek', line.time))
      }, line.text || '♪')) : h('p', { style: { whiteSpace: 'pre-wrap' } }, lyrics.uri === state.uri && lyrics.plain ? lyrics.plain : 'Noch kein Songtext für diesen Titel geladen.')),
      h('div', { className: 'msp-timer' }, h('h3', null, 'Sleep Timer'),
        h('div', { className: 'msp-controls' }, ...[15, 30, 60].map(minutes => button(`${minutes} Min.`, () => timer.start(minutes), !timer)), button('Abbrechen', () => timer.cancel(), !timer?.deadline)),
        h('p', { role: 'status' }, timer?.deadline ? `Pause in ${Math.max(0, Math.ceil((timer.deadline - Date.now()) / 60000))} Minuten` : timer?.error || 'Timer aus'))));
  const preferences = h('section', { className: 'msp-settings' }, h('h2', null, 'Darstellung'),
    h('label', null, 'Design', h('select', { value: settings.mode, onChange: e => update({ mode: e.target.value }) }, h('option', { value: 'classic' }, 'Classic'), h('option', { value: 'immersive' }, 'Immersive'))),
    h('label', null, 'Akzentfarbe', h('input', { type: 'color', value: settings.accent || (settings.mode === 'immersive' ? '#ff4f7b' : '#1db954'), onChange: e => update({ accent: e.target.value }) })),
    ...[['amoled', 'AMOLED-Schwarz'], ['reduceMotion', 'Animationen reduzieren']].map(([key, label]) => h('label', { key }, h('input', { type: 'checkbox', checked: settings[key], onChange: e => update({ [key]: e.target.checked }) }), label)),
    h('p', null, 'Anmeldung, Musikbibliothek, Playlists, Connect und Medien-Tasten werden weiterhin von Spotify verwaltet.'),
    h('p', null, 'Vorabversion: AutoMix, externe Lyrics-Provider, Video- und Erweiterungssystem sind noch nicht portiert.'),
    h('p', null, 'Myspoti Desktop · GPL-3.0 · Ursprung: kota-zo/myspoti. Immersive-Design mit Herkunft aus BitChord.'));
  return h('main', { ref: panel, className: `msp-desktop ${settings.mode}${settings.amoled ? ' amoled' : ''}${settings.reduceMotion ? ' reduce-motion' : ''}`, style: { '--msp-accent': settings.accent || (settings.mode === 'immersive' ? '#ff4f7b' : '#1db954') } },
    h('header', null, h('div', null, h('p', { className: 'msp-eyebrow' }, 'DEIN SPOTIFY. DEIN MOMENT.'), h('h1', null, 'Myspoti Desktop')),
      h('div', { className: 'msp-controls' }, button(settings.mode === 'classic' ? 'Immersive' : 'Classic', () => update({ mode: settings.mode === 'classic' ? 'immersive' : 'classic' })),
        button('Vollbild', () => document.fullscreenElement ? document.exitFullscreen() : panel.current.requestFullscreen(), !document.fullscreenEnabled))),
    navigation, search, error && h('p', { role: 'alert', className: 'msp-error' }, error), tab === 'settings' ? preferences : player);
}
