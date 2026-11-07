"""
Export Tarig's AFM models to values-only JSON for the ModellerHub viewer.
Formulas are NEVER written: only Excel's cached values, formatted as Excel shows them.
"""
import json, os, re, colorsys, warnings, zipfile
warnings.filterwarnings("ignore")
import openpyxl
import openpyxl.reader.excel as rx
from openpyxl.styles.colors import COLOR_INDEX
from openpyxl.utils import get_column_letter
from xml.etree import ElementTree as ET
from datetime import datetime, date, time

rx.find_images = lambda a, p: ([], [])  # skip charts (some fail to parse)
B = "/mnt/user-data/uploads/12-Cases/"

MODELS = [
    # slug, display name, file, accent colour, patch-from (LibreOffice recalcs of fixed copy), original-for-patch
    ("henderson", "Henderson Manufacturing", "0-Hederson/Hendrosn - July/Henderson JULY .xlsx", "#1F4E79", None),
    ("passion-paints", "Passion Paints", "1-Passion Paints Balanced/PP CASE 2025/PASSION PAINTS(AutoRecovered).xlsx", "#B83B5E", None),
    ("transatlantic", "Transatlantic Railway", "2-Transatlantic Balanced/EXAM PRACTICE/My Exam/Transatllantic 6OCT - orginal.xlsx", "#2E6E5E", None),
    ("global-discount", "Global Discount", "3-Globle discount-FMI Liscensed Case Balanced/Globle/GLOBLE DISCOUNT PARTNER Balanced  .xlsx", "#C5A065", None),
    ("nudu-noodles", "Nudu Noodles", "4-NuduNoodles DEBT Trick Balanced/EXample/NUDU NOODELS.xlsx", "#D97706", None),
    ("blue-rose", "Blue Rose", "5-Blue Rose Balanced-Amortization %/New folder/BLUE ROSE-AUGUST 24.xlsx", "#2563EB", None),
    ("bnd", "BND Company", "6-BND-Balanced/BND Practice-STL/AFMMock-BND -Tarig AFM .xlsx", "#7C3AED", None),
    ("purewave-sips", "PureWave Sips", "7-PURE WIVES-Min Cash Balance-DB-Balanced/New folder/DBM 24 SEP -DB Method.xlsx", "#0891B2", "DBM 24 SEP -DB Method"),
    ("etd-homes", "ETD Homes", "8-ETD-Balanced-DB-FINSHED HERE/MY EX/EX TARIG ETD HOMES.xlsx", "#9A3412", None),
    ("fast-moving", "Fast Moving Inc.", "9-FAST MOVING.INC WORLD CUP  Balanced/MY EX/FM.xlsx", "#16A34A", None),
    ("fresh-and-fab", "Fresh & Fab", "10-Fresh & Fab Balanced-Debt Trick %/New folder/Fresh &Fab .xlsx", "#65A30D", "Fresh &Fab"),
    ("gator", "Gator Inc.", "11-Gators Balanced-DB/EX/GATOR.xlsx", "#047857", None),
    ("jkl-logistics", "JKL Logistics", "12-JKL Balanced-DB/DONE/JKL 6 OCT .xlsx", "#4338CA", None),
    ("lnc-manufacturing", "LNC Manufacturing", "13-LNC Balanced/My ex/LNC.xlsx", "#BE123C", "LNC"),
    ("parker", "Parker Inc.", "14-Parker Inc Balanced/EX1/Parker .xlsx", "#0F766E", None),
    ("storage-corp", "Storage Corporation", "15-Storage Corp Balanced/New folder/STORGE CORP.xlsx", "#475569", "STORGE CORP"),
    ("farley", "Farley Inc.", "16-FARLY INC/Farly Tarig salah 22OCT-STL-Debt rate Variable-tax  .xlsx", "#A21CAF", None),
]

# ---------- colours ----------
def theme_palette(path):
    z = zipfile.ZipFile(path)
    names = [n for n in z.namelist() if n.startswith("xl/theme/") and n.endswith(".xml")]
    default = ["000000", "FFFFFF", "44546A", "E7E6E6", "4472C4", "ED7D31", "A5A5A5", "FFC000", "5B9BD5", "70AD47"]
    if not names:
        return [default[i] for i in (1, 0, 3, 2, 4, 5, 6, 7, 8, 9)]
    x = ET.fromstring(z.read(names[0]))
    ns = {"a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
    scheme = x.find(".//a:clrScheme", ns)
    cols = []
    for child in list(scheme):
        el = list(child)[0]
        cols.append(el.get("lastClr") if el.tag.endswith("sysClr") else el.get("val"))
    # file order dk1, lt1, dk2, lt2, acc1..6 ; Excel theme index order lt1, dk1, lt2, dk2, acc1..6
    return [cols[1], cols[0], cols[3], cols[2]] + cols[4:10]

def apply_tint(hexrgb, tint):
    r, g, b = (int(hexrgb[i:i + 2], 16) / 255 for i in (0, 2, 4))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    l = l * (1 + tint) if tint < 0 else l * (1 - tint) + tint
    r, g, b = colorsys.hls_to_rgb(h, l, s)
    return "%02X%02X%02X" % (round(r * 255), round(g * 255), round(b * 255))

def color(c, palette):
    if c is None:
        return None
    try:
        if c.type == "rgb" and isinstance(c.rgb, str):
            v = c.rgb[-6:]
        elif c.type == "theme":
            v = palette[c.theme] if c.theme < len(palette) else None
        elif c.type == "indexed":
            v = COLOR_INDEX[c.indexed][-6:] if c.indexed < len(COLOR_INDEX) else None
        else:
            return None
        if v and c.tint:
            v = apply_tint(v, c.tint)
        return "#" + v if v else None
    except Exception:
        return None

# ---------- number formats ----------
def split_sections(fmt):
    out, cur, q = [], "", False
    i = 0
    while i < len(fmt):
        ch = fmt[i]
        if ch == '"':
            q = not q
        if ch == "\\" and i + 1 < len(fmt):
            cur += fmt[i:i + 2]; i += 2; continue
        if ch == ";" and not q:
            out.append(cur); cur = ""
        else:
            cur += ch
        i += 1
    out.append(cur)
    return out

def render_section(sec, num):
    """num is already non-negative (sign handled by section choice)."""
    sec = re.sub(r"\[(?:Red|Black|Blue|Green|White|Yellow|Magenta|Cyan|Color\d+)\]", "", sec, flags=re.I)
    sec = re.sub(r"\[\$([^\]-]*)(?:-[^\]]*)?\]", lambda m: '"' + m.group(1) + '"', sec)
    sec = re.sub(r"\[[^\]]*\]", "", sec)
    out, i, placeholder_done = "", 0, False
    while i < len(sec):
        ch = sec[i]
        if ch == '"':
            j = sec.index('"', i + 1) if '"' in sec[i + 1:] else len(sec)
            out += sec[i + 1:j]; i = j + 1; continue
        if ch == "\\" and i + 1 < len(sec):
            out += sec[i + 1]; i += 2; continue
        if ch == "_" and i + 1 < len(sec):
            out += " " if sec[i + 1] in ")%'" else ""; i += 2; continue
        if ch == "*" and i + 1 < len(sec):
            i += 2; continue
        if ch in "0#?.," and not placeholder_done:
            j = i
            while j < len(sec) and sec[j] in "0#?.,":
                j += 1
            ph = sec[i:j]
            pct = "%" in sec
            v = num * 100 if pct else num
            dec = len(ph.split(".")[1].rstrip(",")) if "." in ph else 0
            trailing_commas = len(ph) - len(ph.rstrip(","))
            v = v / (1000 ** trailing_commas)
            s = f"{v:,.{dec}f}" if "," in ph.rstrip(",") else f"{v:.{dec}f}"
            if ph.replace(",", "").startswith("#") and s.startswith("0") and abs(v) < 1 and dec == 0:
                s = "0" if "0" in ph else ""
            out += s; i = j; placeholder_done = True; continue
        if ch == "@":
            i += 1; continue
        out += ch; i += 1
    return out

def format_value(v, fmt):
    if v is None:
        return ""
    if isinstance(v, bool):
        return "TRUE" if v else "FALSE"
    if isinstance(v, (datetime, date)):
        f = (fmt or "").lower()
        if "h" in f and ("y" not in f and "d" not in f):
            return v.strftime("%I:%M %p").lstrip("0")
        return f"{v.month}/{v.day}/{v.year}"
    if isinstance(v, time):
        return v.strftime("%I:%M %p").lstrip("0")
    if isinstance(v, str):
        return v
    if not isinstance(v, (int, float)):
        return str(v)
    fmt = fmt or "General"
    if fmt == "General":
        if float(v).is_integer():
            return str(int(v))
        s = f"{v:.10g}"
        return s
    if re.search(r"[dmyhs]", re.sub(r'"[^"]*"|\[[^\]]*\]|\\.', "", fmt), re.I) and not re.search(r"[0#]", fmt):
        try:
            from openpyxl.utils.datetime import from_excel
            return format_value(from_excel(v), fmt)
        except Exception:
            pass
    secs = split_sections(fmt)
    if v < 0 and len(secs) >= 2:
        return render_section(secs[1], -v)
    if v == 0 and len(secs) >= 3:
        return render_section(secs[2], 0)
    s = render_section(secs[0], abs(v))
    return ("-" + s) if v < 0 and len(secs) < 2 else s

# ---------- export ----------
def patch_values(o_name):
    """Cells whose value changed between the LibreOffice recalc of the original and of the fixed copy."""
    if not o_name:
        return {}
    a = openpyxl.load_workbook(f"/tmp/rcO/{o_name}.xlsx" if os.path.exists(f"/tmp/rcO/{o_name}.xlsx") else f"/tmp/rcO/{o_name} .xlsx", data_only=True)
    b = openpyxl.load_workbook(f"/tmp/rcF/{o_name} - FIXED.xlsx", data_only=True)
    out = {}
    for ws in a.worksheets:
        wb = b[ws.title]
        for row in ws.iter_rows():
            for c in row:
                if c.value != wb[c.coordinate].value:
                    out[(ws.title, c.coordinate)] = wb[c.coordinate].value
    return out

def export(slug, name, path, accent, patch_from):
    full = B + path
    palette = theme_palette(full)
    wv = openpyxl.load_workbook(full, data_only=True)
    patches = patch_values(patch_from)
    styles, style_ids = [], {}

    def sid(cell):
        f, fl, al = cell.font, cell.fill, cell.alignment
        st = {}
        if f.b: st["b"] = 1
        if f.i: st["i"] = 1
        if f.u: st["u"] = 1
        fc = color(f.color, palette)
        if fc and fc.upper() != "#000000": st["c"] = fc
        if fl is not None and fl.fill_type == "solid":
            bg = color(fl.fgColor, palette)
            if bg and bg.upper() != "#FFFFFF": st["bg"] = bg
        if al.horizontal in ("center", "right"): st["a"] = al.horizontal
        elif al.horizontal == "centerContinuous": st["a"] = "cc"   # Excel "Center Across Selection"
        if al.indent: st["in"] = int(al.indent)
        bd = cell.border
        if bd.top is not None and bd.top.style: st["bt"] = 1
        if bd.bottom is not None and bd.bottom.style: st["bb"] = 2 if bd.bottom.style in ("double",) else 1
        if f.sz and abs(f.sz - 11) > 0.5: st["sz"] = round(f.sz)
        key = json.dumps(st, sort_keys=True)
        if key not in style_ids:
            style_ids[key] = len(styles); styles.append(st)
        return style_ids[key]

    sheets = []
    for ws in wv.worksheets:
        if ws.sheet_state != "visible" or re.fullmatch(r"\s*sheet\d*\s*", ws.title, re.I) or "exam info" in ws.title.lower():
            continue
        # used area: last row/col with a value or a fill
        max_r = max_c = 0
        for row in ws.iter_rows():
            for c in row:
                if c.value is not None or (c.fill is not None and c.fill.fill_type == "solid"):
                    max_r = max(max_r, c.row); max_c = max(max_c, c.column)
        max_r, max_c = min(max_r, 600), min(max_c, 60)
        hidden_cols = {k for k, d in ws.column_dimensions.items() if d.hidden}
        cols = []
        for ci in range(1, max_c + 1):
            L = get_column_letter(ci)
            d = ws.column_dimensions.get(L)
            w = d.width if d is not None and d.width else (ws.sheet_format.defaultColWidth or 9.14)
            cols.append(0 if L in hidden_cols else round(w, 1))
        rows = []
        for ri in range(1, max_r + 1):
            rd = ws.row_dimensions.get(ri)
            if rd is not None and rd.hidden:
                continue
            cells = []
            for ci in range(1, max_c + 1):
                c = ws.cell(row=ri, column=ci)
                v = patches.get((ws.title, c.coordinate), c.value)
                s = sid(c)
                text = format_value(v, c.number_format)
                if isinstance(v, str) and v.startswith("="):
                    text = ""  # never leak a formula (should not happen with cached values)
                if text or styles[s]:
                    cells.append([ci - 1, text, s] if text else [ci - 1, "", s])
            rows.append({"r": ri, "c": cells})
        merges = []
        for m in ws.merged_cells.ranges:
            if m.min_row <= max_r and m.min_col <= max_c:
                merges.append([m.min_row, m.min_col - 1, m.max_row, min(m.max_col, max_c) - 1])
        sheets.append({"name": ws.title.strip(), "cols": cols, "rows": rows, "merges": merges,
                       "grid": bool(ws.sheet_view.showGridLines)})
    data = {"slug": slug, "name": name, "accent": accent, "sheets": sheets, "styles": styles}
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    assert "=" not in "".join(c[1][:1] for s in sheets for r in s["rows"] for c in r["c"] if c[1]), "formula leak"
    return data, blob

if __name__ == "__main__":
    out = "/home/claude/model_json"
    os.makedirs(out, exist_ok=True)
    index = []
    for slug, name, path, accent, patch in MODELS:
        data, blob = export(slug, name, path, accent, patch)
        open(f"{out}/{slug}.json", "w").write(blob)
        index.append({"slug": slug, "name": name, "accent": accent, "sheets": [s["name"] for s in data["sheets"]]})
        print(f"{slug:18} {len(blob)/1024:7.1f} KB  sheets={[s['name'] for s in data['sheets']]}")
    json.dump(index, open(f"{out}/index.json", "w"), indent=1)
