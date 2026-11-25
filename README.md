# PUCKWERK

Siebträger-Zubehör für Home-Baristas. *Dein Espresso. Endlich so gut wie im Café.*

## Inhalt
- `ci/PUCKWERK-CI-Handbuch.html` – Corporate-Design-Handbuch (im Browser öffnen, druckbar als PDF)
- `ci/logos/` – Logos als SVG (Schrift in Pfade umgewandelt) in Espresso, Kupfer, Off-White und Gravur-Schwarz; `png/` mit transparentem Hintergrund
- `ci/tools/` – Skripte, mit denen Logos und Handbuch erzeugt werden
- `theme/` – Shopify-Theme (Online Store 2.0) nach CI
- `puckwerk-theme.zip` – Theme, fertig zum Hochladen
- `PUCKWERK-CI.zip` – Handbuch + Logos zum Weitergeben

## Neu erzeugen
```
python3 ci/tools/build_logos.py SpaceGrotesk-Bold.ttf ci/logos
python3 ci/tools/build_guide.py ci/logos ci/PUCKWERK-CI-Handbuch.html
```

## Theme installieren
Shopify-Admin → Onlineshop → Themes → Theme hinzufügen → ZIP-Datei hochladen.
