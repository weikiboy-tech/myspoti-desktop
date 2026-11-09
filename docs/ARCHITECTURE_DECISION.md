# Architekturentscheidung: erste Desktop-Iteration

Basis: Myspoti `95a24e7e4de82ec89d4ec11d5b05b146c44d78e7`, 09.11.2026.
Entscheidung vorläufig; kein Nachweis vollständiger Funktionsparität.

Eine GPL-3.0-Custom-App und eine mitgelieferte Hintergrund-Erweiterung verwenden den Spicetify-Player-Wrapper. Spotify besitzt weiterhin Authentifizierung, Audioausgabe, DRM, Geräteverwaltung, Medien-Tasten und die bestehenden Bibliotheksansichten. Die Custom-App ergänzt einen eigenen Player, Darstellungseinstellungen und importierte LRC-Songtexte. Der Hintergrundteil hält den Sleep Timer bei Navigation in andere Spotify-Ansichten aktiv. Beim Beenden von Spotify wird der Timer verworfen; er wird bewusst nicht unbemerkt beim nächsten Start reaktiviert.

Vorteile: kein zweiter Spotify-Login, kein Debug-Port, keine eigene DRM-Kette; Originalansichten bleiben erreichbar; kein npm-Laufzeitpaket erforderlich. Nachteil: Spicetify verändert Spotify-Ressourcen und verwendet versionsabhängige interne Schnittstellen. Vorhandensein einer Wrapper-Methode garantiert keine Kontoberechtigung. Einschränkungen werden vor Befehlen geprüft; Spotify entscheidet endgültig. Protokollierung von Host-Daten und Tokens findet nicht statt.

Der erste Adapter nutzt nur dokumentierte Player-Methoden und History-Navigation. Er importiert nicht `player-bridge.js` oder Android-Host-Code. Der API-Stand enthält Werbe-/Berechtigungsänderungen, die laut Auftrag nicht übernommen werden dürfen. Externe Provider und fremde Erweiterungen laufen nicht innerhalb des privilegierten Spotify-Kontexts.

## Modulbewertung

| Modul | Befund | Wiederverwendung |
|---|---|---|
| base/api | JVM, Coroutines; MyspotiApi, Player, Search, Catalog, Library, Playlists usw.; StateFlow-Zustände | Vertragsreferenz; kein direkter JS-Import |
| base/api-spotify | JVM, OkHttp, Serialization; SpotifyApi, SpotifyPlayer, SpotifyLibrary, SpotifyContent, BridgeHost; HTTP/GraphQL und Seitenservices | Referenz für Funktionsinventar; nicht ungeprüft übernehmen |
| base/host-android | Android SDK 37, WebKit, Media Session, Cronet, Hintergrunddienst | Desktop ersetzt diese Aufgaben durch Spotify |
| base/host-cdp | JVM/OkHttp, Chrome-Debugging, JUnit-Live-Tests | Testwerkzeug; kein Produktionshost oder offener Debug-Port |
| base/extensions | JVM, Rhino 1.8.1, SafeNet, Manifest, Catalog, ExtensionRuntime | Geeignet für späteren isolierten JVM-Dienst, nicht direkt im Spotify-Fenster |
| base/extensions-cli | JVM application; extensions + host-cdp | Vorhandener Autoren-Runner; noch nicht lokal ausgeführt |
| base/automix | JVM, BeatThis/ONNX 1.23.2, MixPlanner, SegueDeck; reine Analyse/Planung | Geeignet für rechtmäßige lokale PCM-Quellen in späterem Dienst; keine Spotify-PCM-Schnittstelle nachgewiesen |
| base/app | Android Compose, ViewModels, Room/Präferenzen, Media3 und Android-Ressourcen | Design-Tokens/Verhalten als Portierungsgrundlage; kein fertiges Compose-Desktop-Modul |

Compose Multiplatform/JVM wäre für lokale Dateien, Rhino und AutoMix sinnvoll, verlangt aber eine neue UI-/Audio-Host-Schicht. Ein WebView/Electron-Fenster liefert keinen belegten Spotify-DRM-Support. Daher wird dieser Weg nicht als funktionierender Ersatz behauptet.

## Daten und Sicherheit

Nur Darstellungseinstellungen werden unter `myspoti.desktop.v1` gespeichert; importierte Lyrics werden im Arbeitsspeicher an die Track-URI gebunden. Kein eigener Netzwerkserver, kein Prozesszugriff aus der Custom-App. Lokale, explizit ausgewählte LRC-Dateien bis 500 KB werden per File-API gelesen. Der manuell ausgelöste LRCLIB-Abruf überträgt Titel, Künstler, Album und Dauer, ohne Credentials, mit Redirect-Verbot, Zeitlimit, begrenztem Sitzungscache und Retry-After-Beachtung. React rendert Text ohne HTML-Injektion. Cover-URLs sind auf Spotify-CDN bzw. Spotify-Bild-URIs begrenzt. Fehleranzeigen enthalten keine rohen Host-Antworten.

## Lizenz und Distribution

Ursprung und Hinweise bleiben im Repository erhalten. Desktop-Code GPL-3.0-only; Design-Herkunft Myspoti und BitChord steht im CSS und in den Drittanbieterhinweisen. Keine proprietären Spotify-Dateien im Build-Paket. Vollständigen korrespondierenden Quellcode, LICENSE und THIRD_PARTY_NOTICES bei Weitergabe mitliefern. Ob die konkrete In-Process-Kopplung mit dem proprietären Host für eine öffentliche Distribution genügt, wurde nicht rechtlich geprüft; die getrennte Quellcodebereitstellung allein wird nicht als Lösung dieses Problems ausgegeben. Öffentlicher Release bleibt bis zur Klärung offen.

Schnittstellenreferenzen: https://spicetify.app/docs/development/custom-apps, https://spicetify.app/docs/development/api-wrapper/methods/player.
