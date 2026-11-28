# PUCKWERK

Siebträger-Zubehör für Home-Baristas. *Dein Espresso. Endlich so gut wie im Café.*

## Inhalt
| Datei / Ordner | Was |
|---|---|
| `PUCKWERK-Shopify-Theme.zip` | Shopify-Theme 5.0, fertig zum Hochladen |
| `theme/` | Quellcode des Themes (Online Store 2.0) |
| `ci/vorschau-shop-startseite.png` | Vorschau der Startseite mit Beispielprodukten |
| `PUCKWERK-CI.zip` | CI-Handbuch + alle Logo-Dateien zum Weitergeben |
| `ci/PUCKWERK-CI-Handbuch.html` | Corporate-Design-Handbuch (im Browser öffnen, als PDF druckbar). Kapitel 08 „Shop-Startseite" zeigt den aktuellen Seitenaufbau von Theme 5.0. |
| `ci/logos/` | Logos als SVG (Schrift in Pfade umgewandelt) und PNG; `…-gravur-schwarz.svg` für Lasergravur |
| `ci/tools/` | Skripte, die Logos und Handbuch erzeugen |

## Theme einrichten
1. Shopify-Admin → **Onlineshop → Themes → Theme hinzufügen → ZIP-Datei hochladen** → `PUCKWERK-Shopify-Theme.zip`
2. **Navigation** (Onlineshop → Navigation): Hauptmenü `main-menu` mit *Tamper, Verteiler, Siebe, Zubehör, Werkwissen*; Footer-Menü `footer` mit *Versand & Rückgabe, Kontakt, Impressum, Datenschutz, AGB*.
3. **Blog** mit dem Handle `werkwissen` anlegen – die Buttons „Werkwissen“ verlinken automatisch dorthin.
4. **Seite „Über uns“** mit dem Handle `ueber-uns` anlegen und als Vorlage `page.ueber-uns` wählen.
5. Im Theme-Editor: Kollektionen für „Beliebt im Werk“ und die vier Kategorie-Kacheln auswählen, Produktfotos hinterlegen. Ohne eigenes Foto zeigt die Kategorie-Kachel automatisch Shopifys neutrales Platzhalter-Symbol.
6. **Beispieltexte prüfen:** Versandgrenze (49 €), „Heute bestellt, morgen unterwegs“, 30 Tage Rückgabe usw. sind Platzhalter – an die echten Shop-Bedingungen anpassen.

## Version 5.0 (näher am vollen CI: Kreise, Kupferlinien, Pillen-Buttons)
- **Kategorie-Bilder jetzt rund** mit 1 px Kupferring, genau wie im CI-Handbuch beschrieben („Bildausschnitte rund, Ringe als Hintergrundmotiv“). Ohne eigenes Bild erscheint weiterhin nur Shopifys neutrales Platzhalter-Symbol, jetzt im Kreis statt im Quadrat.
- **Buttons in Pillenform, Space Grotesk Bold** – wie bisher schon auf Verpackung, Gravur und Social Media, jetzt auch im Shop.
- **Dachzeilen in Kupfer mit Linie**: das „KICKER —“-Muster aus dem Handbuch zieht sich jetzt durch alle Abschnitte der Startseite.
- **Dezentes Ring-Motiv im Hero**: feine, sehr blasse konzentrische Kreise als Hintergrund hinter Überschrift und Text – rein abstrakt, kein Foto, keine Animation.
- Eckenradius von Karten, Bildern und Eingabefeldern großzügiger (Standard jetzt 16 statt 6 px).
- Unverändert aus Theme 4.0: keine gezeichneten/erfundenen Fotos, Produkte direkt nach dem Hero, keine Scroll-Animationen, volle Funktion ohne JavaScript und bei „Bewegung reduzieren“.

## Version 4.0 (komplettes Makeover: schlicht & produktorientiert)
- **Kein gezeichnetes Foto mehr:** die bisherigen CSS-Kaffeeflecken/Holz-Verläufe und erfundenen Produktnamen sind raus. Fehlt ein Bild, erscheint entweder gar keins (Hero, Bild-mit-Text) oder Shopifys eigenes neutrales Platzhalter-Symbol (Kategorien, Produktkarten) – nie eine Fantasie-Grafik.
- **Schlicht statt spektakulär:** keine Scroll-Animationen, kein Parallax, kein Karten-Stapel-Layout. Normale, gut lesbare Seite: Kopf- und Fußzeile dunkel mit weißem Logo, der Inhalt hell.
- **Produkte zuerst:** Auf der Startseite kommt das Produktraster direkt nach dem Hero, nicht erst nach mehreren Erzähl-Abschnitten.
- Ruhige, konventionelle Bausteine: Hero (Text, optional ein Bild), Produktraster, Kategorie-Raster, Vorteile-Zeile, Newsletter.
- Bewegung nur da, wo sie etwas erklärt: Menü gleitet ein, Karte hat einen dezenten Hover. Bei „Bewegung reduzieren“ und ganz ohne JavaScript ist die Seite identisch nutzbar.

## Was das Theme aus der CI umsetzt
- Die fünf CI-Farben (Espresso, Crema, Kupfer, Warmes Grau, Off-White) plus „Espresso tief“ für Kopf- und Fußzeile
- Space Grotesk / Inter, **lokal im Theme** (keine Verbindung zu Google-Servern)
- Zurückhaltende Größen (Lesbarkeit und Produktraster vor großer Geste); Labels in Space Grotesk Versal
- Logo als Vektor, in Kopf- und Fußzeile weiß einstellbar (Standard: reines Weiß); Favicon aus dem Bildzeichen
- Tonalität: Du-Ansprache, kurze Texte, Fehlermeldungen im CI-Ton

## Geprüft
- Shopify Theme Check: 0 Probleme
- Shopifys eigener Liquid-Parser (Ruby-Gem, strikter Modus): alle 42 Liquid-Dateien fehlerfrei
- 16 Browser-Tests (Playwright): Kopfzeile, Menü, Suche, Varianten, Warenkorb, „Bewegung reduzieren“, ohne JavaScript – alle bestanden, keine Fehlermeldungen
- Nicht in einem echten Shopify-Shop getestet

## Neu erzeugen
```
python3 ci/tools/build_logos.py SpaceGrotesk-Bold.ttf ci/logos
python3 ci/tools/build_guide.py ci/logos ci/PUCKWERK-CI-Handbuch.html
cd theme && zip -rX ../PUCKWERK-Shopify-Theme.zip layout config templates sections snippets assets locales
```
