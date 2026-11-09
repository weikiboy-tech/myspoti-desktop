# Desktop-Testbericht – 09.11.2026

**Gesamtauftrag nicht abgeschlossen.** Früher ausführbarer Spicetify-Prototyp, keine vollständige Android-Portierung.

## Fortsetzung: echte Spotify-Tests

Nach erneuter Freigabe und Zurücksetzen der Computer-Use-Sitzung gelang die Steuerung. Die Custom-App wurde über das M-Symbol geöffnet. Titel/Cover, Play/Pause mit fortlaufender Zeit, Seek und LRCLIB-Abruf wurden im echten Client beobachtet. Einzelne Testschritte stehen in [DESKTOP_ACCEPTANCE.md](DESKTOP_ACCEPTANCE.md). Die nachfolgenden Abschnitte enthalten außerdem die historische erste Testphase; deren Aussage „Myspoti noch nicht geöffnet“ ist durch diese Fortsetzung überholt.

## Ausgeführt

- `npm test`: **15 Tests bestanden**, 0 Fehler. Adapter, fehlende Sitzung, snake_case-/camelCase-Restriktionen, Werbezustand, Wertebereiche, Ereignisbereinigung, LRC, korrupte Einstellungen, Sleep Timer, Lyrics-Cache, Aufnahmeabgleich, Netzwerkfehler, Rate-Limits und Parallelität.
- `npm run build`: erfolgreich; JS-Syntaxprüfung und Custom-App-Paket mit Original-Lizenz und Drittanbieterhinweisen.
- Browser-Harness mit echtem React 19.2.0 und headless Brave: **6 Layoutfälle** (Classic/Immersive bei 1280×720, 1440×900, 1920×1080), ohne horizontalen Überlauf. **8 Interaktionsgruppen**: Play/Pause, Suchübergabe, LRC-Import/Seek, Timer, Designwechsel, Einstellungswiederherstellung, Berechtigungen und redigierte Fehleranzeige. Keine JS-Seitenfehler.
- Screenshots und JSON unter `desktop/test-results/`. Der orange Testhinweis kennzeichnet künstliche Daten. Diese Bilder sind **keine Spotify-Integrationsbelege**. Bei kleinen Höhen ist vertikales Scrollen erforderlich.
- LRCLIB-Livetest mit dem öffentlichen Dokumentationsbeispiel „I Want to Live“ (233 Sekunden): Treffer mit **47 synchronisierten Zeilen**. Keine Lyrics oder Zugangsdaten in Logs gespeichert. Browser-CORS/CSP im Spotify-Client noch nicht geprüft.
- Spicetify **2.46.4** heruntergeladen, projektlokal ausgeführt. ZIP-SHA256: `0490380BF59E00C94CF6CB12BFAC5152791B91BB8009ACEEF53C49815B45A56F` (lokaler Hash; keine unabhängige Attestierungsprüfung behauptet).
- Original-Ressourcen durch `spicetify backup` gesichert; `apply` erfolgreich mit Exitcode 0. Spotify **1.3.8.620** liegt oberhalb der angegebenen Windows-Kompatibilität bis 1.3.7.
- Originale Spotify-Oberfläche vor Integration beobachtet. Nach Integration zunächst schwarzer Ladezustand beobachtet; Nutzer bestätigte anschließend, dass Spotify läuft. **Myspoti war laut Nutzer noch nicht geöffnet.** Keine Wiederherstellung ausgeführt.
- Computer-Use meldete Escape-Abbruch. Nach ausdrücklicher erneuter Freigabe meldete bereits die Fensterabfrage erneut einen Abbruch. Keine weiteren UI-Aktionen ausgeführt.

## Noch nicht ausgeführt / nicht bestanden behauptet

Laden der Custom-App im echten Client; tatsächliche Wiedergabe, Seek, Shuffle/Repeat, Queue, Suche, Bibliotheksnavigation, LRCLIB und Timer im Spotify-Host; Neustart-/Update-Kompatibilität; Connect mit zweitem Gerät; Offline-Medien; AutoMix/DSP; Extension-Isolation; Android-Gradle-Tests. Die künstlichen Tests ersetzen diese Prüfungen nicht.

## Reproduktion

```powershell
cd desktop
npm ci --ignore-scripts
npm test
npm run build
$env:MYSPOTI_TEST_BROWSER = 'C:\Program Files\BraveSoftware\Brave-Browser\Application\brave.exe'
npm run test:browser
```

Ein Chromium-kompatibler Browser muss lokal vorhanden sein. Tests benutzen ein frisches Headless-Profil und einen nur an 127.0.0.1 gebundenen temporären HTTP-Server, der nach dem Test geschlossen wird. Das echte Browserprofil des Nutzers wird nicht benutzt.
