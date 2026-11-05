# Amira's Plate website

Arabic (RTL) one-page site for Amira's Plate: home-made Egyptian food with delivery. Customers fill a basket and send the order as a ready-typed WhatsApp message. There is no server and no database.

## Folders

| Path | What it is |
|---|---|
| `site/` | **The website.** Upload this folder as-is to any static host. |
| `site/index.html` | The page (design D: Egyptian-traditional layout in the logo's colours). |
| `site/post.html` | Amira's private post maker: builds the WhatsApp group posts (offers, menu, available today) from the sheet. Not linked from the site; `noindex`. |
| `site/assets/js/config.js` | Settings: WhatsApp number, Google Sheet links, delivery details, social links. |
| `site/assets/js/menu-data.js` | Reads the sheet tabs (or `site/data/`) for every page. |
| `site/assets/js/app.js` | Draws the menu and runs the basket. |
| `site/assets/js/post.js` | Builds the post text for `post.html`. |
| `site/assets/css/style.css` | All styling. |
| `site/data/*.csv` | Built-in copy of the sheet (categories, items, offers, messages). Used when no sheet is linked, or when the sheet can't be reached. |
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
2. **File > Share > Publish to web**. For each of the tabs الأقسام, الأصناف, العروض and الرسائل, pick the tab, choose **Comma-separated values (.csv)**, and press Publish. That gives four links.
3. Paste the links into `sheet` in `site/assets/js/config.js` (`categories`, `items`, `offers`, `messages`) and upload the site again.

From then on Amira edits the sheet and the site follows. Google refreshes published sheets about every 5 minutes. Column names in row 1 must stay exactly as they are.

## Sheet columns

- **الأقسام** (categories): القسم, الوصف, الصورة (a file name in `site/img/`), الأيقونة. Row order = order on the site.
- **الأصناف** (items): القسم, الصنف, الوحدة, السعر (number only; empty = "حسب سعر اليوم"), متاح (نعم / لا; لا = shown greyed out as unavailable), انشر (نعم = included in the "متاح النهارده" post).
- **العروض** (offers): العرض, السعر, الوصف, الاختيارات (one choice per line inside the cell), ملاحظة, متاح (لا = hidden).
- **الرسائل** (messages): النوع (exactly العروض, المنيو or متاح النهارده), أول الرسالة, آخر الرسالة: the opening and closing lines of each WhatsApp post. Without this tab the posts use built-in wording.

## WhatsApp posts

Amira opens `<site address>/post.html` on her phone, picks a post (العروض, المنيو with an optional section, or متاح النهارده), checks the preview, and taps **ابعتي على واتساب**: WhatsApp opens with the text typed, she picks the group and sends. **انسخي الرسالة** copies it for anywhere else. Posts leave out unavailable dishes and end with the site link and the WhatsApp number. Nothing is sent automatically: WhatsApp offers no permitted way for a website to post into a group.
