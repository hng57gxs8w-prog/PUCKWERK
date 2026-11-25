"""Baut das PUCKWERK CI-Handbuch als eigenständige HTML-Datei.
Aufruf: python3 build_guide.py <logos-ordner> <ausgabe.html>"""
import sys, os, re
LOGOS, OUT = sys.argv[1], sys.argv[2]

def logo(name, color="espresso", cls=""):
    s = open(os.path.join(LOGOS, f"puckwerk-{name}-{color}.svg")).read().strip()
    s = re.sub(r"<title>.*?</title>", "", s)
    return s.replace("<svg ", f'<svg class="{cls}" ', 1)

def mark_cc(cls=""):
    s = logo("bildzeichen", "espresso", cls)
    return s.replace('fill="#2B1D16"', 'fill="currentColor"')

def lockup_cc(name, cls=""):
    return logo(name, "espresso", cls).replace('fill="#2B1D16"', 'fill="currentColor"')

COLORS = [
    ("Espresso-Braun", "#2B1D16", "Hauptfarbe", "Text, Logo, dunkle Flächen, Footer", "on-dark"),
    ("Crema-Beige", "#F3E9DC", "Hintergrund", "Flächen, Verpackung, Sektionen", ""),
    ("Kupfer", "#B87333", "Akzent", "Buttons, Linien, Hervorhebungen – sparsam", "on-dark"),
    ("Warmes Grau", "#8A817C", "Nebentext", "Bildunterschriften, Meta-Infos, Hilfstexte", "on-dark"),
    ("Off-White", "#FBF8F4", "Grundfläche", "Seitenhintergrund, Text auf Espresso", ""),
]

def rgb(h): return tuple(int(h[i:i+2], 16) for i in (1, 3, 5))
def cmyk(h):
    r, g, b = [x / 255 for x in rgb(h)]
    k = 1 - max(r, g, b)
    if k >= 1: return (0, 0, 0, 100)
    return tuple(round(v * 100) for v in ((1-r-k)/(1-k), (1-g-k)/(1-k), (1-b-k)/(1-k), k))
def lum(h):
    def c(v):
        v /= 255
        return v / 12.92 if v <= 0.03928 else ((v + 0.055) / 1.055) ** 2.4
    r, g, b = rgb(h)
    return 0.2126*c(r) + 0.7152*c(g) + 0.0722*c(b)
def contrast(a, b):
    la, lb = sorted([lum(a), lum(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)

swatches = ""
for name, hx, role, use, cls in COLORS:
    r, g, b = rgb(hx); c, m, y, k = cmyk(hx)
    swatches += f'''
    <div class="swatch {cls}">
      <div class="swatch__chip" style="background:{hx}"><span class="swatch__role">{role}</span></div>
      <div class="swatch__info">
        <h4>{name}</h4>
        <dl><dt>HEX</dt><dd>{hx}</dd><dt>RGB</dt><dd>{r} · {g} · {b}</dd><dt>CMYK*</dt><dd>{c} · {m} · {y} · {k}</dd></dl>
        <p>{use}</p>
      </div>
    </div>'''

pairs = [("#2B1D16", "#FBF8F4", "Espresso auf Off-White"), ("#2B1D16", "#F3E9DC", "Espresso auf Crema"),
         ("#FBF8F4", "#2B1D16", "Off-White auf Espresso"), ("#FBF8F4", "#B87333", "Off-White auf Kupfer"),
         ("#8A817C", "#FBF8F4", "Grau auf Off-White"), ("#B87333", "#2B1D16", "Kupfer auf Espresso")]
contrast_rows = ""
for fg, bg, label in pairs:
    cr = contrast(fg, bg)
    verdict = "Fließtext ✓" if cr >= 4.5 else ("Nur groß / Bedienelemente" if cr >= 3 else "Nur dekorativ")
    contrast_rows += f'<div class="cpair" style="background:{bg};color:{fg}"><span class="cpair__aa">Aa</span><span>{label}<br><b>{cr:.1f} : 1</b> – {verdict}</span></div>'

H_H = lockup_cc("logo-horizontal", "lk lk--h")
H_S = lockup_cc("logo-gestapelt", "lk lk--s")
M = mark_cc("mk")

html = open(os.path.join(os.path.dirname(__file__), "guide_template.html")).read()
html = (html.replace("{{SWATCHES}}", swatches).replace("{{CONTRAST}}", contrast_rows)
            .replace("{{LOGO_H}}", H_H).replace("{{LOGO_S}}", H_S).replace("{{MARK}}", M))
open(OUT, "w").write(html)
print("ok", len(html))
