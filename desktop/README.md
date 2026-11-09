# Myspoti Desktop – frühe Spicetify-Portierung

GPL-3.0, abgeleitet von [Myspoti](https://github.com/kota-zo/myspoti). Vollständige Originalquellen und Drittanbieterhinweise liegen im übergeordneten Repository.

**Noch keine vollständige Desktop-Version.** Laden, Titel/Cover, Play/Pause, Seek und LRCLIB wurden im echten Client geprüft. Weitere Funktionen sind noch offen; siehe Funktionsabnahme.

```powershell
cd desktop
npm test
npm run build
```

Benötigt Node >=22; keine npm-Abhängigkeiten oder Installation für Build/Unit-Tests. Ausgabe: `dist/myspoti-desktop`. Dieses Verzeichnis ist eine Spicetify-Custom-App, keine eigenständige EXE und keine Browser-Webseite. Die Anmeldung erfolgt ausschließlich im Originalclient.

Vorbereitung, Installation und Rückbau: [Installationsplan](../docs/DESKTOP_INSTALLATION_PLAN.md). Vor Änderungen am Client ist die vom Auftrag verlangte Freigabe einzuholen. Ein fremder Extension-Store wird nicht installiert.

Enthalten: Player-Adapter, Basis-Steuerung, native Navigationslinks/Suchübergabe, zwei Darstellungsmodi, Akzent-/AMOLED-/Animations-Einstellungen, LRC-Import mit zeilenweisem Seek, manueller LRCLIB-Abruf sowie Sleep Timer. Nicht enthalten: vollständige Android-Ansichten, Worttiming, weitere Online-Lyrics-Provider, AutoMix, Audio-DSP, Videos, Extension-Sandbox, eigener Offline-Player und die meisten zusätzlichen Funktionen.

Die Custom-App wurde lokal mit Spicetify 2.46.4 installiert. Öffnen über den Myspoti-Eintrag bzw. im Spotify-Profilmenü „Myspoti“. Der Menüeintrag wird vom mitgelieferten Hintergrundskript registriert. Laden und Basis-Wiedergabe wurden im tatsächlichen Client geprüft. Spotify 1.3.8.620 liegt über der angegebenen Spicetify-Kompatibilität bis 1.3.7; deshalb kein stabiler Release.

Nur die Browser-Tests benötigen `npm ci --ignore-scripts` und einen vorhandenen Chromium-Browser (Pfad in `MYSPOTI_TEST_BROWSER`). Die npm-Pakete sind reine Entwicklungsabhängigkeiten; der Produktionsbuild verwendet Spotifys React. Ausführen: `npm run test:browser`.

Siehe [Paritätsmatrix](../docs/FEATURE_PARITY_MATRIX.md), [Architektur](../docs/ARCHITECTURE_DECISION.md) und [Testbericht](../docs/DESKTOP_TEST_REPORT.md). Ein Paket ohne den zugehörigen Quellcode und Lizenzhinweise nicht weitergeben.

## Desktop-Einstieg und Anmeldung

Nach Build und Spicetify-Installation erstellt `./tools/install-shortcut.ps1` unter Windows eine Verknüpfung **Myspoti** auf dem Desktop und im Startmenü, mit dem Myspoti-Logo. Sie öffnet `spotify:app:myspoti-desktop` im vorhandenen Client. Zusätzlich öffnet das Hintergrundskript Myspoti einmal pro Clientstart, sobald die Navigation bereit ist. Der erneute Start über die Verknüpfung wurde im echten Client geprüft. Dies ist ein Desktop-Einstieg, keine eigenständige Spotify-freie EXE. Prozess, Betriebssystem-App-Identität und native Spotify-Bereiche bleiben Bestandteile des offiziellen Clients. Myspoti heißt nicht „Spotify Premium“ und schaltet keine Aborechte frei.

Die Veröffentlichung enthält nur Quellcode und eigene statische App-Dateien. Keine Spotify-Binärdateien, Backups, Benutzerprofile, Cookies, Tokens oder lokale Sitzungen werden mitgeliefert. Jeder Nutzer installiert Spotify selbst und meldet sich mit seinem eigenen Konto an. Der Starter kopiert ausschließlich das Logo; er liest keine Kontodaten. Die lokale Anmeldung des Entwicklers bleibt ausschließlich in dessen Spotify-Installation.
## Windows-Setup bauen

Auf Windows mit dem .NET-Framework-Compiler (Framework64/v4.0.30319/csc.exe):

```powershell
./tools/build-installer.ps1
./tools/test-installer.ps1
```

Ausgabe: `dist/installer/Myspoti-Setup.exe`, eine kleine x64-WinForms-EXE mit eingebetteten Myspoti-Dateien. Der Installer selbst benötigt kein Node.js und führt keine PowerShell-Skripte aus. Quellcode: `installer/Setup.cs` und `installer/Installer.cs`. Das Paket wird aus einer festen Dateiliste gebaut; niemals aus einem Spotify-Profil oder einem gesamten Arbeitsverzeichnis. `SOURCES.txt` nennt den exakten Git-Commit. Für veröffentlichte Builds muss der Quellstand vorher committed und auf GitHub verfügbar sein.

`Myspoti-Setup.exe --check` prüft nur die lokale Voraussetzung. Tests decken Versionsgrenzen, beschädigte Downloads und passende/falsche/fehlende Sicherungen ab. Die Live-Installation wurde auf dem vorhandenen Entwickler-PC ausgeführt; frische Installation, andere Versionen und ein provozierter Apply-Fehler/Rollback sind noch nicht live abgenommen. Die EXE ist nicht signiert.

## Linux-Setup bauen und testen

```sh
python3 tools/build-linux.py
python3 -m unittest discover -s installer/linux -p 'test_*.py' -v
```

Ausgabe: `dist/linux/Myspoti-Linux-Setup.deb` und `Myspoti-Linux-Setup.tar.gz`. Der Builder funktioniert auch unter Windows; Debian-Paketinstallation und Tk-GUI werden auf Ubuntu-CI geprüft. Die Oberfläche in `src/` ist für beide Systeme identisch. Systemabhängige Einrichtung bleibt getrennt in `installer/Setup.cs` / `Installer.cs` und `installer/linux/setup.py`.

Linux-Setup benötigt Python >=3.10 mit Tk und procps; das Debian-Paket deklariert diese Abhängigkeiten. Weitere Details und nicht unterstützte Paketarten: [Linux-Anleitung](../docs/INSTALL-LINUX.md).
