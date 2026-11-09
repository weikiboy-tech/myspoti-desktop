# Installationsplan zur Freigabe

Stand: 09.11.2026. Der Nutzer hat die Spicetify-Einrichtung und Live-Tests freigegeben; Backup, Installation und Apply wurden ausgeführt. Die REA-Voraussetzungen wurden ebenfalls freigegeben und isoliert vorbereitet. Die folgende Liste hält den ursprünglichen Plan fest. Aktuelle Ergebnisse stehen in DESKTOP_TEST_REPORT.md.

## Spotify-Integration

1. Aktuelle offizielle Spicetify-Windows-Version herunterladen; konkrete Version und SHA-256 protokollieren. Kein Marketplace und keine fremden Erweiterungen.
2. CLI zunächst projektlokal ablegen. Spotify-Version unmittelbar vor Anwendung erneut mit der beobachteten Version 1.3.8.620 vergleichen. Bei Abweichung neu prüfen.
3. Bestehende Spicetify-Konfiguration und CustomApps-Ziel prüfen. Vorhandene gleichnamige App niemals überschreiben. Konfiguration separat sichern.
4. Das mit `npm run build` erzeugte Verzeichnis `desktop/dist/myspoti-desktop` nach `%APPDATA%/spicetify/CustomApps/myspoti-desktop` kopieren.
5. Spicetify-Sicherung der Spotify-Ressourcen erstellen, `spicetify config custom_apps myspoti-desktop` und `spicetify apply` ausführen. Das verändert die lokalen Spotify-UI-Ressourcen und startet Spotify möglicherweise neu. Aktuelle Wiedergabe kann unterbrochen werden.
6. In Spotify mit der bereits vorhandenen Sitzung starten. Keine Zugangsdaten auslesen. Custom-App öffnen und anhand `DESKTOP_TEST_REPORT.md` prüfen. Funktionsfähigkeit für diese Spotify-Version ist vor diesem Test unbestätigt.
7. Rückbau: `spicetify config custom_apps myspoti-desktop-` und `spicetify apply`. Vollständiger Rückbau aller Spicetify-Anpassungen nur ausdrücklich mit `spicetify restore`; dies betrifft auch andere Spicetify-Erweiterungen. Gesicherte Konfiguration bei Bedarf wiederherstellen.

## REA

Vorhanden: Node 24.15.0, npm 11.12.1. REA-CLI nicht im PATH; kein REA-Tool in dieser Sitzung.
Die abgerufene README verlangt Node 22 >=22.23.4, 24 >=24.22.1 oder 26 >=26.12.1.
Damit erfüllt die vorhandene Node-Version diese Anforderung nicht.

1. Verfügbarkeit einer kompatiblen offiziellen Node-Version prüfen und diese isoliert für REA bereitstellen; globale Node-Installation nicht ersetzen.
2. Aus einem vertrauenswürdigen Werkzeugordner außerhalb des untersuchten Repositories `npx rea-agents@latest setup` starten.
3. Die tatsächlich vorgeschlagenen MCP-/Agent-Konfigurationsänderungen anzeigen und bestätigen lassen; vorhandene Konfiguration sichern. Falls erforderlich Codex neu starten.
4. Zunächst nur Installationsstruktur, Dateiköpfe und öffentlich erreichbare Schnittstellen untersuchen. Keine Tokens, DRM-Schlüssel oder proprietären Programminhalte exportieren.

Quellen: https://spicetify.app/docs/getting-started und https://github.com/morluto/rea.

Die Freigabe ist hier erforderlich, weil der Nutzer in Phase B genehmigungspflichtige Installations- und Konfigurationsänderungen ausdrücklich an eine vorherige Freigabe gebunden hat.
