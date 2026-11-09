# Funktionen & Stand

Stand: 9. November 2026. Entwicklungsversion, keine vollständige Android-Portierung.

| Funktion | Nachweis |
|---|---|
| Myspoti-Start über Desktop-Symbol | Im echten Windows-Client geprüft |
| Titel, Cover, Play/Pause, Seek | Im echten Spotify-Client geprüft |
| Manueller LRCLIB-Abruf | Im echten Spotify-Client geprüft; titelabhängig |
| Classic/Immersive und gespeicherte Darstellung | Browser-Test bestanden; Live-Abnahme offen |
| Lokaler LRC-Import und zeilenweises Seek | Logik-/Browser-Tests bestanden |
| Sleep Timer | Logik-/Browser-Tests bestanden; echter Ablauf noch offen |
| Einfacher EXE-Installer | In Arbeit; noch kein Download |
| Unabhängige Desktop-App | Noch nicht umgesetzt; Spotify bleibt Voraussetzung |
| AutoMix, Equalizer, eigener Offline-Player, Videos | Noch nicht umgesetzt |
| Vollständige Android-Ansichten, Wort-Lyrics, Extension-Sandbox | Noch nicht umgesetzt |

**Tests:** 15 Logiktests sowie Browser-Tests mit sechs Layouts und acht Interaktionsgruppen. Ein Browser-Test verwendet einen künstlichen Host und ersetzt keine Prüfung im echten Spotify-Client.

**Kompatibilität:** Lokal geprüft mit Spotify 1.3.8.620 und Spicetify 2.46.4. Diese Spotify-Version liegt über der von Spicetify angegebenen Unterstützung bis 1.3.7. Updates können die Integration beschädigen; keine allgemeine Stabilitätszusage.

[Konkrete Live-Testschritte](DESKTOP_ACCEPTANCE.md) · [Testbericht](DESKTOP_TEST_REPORT.md) · [Vollständige Arbeitsliste](FEATURE_PARITY_MATRIX.md)
