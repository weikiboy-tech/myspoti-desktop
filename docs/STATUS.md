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
| Windows-EXE-Installer (Vorschau) | Versionsprüfung und Installation auf vorhandenem Windows-x64-Setup live bestanden; frischer PC noch offen |
| Unabhängige Desktop-App | Noch nicht umgesetzt; Spotify bleibt Voraussetzung |
| AutoMix, Equalizer, eigener Offline-Player, Videos | Noch nicht umgesetzt |
| Vollständige Android-Ansichten, Wort-Lyrics, Extension-Sandbox | Noch nicht umgesetzt |

**Tests:** 15 Logiktests sowie Browser-Tests mit sechs Layouts und acht Interaktionsgruppen. Ein Browser-Test verwendet einen künstlichen Host und ersetzt keine Prüfung im echten Spotify-Client.

**Kompatibilität:** Lokal geprüft mit Spotify 1.3.8.620 und Spicetify 2.46.4. Diese Spotify-Version liegt über der von Spicetify angegebenen Unterstützung bis 1.3.7. Updates können die Integration beschädigen; keine allgemeine Stabilitätszusage.

[Konkrete Live-Testschritte](DESKTOP_ACCEPTANCE.md) · [Testbericht](DESKTOP_TEST_REPORT.md) · [Vollständige Arbeitsliste](FEATURE_PARITY_MATRIX.md)

## Linux-Vorschau

Gemeinsame Oberfläche und Browser-Host werden unter Ubuntu geprüft. Eigenes grafisches Python/Tk-Setup, Debian-/Ubuntu-Paket und portables Archiv. Die Release-Pipeline veröffentlicht erst nach erfolgreichen Windows- und Linux-Prüfungen: Logiktests, Browser-Layouts, Installer-Tests, Debian-Paketinstallation, GUI-Start und Start der offiziellen Linux-Spicetify-Binärdatei.

Linux-Installer-Tests prüfen Versionsgrenzen, beschädigte Downloads, gefährliche Archivpfade/Links, Pfade mit Leerzeichen, fehlgeschlagene Aktivierung und das Nichtkopieren von Profilinhalten. Die Installationstransaktion verwendet dabei künstliche Spotify-/Spicetify-Dateien; das ist kein Wiedergabenachweis.

**Noch offen:** echte Spotify-Wiedergabe unter Linux, frische Anmeldung, alle Distributionen/Desktops, Wayland und Systemintegration. Unterstützter Installer-Umfang: native Linux-x86_64-Installation, Spotify 1.2.14 bis 1.3.4. Snap, Flatpak, Nix, ARM nicht unterstützt. [Linux-Anleitung](INSTALL-LINUX.md).