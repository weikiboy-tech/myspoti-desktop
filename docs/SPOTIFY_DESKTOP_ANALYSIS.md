# Spotify Desktop: Evidenzstand

## Aktualisierung nach freigegebener Einrichtung

Spicetify 2.46.4 wurde inzwischen installiert, die Original-Ressourcen gesichert und die Custom-App angewendet (Exitcode 0). Der Nutzer bestätigt, dass Spotify läuft; die Myspoti-Ansicht wurde noch nicht geöffnet/verifiziert. Die folgenden ursprünglichen Tabellenzeilen dokumentieren den Zustand vor Einrichtung.

REA 6.8.0 wurde isoliert unter `../myspoti-tools/rea` installiert, mit offizieller Node-Laufzeit 26.13.0. Node-ZIP-SHA256 `DCC60D59A0746999F99064A01C020445D54D84228C691CDBF25B49AC3B59150A`, gegen offizielle SHASUMS256 geprüft. Keine globale Node-Installation ersetzt. `setup --client codex --dry-run` ausgeführt; keine MCP-/Skill-Konfiguration geändert.

REA `inspect-desktop-application` tatsächlich ausgeführt: Evidence-ID `ev_349b6c0c329a3cea29e98e23ae364ff6cbf68e96ea2bea4b0769a7f77818c42d`. 500 Einträge, 14 Dateikopfprüfungen, 4760 gelesene Bytes. Coverage ausdrücklich partial; Eintragslimit erreicht, keine Runtime-Kandidaten zugeordnet. Rohbericht nur lokal in `../myspoti-tools/spotify-inspection.json`, nicht im Release. Diese Inspektion erfolgte nach Spicetify-Anwendung und beschreibt deshalb keinen unveränderten Originalzustand. Keine Laufzeit-/Implementierungsschlüsse aus Dateinamen. Details zu UI-Abbruch und Tests: DESKTOP_TEST_REPORT.md.

09.11.2026, Windows, Spotify-Dateiversion **1.3.8.620**.

| Gegenstand | Evidenz | Einordnung |
|---|---|---|
| Installation | `%APPDATA%/Spotify/Spotify.exe`, Dateiversion aus VersionInfo gelesen | Beobachtete Datei, kein Laufzeitnachweis |
| Werkzeuge | Git, Node 24.15.0, npm 11.12.1 und Java gefunden | Beobachtet |
| Spicetify | Nicht im PATH; übliche AppData-Verzeichnisse nicht gefunden | Nicht eingerichtet an geprüften Stellen |
| REA | Nicht im PATH und nicht als Sitzungstool vorhanden; Node-Voraussetzung derzeit nicht erfüllt | Analyse mit REA BLOCKED |
| Eigene Ansichten | Dokumentiertes Custom-App-Format mit render(), manifest.json, style.css | Dokumentierte Integrationsmöglichkeit; Client 1.3.8.620 noch nicht verifiziert |
| Playback | Wrapper dokumentiert Player-Steuerung und Ereignisse | Adapter implementiert; Live-Wiedergabe nicht beobachtet |
| Navigation | History.push als Custom-App-Beispiel dokumentiert | Native Routen im Prototyp; pro Route Live-Test offen |
| Queue | Offizielle Spotify-Ansicht wird über /queue aufgerufen | Keine eigene Drag-Reorder-Implementierung |
| Bibliothek/Playlists | Native Spotify-Oberfläche bleibt Host-Aufgabe | Originalverhalten für dieses Konto nicht getestet |
| Lyrics | Eigener lokaler LRC-Renderer | Keine Behauptung eines lizenzierten Online-Providers |
| Einstellungen | App-eigene Darstellungseinstellungen, lokaler Speicher | Implementiert; Unit-/Harness-Tests separat |
| Connect/Medien-Tasten | Beim originalen Spotify-Client belassen | Kein zusätzlicher Nachweis, zweites Gerät erforderlich |
| Update | Interne PlayerState-Struktur laut Spicetify veränderlich | Fail-closed bei fehlenden Methoden/Sitzung; Integration nach jedem Update neu prüfen |

Fenster, Menüs, Konto, Wiedergabe und tatsächlicher App-Ladevorgang wurden noch nicht mit UI-Automation oder REA beobachtet. Kein Spotify-Code dekompiliert, keine Token gelesen, keine Installation gepatcht. Es gibt deshalb keine REA-Ergebnisse oder erfolgreiche Live-Integration zu melden.

Quellen: https://spicetify.app/docs/development/custom-apps, https://spicetify.app/docs/development/api-wrapper/types/player-state, https://github.com/morluto/rea.
