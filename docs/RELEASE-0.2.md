# Windows & Linux – Setup-Vorschau

Die Installer stehen unten unter **Assets**. Nicht die automatisch angebotenen Source-code-Archive wählen, wenn du nur installieren möchtest.

| Betriebssystem | Download | Start |
|---|---|---|
| Windows x64 | **Myspoti-Setup.exe** | EXE öffnen → prüfen → installieren |
| Ubuntu / Debian x86_64 | **Myspoti-Linux-Setup.deb** | Paket installieren → Myspoti Setup im Anwendungsmenü |
| Andere native Linux-Distributionen x86_64 | **Myspoti-Linux-Setup.tar.gz** | Entpacken → `python3 setup.py` (Python/Tk erforderlich) |

**Spotify bleibt Voraussetzung.** Myspoti ist eine Oberfläche im offiziellen Client, noch kein unabhängiger Musikplayer. Keine Anmeldung, Cookies oder Spotify-Binärdateien werden mitgeliefert.

Windows: Spotify 1.3.8.620, lokal installierte Vorschau erfolgreich getestet. Noch nicht signiert; die Kombination liegt oberhalb der angegebenen Windows-Spicetify-Unterstützung bis 1.3.7.

Linux: native Spotify-Installation 1.2.14 bis 1.3.4. Snap, Flatpak, Nix und ARM sind nicht unterstützt. Eigene lokale Programm-Kopie und getrennte Konfiguration; keine globalen Schreibrechte oder abgeschaltete Sandbox. Ubuntu-CI prüft Logik, Paketinstallation, GUI-Start und Browser-Integration mit künstlichem Spotify-Host. **Echte Spotify-Wiedergabe auf Linux ist noch nicht live abgenommen.**

[Windows-Anleitung](https://github.com/weikiboy-tech/myspoti-desktop/blob/main/docs/INSTALL.md) · [Linux-Anleitung](https://github.com/weikiboy-tech/myspoti-desktop/blob/main/docs/INSTALL-LINUX.md) · [Funktionsstand](https://github.com/weikiboy-tech/myspoti-desktop/blob/main/docs/STATUS.md)

SHA256SUMS.txt enthält die Prüfsummen aller drei Installer. Vollständiger Quellcode: dieser Release-Tag; die Pakete enthalten zusätzlich den genauen Build-Commit. GPL-3.0, abgeleitet von [kota-zo/myspoti](https://github.com/kota-zo/myspoti), mit erhaltenen Urheber- und Drittanbieterhinweisen.
