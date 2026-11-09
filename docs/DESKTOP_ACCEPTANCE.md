# Nachprüfbare Funktionsabnahme

Stand: 09.11.2026. Diese Liste wird während der Arbeit ergänzt. Nur der genannte Umfang ist geprüft; der Gesamtauftrag ist noch nicht abgeschlossen.

| Funktion | Wo öffnen? | Reproduzierbarer Test | Ergebnis / Evidenz |
|---|---|---|---|
| In Spotify laden | M-Symbol oben links | M anklicken, auf „Myspoti Desktop“ warten | VERIFIED: echte Custom-App im Client 1.3.8.620 sichtbar |
| Titel/Cover | Myspoti → Player | Mit dem originalen Spotify-Player vergleichen | VERIFIED: „Fine“, Lemon Demon und Cover stimmen überein |
| Play/Pause | Myspoti → Player → Abspielen/Pause | Starten, Fortschritt abwarten, pausieren | VERIFIED: originaler Player und Myspoti wechselten gemeinsam; Zeit lief von 0:43 bis 0:57 und stoppte |
| Seek | Myspoti → Position | Mittig auf die Zeitleiste klicken | VERIFIED: originaler Spotify-Player wechselte auf 2:20. Langzeit-/Gerätewechseltest offen |
| LRCLIB-Abruf | Myspoti → Bei LRCLIB suchen | Beim aktuellen Titel suchen | VERIFIED: Quelle LRCLIB und Lyrics wurden im echten Client angezeigt. Verfügbarkeit anderer Titel abhängig vom Anbieter |
| Classic/Immersive | Myspoti → Umschalter oben | Umschalten, Einstellungen speichern, neu öffnen | Browser-Harness bestanden; echter Client noch zu prüfen |
| Sleep Timer | Myspoti → Sleep Timer | Timer starten, andere Ansicht öffnen, Ablauf prüfen | Logiktests bestanden; echter Ablauf noch zu prüfen |

Automatisierte Testdaten und echte Kontotests sind getrennt. Die sechs Browser-Screenshots zeigen ausdrücklich einen künstlichen Player. Ein erfolgreicher Build, ein vorhandener Button oder Android-Quellcode ist kein Live-Nachweis.

Bei einem Fehler: konkrete Aktion und beobachtetes Verhalten festhalten; Funktion zurück auf PARTIAL setzen, beheben und denselben Test wiederholen. Keine Zugangsdaten oder rohen Kontoantworten exportieren.

## Desktop-Name und Veröffentlichung

Myspoti-Verknüpfungen mit dem ursprünglichen Myspoti-Logo wurden auf Windows-Desktop und im Startmenü erstellt. Name/Argumente/Icon-Pfad wurden aus den erzeugten Verknüpfungen zurückgelesen. Der Direktstart ist noch in Prüfung: Ein Versuch zeigte die native Startseite; nach einer Korrektur wartet das Hintergrundskript auf die Navigation und öffnet Myspoti einmal pro Clientstart. Noch keine Freigabe als stabiler Launcher.

Lokale Anmeldung bleibt auf ausdrücklichen Nutzerwunsch bestehen. Die neuen/angepassten Textdateien wurden vor Veröffentlichung auf konkrete lokale Konto-/Benutzernamen und typische Credential-Muster geprüft; keine Treffer. Das ersetzt keine universelle Geheimnis-Erkennung. Veröffentlichungsumfang ist Git-Quellcode; lokale Spotify-Profile, Spicetify-Backups, vendor, node_modules und Live-Screenshots gehören nicht dazu.