# Designvergleich

Referenz betrachtet: `docs/screenshots/banner.jpg` mit Classic-/Immersive-Player und Android-Navigation. Codebasis: Color.kt, ImmersiveTheme.kt und ImmersiveMotion.kt.

Übernommen: Classic-Hintergrund #121212, gedämpfter Text #B3B3B3; Immersive-Akzent #FF4F7B, Glasfläche #2C2C34 mit 88 % Deckkraft, Kanten mit 12 % Weiß, 14-px-Rundungen, Titel 32/38 und 22/28, Fade 150 ms und Eintritt 420 ms. Desktop verwendet ein zweispaltiges Player-/Lyrics-Layout und einen einspaltigen Fallback unter 800 px.

Unterschiede: native Spotify-Start-/Bibliotheksseiten statt nachgebauter Android-Screens; systemnahe Textbuttons statt vollständiger Original-Icons; Systemschrift-Fallback statt gebündeltem Inter; statische CSS-Farbverläufe statt coverabhängigem Mesh; CSS-Blur statt Android-Backdrop-Refraktion; keine originalgetreuen Sheets, Federmodelle oder wortgenauen Lyrics. Die Größenanpassung ist getestet, visuelle Originaltreue nicht erreicht.

Die sechs Screenshots in `desktop/test-results` stammen aus dem klar gekennzeichneten Browser-Test-Harness. Classic 1280×720 und Immersive 1440×900 wurden visuell betrachtet; die übrigen Größen wurden automatisch auf horizontalen Überlauf geprüft. Die Screenshots zeigen die gesamte scrollbare Seite und sind deshalb teilweise höher als der Test-Viewport. Live-Screenshots der integrierten Myspoti-Ansicht fehlen noch.
