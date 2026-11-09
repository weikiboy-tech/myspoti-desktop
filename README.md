<p align="center"><img src="docs/brand/myspoti-logo-256.png" width="88" alt="Myspoti"></p>
<h1 align="center">Myspoti für Windows & Linux</h1>
<p align="center">Deine Musik. Zwei Looks. Ein eigener Desktop-Einstieg.</p>
<p align="center"><a href="https://github.com/weikiboy-tech/myspoti-desktop/releases/download/v0.2.0-preview.1/Myspoti-Setup.exe"><b>⬇ Windows-Installer herunterladen (.exe)</b></a><br><a href="https://github.com/weikiboy-tech/myspoti-desktop/releases/download/v0.2.0-preview.1/Myspoti-Linux-Setup.deb"><b>⬇ Linux-Installer herunterladen (.deb)</b></a><br><sub>Vorschau · Windows x64 / Linux x86_64 · <a href="docs/STATUS.md">Kompatibilität prüfen</a></sub></p>
<p align="center"><a href="docs/INSTALL.md"><b>Installation</b></a> · <a href="docs/STATUS.md">Funktionen & Stand</a> · <a href="CONTRIBUTING.md">Mitentwickeln</a> · <a href="https://github.com/weikiboy-tech/myspoti-desktop/issues">Fehler melden</a></p>

> **Entwicklungsversion.** Myspoti läuft derzeit als eigene Oberfläche im Spotify-Desktop-Client. Es ist noch keine unabhängige Musik-App. Setup-Downloads für Windows und Linux sind als experimentelle Vorschau verfügbar. Unterstützte Spotify-Versionen und Linux-Paketarten stehen in den Anleitungen.

![Immersive-Ansicht mit künstlichen Testdaten](docs/screenshots/desktop-immersive-preview.png)
*Vorschau aus dem Browser-Test mit künstlichem Player, ohne echtes Spotify-Konto. Kein Nachweis vollständiger Funktionsparität.*

### Was du schon bekommst

- **Classic & Immersive:** zwei Ansichten mit Akzentfarbe, AMOLED-Option und reduzierter Bewegung.
- **Player:** Titel, Cover und Wiedergabesteuerung über den installierten Spotify-Client.
- **Songtexte:** eigene LRC-Dateien oder manueller LRCLIB-Abruf, mit zeilenweiser Navigation.
- **Desktop-Einstieg:** Myspoti-Symbol unter Windows auf Desktop/Startmenü, unter Linux im Anwendungsmenü.

Welche Funktionen im echten Client geprüft wurden und welche nur automatisiert: **[aktueller Stand](docs/STATUS.md)**.

### Installieren

**[Alle Downloads in Releases](https://github.com/weikiboy-tech/myspoti-desktop/releases/tag/v0.2.0-preview.1)** · [Windows-Anleitung](docs/INSTALL.md) · [Linux-Anleitung](docs/INSTALL-LINUX.md). Spotify muss bereits installiert sein; Spicetify wird aus offizieller Quelle bezogen und per SHA-256 geprüft. Unter Linux gibt es ein grafisches Debian-/Ubuntu-Paket sowie ein portables Archiv. Snap, Flatpak, Nix und ARM sind noch nicht unterstützt.

**Dein Konto bleibt deins:** Dieses Repository enthält keine Spotify-Anmeldedaten, Benutzerprofile oder Spotify-Binärdateien. Jeder Nutzer installiert Spotify selbst und nutzt sein eigenes Konto. Myspoti liefert keinen Premium-Zugang mit.

### Im Repository zurechtfinden

| Ordner | Inhalt |
|---|---|
| [`desktop/`](desktop/) | Gemeinsame Oberfläche, Windows-/Linux-Installer, Build und Tests |
| [`docs/`](docs/README.md) | Installation, Status und technische Dokumentation |
| [`base/`](base/) | Erhaltene Android-Originalquellen als Portierungsgrundlage |
| [`tools/`](tools/) | Werkzeuge des Android-Upstreams |

Die Android-App ist separat in der **[Original-README](README.android.md)** dokumentiert. Ihre Features sind keine Zusage für die Desktop-Version.

### Herkunft & Lizenz

Abgeleitet von **[Myspoti von kota-zo](https://github.com/kota-zo/myspoti)**. Das Immersive-Design hat seinen Ursprung in [BitChord](https://github.com/kushagrasinghx/BitChord). Originalquellen und Urheberhinweise bleiben erhalten. Nicht mit Spotify verbunden oder von Spotify unterstützt.

**[GPL-3.0](LICENSE)** · [Drittanbieterhinweise](THIRD_PARTY_NOTICES.md) · [Original-Credits](README.android.md#credits)
