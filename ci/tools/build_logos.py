"""Erzeugt die PUCKWERK-Logo-Dateien (SVG, Schrift in Pfade umgewandelt).
Aufruf: python3 build_logos.py <SpaceGrotesk-Bold.ttf> <ausgabe-ordner>"""
import sys, math, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen

FONT, OUT = sys.argv[1], sys.argv[2]
TEXT, TRACK = "PUCKWERK", 0.14          # Laufweite in em
font = TTFont(FONT)
gs, cmap = font.getGlyphSet(), font.getBestCmap()
upm = font["head"].unitsPerEm
cap = font["OS/2"].sCapHeight

def circle(r, cx=50, cy=50):
    return f"M{cx-r},{cy}a{r},{r} 0 1,0 {2*r},0a{r},{r} 0 1,0 {-2*r},0Z"

# Bildzeichen: Puck von oben – Siebträger-Rand, Puck, zwei Tamper-Rillen
RADII = [49, 43, 38, 29, 26, 17, 14]
MARK = "".join(circle(r) for r in RADII)   # evenodd => Ring / Scheibe / Rillen

def wordmark(cap_px):
    """Pfad der Wortmarke, Grundlinie bei y=cap_px, links bei x=0. Gibt (d, breite) zurück."""
    s = cap_px / cap
    pen = SVGPathPen(gs)
    x = 0.0
    names = [cmap[ord(c)] for c in TEXT]
    for i, n in enumerate(names):
        tp = TransformPen(pen, (s, 0, 0, -s, x, cap_px))
        gs[n].draw(tp)
        adv = gs[n].width
        if i < len(names) - 1:
            adv += TRACK * upm
        x += adv * s
    # tatsächliche rechte Kante (ohne Laufweite nach dem letzten Zeichen)
    bp = BoundsPen(gs); gs[names[-1]].draw(bp)
    width = x - gs[names[-1]].width * s + bp.bounds[2] * s
    return pen.getCommands(), width

def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.2f} {h:.2f}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')

def build(color, suffix):
    files = {}
    # Bildzeichen
    files["puckwerk-bildzeichen"] = svg(100, 100, f'<path fill="{color}" fill-rule="evenodd" d="{MARK}"/>', "PUCKWERK Bildzeichen")
    # Horizontal: Zeichen 100 hoch, Versalhöhe 36, Abstand 32
    capH, gap = 36, 32
    d, ww = wordmark(capH)
    ty = (100 - capH) / 2
    body = (f'<path fill="{color}" fill-rule="evenodd" d="{MARK}"/>'
            f'<path fill="{color}" transform="translate({100+gap} {ty})" d="{d}"/>')
    files["puckwerk-logo-horizontal"] = svg(100 + gap + ww, 100, body, "PUCKWERK")
    # Gestapelt: Zeichen 100, Abstand 26, Versalhöhe 30
    capS, gapS = 30, 26
    d2, ww2 = wordmark(capS)
    W = max(100, ww2)
    body = (f'<path fill="{color}" fill-rule="evenodd" transform="translate({(W-100)/2} 0)" d="{MARK}"/>'
            f'<path fill="{color}" transform="translate({(W-ww2)/2} {100+gapS})" d="{d2}"/>')
    files["puckwerk-logo-gestapelt"] = svg(W, 100 + gapS + capS, body, "PUCKWERK")
    # Nur Wortmarke
    d3, ww3 = wordmark(40)
    files["puckwerk-wortmarke"] = svg(ww3, 40, f'<path fill="{color}" d="{d3}"/>', "PUCKWERK")
    for name, content in files.items():
        with open(os.path.join(OUT, f"{name}-{suffix}.svg"), "w") as f:
            f.write(content)

os.makedirs(OUT, exist_ok=True)
for color, suffix in [("#2B1D16", "espresso"), ("#B87333", "kupfer"),
                      ("#FBF8F4", "offwhite"), ("#000000", "gravur-schwarz")]:
    build(color, suffix)
print("ok")
