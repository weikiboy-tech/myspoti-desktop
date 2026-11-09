# Myspoti Desktop – frühe Spicetify-Portierung

GPL-3.0, abgeleitet von [Myspoti](https://github.com/kota-zo/myspoti). Vollständige Originalquellen und Drittanbieterhinweise liegen im übergeordneten Repository.

**Noch keine abgenommene Desktop-Version.** Das Paket ist gebaut und der Adapter mit künstlichem Host getestet; das Laden in Spotify und tatsächliche Wiedergabe müssen erst nach der Installation geprüft werden.

```powershell
cd desktop
npm test
npm run build
```

Benötigt Node >=22; keine npm-Abhängigkeiten oder Installation für Build/Unit-Tests. Ausgabe: `dist/myspoti-desktop`. Dieses Verzeichnis ist eine Spicetify-Custom-App, keine eigenständige EXE und keine Browser-Webseite. Die Anmeldung erfolgt ausschließlich im Originalclient.

Vorbereitung, Installation und Rückbau: [Installationsplan](../docs/DESKTOP_INSTALLATION_PLAN.md). Vor Änderungen am Client ist die vom Auftrag verlangte Freigabe einzuholen. Ein fremder Extension-Store wird nicht installiert.

Enthalten: Player-Adapter, Basis-Steuerung, native Navigationslinks/Suchübergabe, zwei Darstellungsmodi, Akzent-/AMOLED-/Animations-Einstellungen, LRC-Import mit zeilenweisem Seek, manueller LRCLIB-Abruf sowie Sleep Timer. Nicht enthalten: vollständige Android-Ansichten, Worttiming, weitere Online-Lyrics-Provider, AutoMix, Audio-DSP, Videos, Extension-Sandbox, eigener Offline-Player und die meisten zusätzlichen Funktionen.

Die Custom-App wurde lokal mit Spicetify 2.46.4 installiert. Öffnen über den Myspoti-Eintrag bzw. im Spotify-Profilmenü „Myspoti Desktop“. Der Menüeintrag wird vom mitgelieferten Hintergrundskript registriert. Laden und Wiedergabe im tatsächlichen Client sind weiterhin offen. Spotify 1.3.8.620 liegt über der angegebenen Spicetify-Kompatibilität bis 1.3.7; deshalb kein stabiler Release.

Nur die Browser-Tests benötigen `npm ci --ignore-scripts` und einen vorhandenen Chromium-Browser (Pfad in `MYSPOTI_TEST_BROWSER`). Die npm-Pakete sind reine Entwicklungsabhängigkeiten; der Produktionsbuild verwendet Spotifys React. Ausführen: `npm run test:browser`.

Siehe [Paritätsmatrix](../docs/FEATURE_PARITY_MATRIX.md), [Architektur](../docs/ARCHITECTURE_DECISION.md) und [Testbericht](../docs/DESKTOP_TEST_REPORT.md). Ein Paket ohne den zugehörigen Quellcode und Lizenzhinweise nicht weitergeben.
