# Myspoti unter Windows installieren

**Für Tester.** Ein einfacher Setup-Assistent ist in Arbeit. Aktuell gibt es noch keine fertige Myspoti-Setup.exe und keine unabhängige Desktop-App.

## Voraussetzungen

- Offizieller Spotify-Desktop-Client und dein eigenes Konto.
- [Spicetify](https://spicetify.app/docs/getting-started), eingerichtet für deine Spotify-Installation. Marketplace ist nicht erforderlich.
- Node.js ab Version 22 zum Bauen der Custom-App.

Lokal getestet: Spotify 1.3.8.620 / Spicetify 2.46.4. Diese Kombination liegt außerhalb der angegebenen Spicetify-Unterstützung bis Spotify 1.3.7. [Details](STATUS.md).

## Einrichten

1. Dieses Repository herunterladen oder klonen. PowerShell im Ordner `desktop` öffnen.
2. Custom-App bauen:

   ```powershell
   npm test
   npm run build
   ```

3. Den erzeugten Ordner `dist\myspoti-desktop` nach `%APPDATA%\spicetify\CustomApps\` kopieren. Einen vorhandenen gleichnamigen Ordner zuerst sichern.
4. Mit der installierten Spicetify-CLI aktivieren. Die Sicherung ist vor Änderungen erforderlich; `apply` kann Spotify neu starten und laufende Wiedergabe unterbrechen:

   ```powershell
   spicetify backup
   spicetify config custom_apps myspoti-desktop
   spicetify apply
   ```

5. Desktop- und Startmenü-Symbol erstellen:

   ```powershell
   .\tools\install-shortcut.ps1
   ```

Danach **Myspoti** über das neue Symbol öffnen. Die Anmeldung erfolgt ausschließlich im offiziellen Spotify-Client. Niemand erhält ein vorangemeldetes Konto.

## Entfernen

```powershell
spicetify config custom_apps myspoti-desktop-
spicetify apply
```

Anschließend die Myspoti-Verknüpfungen auf Desktop und im Startmenü entfernen. Andere Spicetify-Anpassungen bleiben aktiviert. `spicetify restore` würde sämtliche Spicetify-Anpassungen zurücksetzen.

## Probleme melden

[Issue öffnen](https://github.com/weikiboy-tech/myspoti-desktop/issues/new/choose) und Windows-, Spotify- und Spicetify-Version sowie die konkreten Schritte nennen. Keine Cookies, Tokens, Kontoexporte oder vollständigen Benutzerprofile hochladen.
