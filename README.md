# Amira's Plate website

Arabic (RTL) one-page site for Amira's Plate: home-made Egyptian food with delivery. Customers fill a basket and send the order as a ready-typed WhatsApp message. There is no server and no database.

## Folders

| Path | What it is |
|---|---|
| `site/` | **The website.** Upload this folder as-is to any static host. |
| `site/index.html` | The page (design D: Egyptian-traditional layout in the logo's colours). |
| `site/assets/js/config.js` | Settings: WhatsApp number, Google Sheet links, delivery details, social links. |
| `site/assets/js/app.js` | Loads the menu, draws it, runs the basket. |
| `site/assets/css/style.css` | All styling. |
| `site/data/*.csv` | Built-in copy of the menu (categories, items, offers). Used when no sheet is linked, or when the sheet can't be reached. |
| `site/img/` | Logo and food photos (taken from Instagram, to be replaced by originals). |
| `site/qr/` | WhatsApp QR code: `.svg` for print shops, `.png` (1320 px) for everything else. |
| `sheet-template/AmirasPlate-Menu.xlsx` | Starter file for Amira's Google Sheet, made from `site/data/`. |
| `tools/build_sheet_template.py` | Rebuilds that starter file. |
| `design-samples/`, `pages-samples/` | The four design proposals shown to Amira (kept for reference). |
| `images/` | Original downloads (logos, Instagram posts). |

## Preview locally

```bash
python -m http.server 8765 --directory site
```

Then open http://localhost:8765. Opening `index.html` straight from disk won't load the menu: browsers block reading the CSV files from `file://`.

## Connecting Amira's Google Sheet

1. In Google Sheets: **File > Import > Upload** `sheet-template/AmirasPlate-Menu.xlsx`, choosing "Replace spreadsheet".
2. **File > Share > Publish to web**. For each of the tabs الأقسام, الأصناف and العروض, pick the tab, choose **Comma-separated values (.csv)**, and press Publish. That gives three links.
3. Paste the links into `sheet` in `site/assets/js/config.js` (`categories`, `items`, `offers`) and upload the site again.

From then on Amira edits the sheet and the site follows. Google refreshes published sheets about every 5 minutes. Column names in row 1 must stay exactly as they are.

## Sheet columns

- **الأقسام** (categories): القسم, الوصف, الصورة (a file name in `site/img/`), الأيقونة. Row order = order on the site.
- **الأصناف** (items): القسم, الصنف, الوحدة, السعر (number only; empty = "حسب سعر اليوم"), متاح (نعم / لا; لا = shown greyed out as unavailable).
- **العروض** (offers): العرض, السعر, الوصف, الاختيارات (one choice per line inside the cell), ملاحظة, متاح (لا = hidden).
