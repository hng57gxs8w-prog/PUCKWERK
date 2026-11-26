# PUCKWERK

Siebträger-Zubehör für Home-Baristas. *Dein Espresso. Endlich so gut wie im Café.*

## Inhalt
| Datei / Ordner | Was |
|---|---|
| `PUCKWERK-Shopify-Theme.zip` | Shopify-Theme 3.0 „Morgenlicht“, fertig zum Hochladen |
| `ci/puckwerk-morgenlicht.mp4` | Video: Startseite mit weichem Licht und Karten, die beim Scrollen über den Kopfbereich gleiten |
| `theme/` | Quellcode des Themes (Online Store 2.0) |
| `PUCKWERK-CI.zip` | CI-Handbuch + alle Logo-Dateien zum Weitergeben |
| `ci/PUCKWERK-CI-Handbuch.html` | Corporate-Design-Handbuch (im Browser öffnen, als PDF druckbar) |
| `ci/logos/` | Logos als SVG (Schrift in Pfade umgewandelt) und PNG; `…-gravur-schwarz.svg` für Lasergravur |
| `ci/tools/` | Skripte, die Logos und Handbuch erzeugen |

## Theme einrichten
1. Shopify-Admin → **Onlineshop → Themes → Theme hinzufügen → ZIP-Datei hochladen** → `PUCKWERK-Shopify-Theme.zip`
2. **Navigation** (Onlineshop → Navigation): Hauptmenü `main-menu` mit *Tamper, Verteiler, Siebe, Zubehör, Werkwissen*; Footer-Menü `footer` mit *Versand & Rückgabe, Kontakt, Impressum, Datenschutz, AGB*.
3. **Blog** mit dem Handle `werkwissen` anlegen – die Buttons „Werkwissen“ verlinken automatisch dorthin.
4. **Seite „Über uns“** mit dem Handle `ueber-uns` anlegen und als Vorlage `page.ueber-uns` wählen.
5. Im Theme-Editor: Kollektionen für die vier runden Kategorien und „Beliebt im Werk“ auswählen, Fotos/Slow-Motion-Video im CI-Bildstil einsetzen.
6. **Beispieltexte prüfen:** Versandgrenze (49 €), „Heute bestellt, morgen unterwegs“, 30 Tage Rückgabe usw. sind Platzhalter – an die echten Shop-Bedingungen anpassen.

## Version 3.0 „Morgenlicht“ (komplettes Makeover)
- **Karten-Stapel:** helle, weich gerundete Karten auf einem dunklen Espresso-Rahmen; beim Scrollen gleiten sie sanft über den Kopfbereich
- **Schwebende Navigation:** dunkle, abgerundete Leiste – das PUCKWERK-Logo steht immer weiß (auch im Footer und auf der Passwortseite)
- **Kopfbereich:** warmes, weiches Licht wandert ganz langsam über den dunklen Grund (nur CSS, kein Korn, kein 3D); Überschrift wird beim Laden weich scharf; Neuheiten-Plakette, Werte, Scroll-Hinweis; optional eigenes Foto
- **Neue Sektionen:** Kategorien als Kachel-Raster, Produkte als wischbare Reihe mit Pfeilen, „Das Ritual“ (Mahlen · Verteilen · Tampen), Leitsatz, der sich beim Scrollen Wort für Wort aufhellt
- **Bewegung nur weich:** sanftes Einblenden mit leichter Unschärfe, ruhige Hover-Effekte; bei „Bewegung reduzieren“ steht alles still, ohne JavaScript ist alles sichtbar
- Große Überschriften wahlweise Space Grotesk Medium (weicher, Standard) oder Bold (wie CI-Handbuch)

## Was das Theme aus der CI umsetzt
- Die fünf CI-Farben (Espresso, Crema, Kupfer, Warmes Grau, Off-White) plus „Espresso tief“ als Rahmen
- Space Grotesk / Inter, **lokal im Theme** (keine Verbindung zu Google-Servern)
- Große Überschriften Space Grotesk Medium (umstellbar auf Bold laut CI), Text Inter Regular 17 px, Labels 12 px Versal +18 %
- Kontrast: Fließtext Espresso; Off-White auf Kupfer nur auf Buttons (15 px Bold)
- Runde Formen: Karten 28 px, Kacheln und Bilder 20 px, Buttons als Pillen, Kupfer-Punkte als Akzent
- Logo als Vektor, immer weiß (Navigation, Footer, Passwortseite); Favicon aus dem Bildzeichen
- Tonalität: Du-Ansprache, kurze Texte, Fehlermeldungen im CI-Ton

## Neu erzeugen
```
python3 ci/tools/build_logos.py SpaceGrotesk-Bold.ttf ci/logos
python3 ci/tools/build_guide.py ci/logos ci/PUCKWERK-CI-Handbuch.html
cd theme && zip -rX ../PUCKWERK-Shopify-Theme.zip layout config templates sections snippets assets locales
```
