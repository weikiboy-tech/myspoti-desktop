# Myspoti unter Linux installieren

## Ubuntu / Debian (x86_64)

1. **[Myspoti-Linux-Setup.deb herunterladen](https://github.com/weikiboy-tech/myspoti-desktop/releases/download/v0.2.0-preview.1/Myspoti-Linux-Setup.deb)**.
2. Das Paket mit der Softwareverwaltung öffnen und installieren. Alternativ: `sudo apt install ./Myspoti-Linux-Setup.deb` im Download-Ordner.
3. **Myspoti Setup** im Anwendungsmenü öffnen, **Nur prüfen** wählen.
4. Spotify vollständig schließen, den Einrichtungshinweis bestätigen und **Myspoti installieren** wählen.
5. Danach **Myspoti** im Anwendungsmenü starten.

Der Paketmanager installiert Python/Tk-Abhängigkeiten. Die eigentliche Myspoti-Einrichtung läuft als normaler Benutzer; nicht mit sudo starten. Internetzugang wird für den geprüften Spicetify-Download benötigt.

## Voraussetzungen und Grenzen

- Linux x86_64, Python 3.10 oder neuer, Tk und eine vorhandene **native** Spotify-Installation.
- Spotify aus `/usr/share/spotify`, `/opt/spotify` oder dem Benutzerpfad von `spotify-launcher` wird erkannt.
- Spotify einmal normal starten und anmelden, danach vollständig schließen.
- Versionsbereich: Spotify 1.2.14 bis 1.3.4, entsprechend [Spicetify 2.46.4 für Linux](https://github.com/spicetify/cli/releases/tag/v2.46.4). Neuere Versionen werden vor Änderungen abgewiesen.
- Snap, Flatpak, Nix und ARM sind mit diesem Installer **nicht unterstützt**. Eine plattformübergreifende Oberfläche bedeutet nicht automatisch Unterstützung jeder Paketierungsart.
- Vorschau: CI prüft unter Ubuntu Installer-Logik, Debian-Paket, GUI-Start, Spicetify-Binärdatei und den Browser-Host. Echte Spotify-Wiedergabe auf Linux, alle Distributionen, Wayland-Konfigurationen und Geräte sind noch nicht live abgenommen.

## Was installiert wird

Die heruntergeladenen Pakete enthalten nur Myspoti-Code, Logo, Lizenzen und Quellverweis. Der Installer kopiert die **bereits lokal installierten Spotify-Programmdateien** nach `$XDG_DATA_HOME/myspoti` (Standard: `~/.local/share/myspoti`). Dort wird Myspoti mit einer getrennten Spicetify-Konfiguration eingerichtet. Systemdateien und bestehende Spicetify-Anpassungen werden nicht überschrieben. Es werden keine weltweiten Schreibrechte vergeben und keine Sandbox abgeschaltet.

Die lokale Spotify-Anmeldung wird vom offiziellen Client verwendet. Sie wird weder in das Installationspaket aufgenommen noch in die Programm-Kopie kopiert. Ein vorhandener systemeigener Sandbox-Helfer wird gegebenenfalls referenziert, ohne dessen Rechte zu ändern.

Vorhandene lokale Myspoti-Generationen bleiben für Rückgriff erhalten. Ein fehlgeschlagenes Apply ersetzt den bisherigen Starter nicht. Die Kopie benötigt zusätzlichen Speicher; der Installer prüft den freien Platz. Nach Spotify-Updates die Kompatibilität prüfen und Setup erneut ausführen. Die lokale Programm-Kopie aktualisiert sich nicht automatisch mit dem Systempaket.

## Andere native Linux-Distributionen

[Portables Setup-Archiv](https://github.com/weikiboy-tech/myspoti-desktop/releases/download/v0.2.0-preview.1/Myspoti-Linux-Setup.tar.gz) entpacken. Mit installiertem Python >=3.10, Tk und `pgrep` im entpackten Ordner `python3 setup.py` starten. `python3 setup.py --check` prüft ohne Änderungen; `python3 setup.py --install` bietet einen Terminalablauf mit Bestätigung. Die gleichen Versions- und Paketgrenzen gelten.

## Entfernen

Das Paket **myspoti-setup** über die Softwareverwaltung entfernen. Zum Entfernen der eingerichteten lokalen Kopie Myspoti schließen und den Ordner `~/.local/share/myspoti` sowie `~/.local/share/applications/myspoti.desktop` im Dateimanager entfernen (bei eigenen XDG-Pfaden entsprechend dort). Die originale Spotify-Installation und ihr Profil bleiben erhalten.

[Zur Windows-Anleitung](INSTALL.md) · [Funktionsstand](STATUS.md)
