# PUCKWERK

Siebträger-Zubehör für Home-Baristas. *Dein Espresso. Endlich so gut wie im Café.*

## Inhalt
| Datei / Ordner | Was |
|---|---|
| `PUCKWERK-Shopify-Theme.zip` | Shopify-Theme 2.0 (dunkel & modern, mit Hero-Animation), fertig zum Hochladen |
| `ci/puckwerk-hero-animation.mp4` | Video der Startseiten-Animation (8 Sek.) |
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

## Neu in Version 2.0
- **Farbmodus** (Theme-Einstellungen → Farben): *Dunkel – modern* (Standard) oder *Hell – klassisch* (Version 1.1)
- **Hero-Animation**: Das Bildzeichen entsteht – Siebrand, Kaffeemehl, Tamper-Druck mit Kupferwelle, zwei Rillen, Messskala, Partikel im Licht. Der Puck neigt sich mit der Maus und dreht sich beim Scrollen. Alternativ Bild oder Video.
- Überschrift baut sich Wort für Wort auf; Inhalte blenden beim Scrollen sanft ein (abschaltbar)
- Glas-Navigation, feine Körnung (abschaltbar), Kupfer-Leuchten, großes PUCKWERK-Wasserzeichen im Footer
- Bei „Bewegung reduzieren“ (Systemeinstellung) steht alles still im Endzustand; außer Sicht pausiert die Animation

## Was das Theme aus der CI umsetzt
- Die fünf CI-Farben (Espresso, Crema, Kupfer, Warmes Grau, Off-White) plus zwei aus Espresso abgeleitete dunkle Stufen
- Space Grotesk Bold / Inter Regular, **lokal im Theme** (keine Verbindung zu Google-Servern)
- Typo-Hierarchie H1 56 · H2 40 · H3 24 · Text 17 · Klein 14 · Label 12 (+18 %, Versal)
- Kontrastregeln: Fließtext Espresso, Grau erst ab 14 px, Off-White auf Kupfer nur auf Buttons
- Runde Formen, 1-px-Kupferlinien, Ecken 20 px, 8er-Raster, Sektionsabstand ≥ 96 px
- Logo als Vektor (horizontal im Header/Footer, gestapelt auf Passwortseite), Favicon aus dem Bildzeichen
- Tonalität: Du-Ansprache, kurze Texte, Fehlermeldungen im CI-Ton

## Neu erzeugen
```
python3 ci/tools/build_logos.py SpaceGrotesk-Bold.ttf ci/logos
python3 ci/tools/build_guide.py ci/logos ci/PUCKWERK-CI-Handbuch.html
cd theme && zip -rX ../PUCKWERK-Shopify-Theme.zip layout config templates sections snippets assets locales
```
