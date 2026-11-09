// SPDX-License-Identifier: GPL-3.0-only
// Source inventory: lexical navigation aid, not a semantic or runtime proof.
const fs = require('node:fs'), path = require('node:path');
const root = path.resolve(__dirname, '../..');
const walk = dir => fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
const files = walk(path.join(root, 'base')).filter(p => /\.(kt|kts|js)$/.test(p));
const relative = p => path.relative(root, p).replaceAll('\\', '/');
const index = files.map(p => { const source = fs.readFileSync(p, 'utf8'); return { path: relative(p), module: relative(p).split('/')[1], androidImports: [...source.matchAll(/^import (android\.[^\s]+|androidx\.[^\s]+)/gm)].map(x => x[1]), imports: [...source.matchAll(/^import ([^\s]+)/gm)].map(x => x[1]), declarations: [...source.matchAll(/\b(?:class|interface|object)\s+(\w+)/g)].map(x => x[1]), test: /\/src\/(test|androidTest)\//.test(relative(p)) }; });
fs.writeFileSync(path.join(root, 'docs/DESKTOP_SOURCE_INDEX.json'), JSON.stringify(index, null, 2));
const groups = [
 ['D1 Classic', 'HomeViewModel.kt,SearchViewModel.kt,LibraryViewModel.kt,ArtistViewModel.kt,PlayerViewModel.kt,Color.kt', 'Klassische Navigation;Startseite;Suche;Bibliothek;Albumansicht;Künstleransicht;Playlists;Player;Warteschlange;Einstellungen'],
 ['D1 Immersive', 'ImmersivePlayer.kt,ImmersiveTheme.kt,ImmersiveMotion.kt,MeshGradient.kt,ImmersiveGlass.kt', 'Animierter Vollbildplayer;Dynamische Cover-Hintergründe;Mesh-Gradienten;Liquid-Glass-Elemente;Transparente Navigationsleisten;Weiche Animationen;Animierte Songtexte;Immersive Queue;Pop-ups Panels und Sheets'],
 ['D2 Player', 'PlayerViewModel.kt,SongPlayer.kt,CurrentSongState.kt,ShuffleOrder.kt,ImmersiveSleepTimerSheet.kt,LastSession.kt', 'Play/Pause;Vorheriger und nächster Titel;Seek;Lautstärke;Shuffle;Myspoti-Shuffle;Smart Shuffle;Wiederholungsmodi;Repeat Once;Sleep Timer;Wiedergabewarteschlange;Drag-and-drop-Reihenfolge;Play Next;Hinzufügen zur Warteschlange;Synchronisierung des Player-Zustands;Fehlerbehandlung;Sitzung wiederherstellen;Media Keys und Systemintegration'],
 ['D3 Audio', 'BeatThis.kt,MixPlanner.kt,SegueDeck.kt,EqualizerProcessor.kt,LocalPlayer.kt', 'Beat-Analyse;Übergangsplanung;Zwei Audiodecks;Übergangsdauer;Tempoanpassung;Crossfade;Quick Mix;Real Mix;10-Band-Equalizer;Equalizer-Presets;Lautheitsanpassung;Playback Speed;Skip Silence;Audio-Diagnose;Raumklangfunktionen'],
 ['D4 Lyrics', 'LyricsViewModel.kt,LyricsApi.kt,Lyrics.kt,SweptLyricLine.kt,LyricsRomanize.kt,GeniusMeaning.kt', 'Synchronisierte Lyrics;Wortgenaues Highlighting;Zeilenweise Darstellung;Scroll-Animation;Karaoke-Effekt;Übersetzungen;Romanisierung;Lyrics-Quellenwahl;Suche nach fehlenden Songtexten;Wort anklicken zur Navigation;Genius-Songbedeutungen;Erklärung markierter Textstellen'],
 ['D5 Video', 'MusicVideoController.kt,YouTubeSource.kt,MusicVideoMatch.kt,MusicVideo.kt,AudioAlign.kt', 'Suche nach offiziellen Musikvideos;Player-Ansicht;Vollbildmodus;Synchronisationsdarstellung;Video-Einstellungen;Fehler- und Verfügbarkeitszustände'],
 ['D6 Bibliothek', 'LibraryViewModel.kt,SearchViewModel.kt,SpotifyLibrary.kt,SpotifyContent.kt,Api.kt', 'Suche und Bibliothek;Lieblingssongs;Künstler und Alben;Ordner;Playlist-Erstellung;Umbenennung;Beschreibung und Cover;Sortierung;Manuelle Reihenfolge;Songs hinzufügen und entfernen;Kollaborative Playlists;Teilen und Spotify Codes;Zuletzt gehört;Entdecken und neue Veröffentlichungen;Playlist-Vorschläge'],
 ['D7 Extensions', 'Manifest.kt,Catalog.kt,ExtensionRuntime.kt,SafeNet.kt,Store.kt,Updates.kt', 'Extension Store;Installation mit Benutzerbestätigung;Berechtigungsanzeige;Vertrauenshinweise;Aktivieren und Deaktivieren;Update-Verwaltung;Konfiguration;Lyrics-Provider;UI-Erweiterungen;Zulässige Medienquellen;Ausführungsisolation;Domain-Allowlisting;Schutz lokaler Netzwerkdienste;Begrenzung von Dateisystem- und Prozessrechten'],
 ['D8 Offline', 'LocalMusic.kt,LocalPlayer.kt,LocalPlaylists.kt,OfflineStore.kt,OfflineDownloader.kt,OfflineCrypto.kt,OfflineCollections.kt,LastSession.kt', 'Import;Lokale Bibliothek;Offline-Wiedergabe;Autorisierte Download-Verwaltung;Verschlüsselte Speicherung;Synchronisierung lokaler Listen;Wiederaufnahme nach Neustart;Quellenverwaltung'],
 ['D9 Zusätzlich', 'ShowViewModel.kt,EpisodeViewModel.kt,SponsorBlockPref.kt,RadioPlayer.kt,ListenHistory.kt,SpotifyMore.kt,SettingsPref.kt,LastSession.kt', 'Podcasts und Hörbücher;SponsorBlock;Internet-Live-Radio;Hörstatistiken;Persönlicher Recap;Mehrere Accounts;Friends;Jam;Spotify Connect;Audiostream-Informationen;Neue Veröffentlichungen;Akzentfarben;Dark und AMOLED;Sprachoptionen;Tastaturkürzel;Diagnoseexport;Wiederherstellung der letzten Sitzung'],
 ['D10 Grenzen', 'AdRecoveryRules.kt,LicenceRefusals.kt,AccountPlan.kt,SongPlayer.kt', 'Werbeunterdrückung;Free-Account-Beschränkungen umgehen;DRM oder Premium-Downloads extrahieren;Alternative Audioquellen ohne Berechtigungsnachweis']
];
const partial = new Set(['Play/Pause','Vorheriger und nächster Titel','Seek','Lautstärke','Shuffle','Wiederholungsmodi','Sleep Timer','Synchronisierung des Player-Zustands','Fehlerbehandlung','Synchronisierte Lyrics','Zeilenweise Darstellung','Scroll-Animation','Akzentfarben','Dark und AMOLED','Klassische Navigation','Startseite','Suche','Bibliothek','Player','Warteschlange','Einstellungen','Animierter Vollbildplayer','Transparente Navigationsleisten','Weiche Animationen']);
const esc = s => String(s).replaceAll('|', '\\|').replaceAll('\n', ' ');
const link = p => `[${path.basename(p)}](../${p})`;
let matrix = '# Feature-Paritätsmatrix\n\nBasis: `95a24e7e4de82ec89d4ec11d5b05b146c44d78e7`. Stand 09.11.2026.\n\nDies ist ein vollständiges **Anforderungsinventar D1–D10**, keine abgeschlossene semantische Analyse jeder Funktion. Die Quellzuordnung nennt relevante Einstiegspunkte je Funktionsgruppe; für eine Einzelmethode kann weitere Zuordnung fehlen. Der maschinelle Quellindex enthält Klassen/Interfaces, Imports und Testdateien aller acht Module; er ersetzt keine Codeprüfung.\n\nStatus: IMPLEMENTED = Code vorhanden; PARTIAL = nur Teilumfang; BLOCKED = konkrete Voraussetzung fehlt; UNSUPPORTED = bewusst ausgeschlossen; NOT_STARTED = noch nicht implementiert; VERIFIED = gesamter genannter Desktop-Umfang real geprüft. **Keine Zeile ist aufgrund eines Android-Tests VERIFIED.** Native Spotify-Funktionen sind Wiederverwendungskandidaten, solange Client-/Kontotests fehlen.\n\n';
for (const [group, names, features] of groups) {
  const sources = names.split(',').flatMap(name => index.filter(f => path.basename(f.path) === name && !f.test).map(f => f.path));
  const tests = names.split(',').flatMap(name => index.filter(f => f.test && path.basename(f.path) === name.replace('.kt','Test.kt')).map(f => f.path));
  matrix += `## ${group}\n\n| Feature | Android-Quelldateien | Spotify-Desktop-Originalverhalten | Desktop-Implementierung | Abhängigkeiten | Status | Tests | Einschränkungen |\n|---|---|---|---|---|---|---|---|\n`;
  for (const feature of features.split(';')) {
    const excluded = group.startsWith('D10'), audio = group.startsWith('D3'), implemented = partial.has(feature) && !group.startsWith('D5');
    const status = excluded ? 'UNSUPPORTED' : audio ? 'BLOCKED' : implemented ? 'PARTIAL' : 'NOT_STARTED';
    const implementation = implemented ? (group.startsWith('D4') ? 'Lokaler LRC-Import und manueller LRCLIB-Abruf; übrige Provider fehlen' : 'desktop/src/app.js und core.js; siehe README zum Teilumfang') : 'Keine eigene Implementierung';
    const original = /D6|D8|D9|D2|Classic/.test(group) ? 'Native Funktion ggf. wiederverwenden; genaue Verfügbarkeit im Konto noch nicht geprüft' : 'Keine Myspoti-Parität vorausgesetzt';
    const deps = audio ? 'JVM/ONNX; autorisierte PCM-Quelle und neuer Audiohost' : group.startsWith('D7') ? 'Rhino/JVM, isolierter Dienst, Manifest/Netzwerkschutz' : group.startsWith('D4') ? 'Player-Zeitachse, LRC; später lizenzierter Provider' : 'Spotify, Spicetify; Android-Abhängigkeiten im Quellindex';
    const limitation = excluded ? 'Vom Nutzer ausdrücklich ausgeschlossen; keine Umgehung' : audio ? 'Keine unterstützte Spotify-PCM-Verarbeitung nachgewiesen; lokaler Audiohost fehlt' : implemented ? 'Noch kein Live-Nachweis im Spotify-Client; Android-Parität unvollständig' : 'Portierung ausstehend; native Alternativen nicht als Erfolg gezählt';
    matrix += '| ' + [feature, sources.map(link).join('<br>'), original, implementation, deps, status, (implemented ? 'Node-Adapter-/Harness-Tests; Live-Test offen. ' : 'Keine Desktop-Tests. ') + (tests.length ? 'Upstream, nicht ausgeführt: ' + tests.map(link).join('<br>') : 'Upstream-Testzuordnung noch offen'), limitation].map(esc).join(' | ') + ' |\n';
  }
  matrix += '\n';
}
matrix += '## Zusätzliches Upstream-API-Inventar\n\nDie folgenden Einzelzeilen stammen aus docs/api/feature-inventory.md. Upstream-Status ist kein Desktop-Nachweis; zusätzliche Features bleiben separat offen.\n\n| Feature | Android-Quelldateien | Spotify-Desktop-Originalverhalten | Desktop-Implementierung | Abhängigkeiten | Status | Tests | Einschränkungen |\n|---|---|---|---|---|---|---|---|\n';
const inventory = fs.readFileSync(path.join(root,'docs/api/feature-inventory.md'),'utf8');
for (const line of inventory.split('\n')) {
  if (!line.startsWith('| ') || line.startsWith('| Feature ')) continue;
  const cols = line.split('|').slice(1,-1).map(s => s.trim());
  if (cols.length < 3) continue;
  matrix += '| ' + [cols[0], '[API-Vertrag](../base/api/src/main/kotlin/app/myspoti/api/Api.kt); detaillierte Einzelzuordnung offen', 'Noch nicht am Desktop geprüft', 'Nicht separat portiert', cols[2], 'NOT_STARTED', 'Upstream-Live-Tests nicht lokal ausgeführt', 'Upstream-Einstufung: '+cols[1]].map(esc).join(' | ') + ' |\n';
}
fs.writeFileSync(path.join(root,'docs/FEATURE_PARITY_MATRIX.md'),matrix);
console.log(`${index.length} Quelldateien inventarisiert, ${groups.reduce((n,g)=>n+g[2].split(';').length,0)} Anforderungen plus Upstream-API-Zeilen erfasst.`);
