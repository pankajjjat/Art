<p align="center">
  <br>
  <img src="https://img.shields.io/badge/MITTI-Earth._Art._Belonging.-C2623E?style=for-the-badge&labelColor=1A1612" alt="MITTI" width="600">
</p>

<br>

<p align="center">
  <a href="https://pankajjjat.github.io/Art/">🌍 Live Site</a> •
  <a href="#-features">Features</a> •
  <a href="#%EF%B8%8F-architecture">Architecture</a> •
  <a href="#%EF%B8%8F-managing-content">Managing Content</a> •
  <a href="#-google-sheets-setup">Setup</a>
</p>

<br>

<p align="center">
  <img src="images/optimized/og-image.jpg" alt="MITTI — Art Gallery Preview" width="90%" style="border-radius: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.3);">
</p>

<br>

## 🌱 About

**MITTI (मिट्टी)** is a handcrafted Indian art brand founded by **Saumya**. Rooted in India's rich artistic traditions — from **Lippan (mirror-work) art of Kutch** to contemporary abstract landscapes — each piece is made from earth, for the wall.

> *"From earth, for the wall."*

The name **MITTI** means *soil* — a reminder that every painting begins with clay, pigment, and the hands that shaped them.

---

## ✨ Features

| | |
|---|---|
| 🗄️ **Google Sheets CMS** — manage products, blogs, FAQs from phone | 📱 **Zero-cost** — Google Apps Script + GitHub Pages + Sheets |
| 🖼️ **Dynamic Gallery** — search, filter by category, featured pieces | 🎨 **Custom Art Cursor** — grain texture with earth-palette trail |
| 🛒 **Cart + UPI Checkout** — localStorage cart, UPI payment modal | 📰 **Blog** — CMS-managed posts, auto-rendered |
| 📍 **Dynamic JSON-LD** — schema.org ArtGallery markup auto-generated | 🐦 **Open Graph / Twitter Cards** for social sharing |
| 🔮 **Image Fallback Chain** — JPG → SVG → gradient placeholder | ⚡ **Lightweight** — vanilla JS, no frameworks |

---

## 🏗️ Architecture

```
┌──────────────────────┐
│   Google Sheet       │  ← Edit on phone or laptop
│   (8 tabs)           │
└─────────┬────────────┘
          │ Google Apps Script
          ▼ JSON API
┌──────────────────────┐
│   api.js             │  ← Fetch layer with sessionStorage cache
│   cms.js             │  ← Render engine (gallery, blog, FAQ, etc.)
│   main.js            │  ← UI layer (lightbox, cart, cursor)
└─────────┬────────────┘
          │
          ▼
┌──────────────────────┐
│   GitHub Pages       │
│   (static HTML/JS)   │
└──────────────────────┘
```

**Stack:** Google Sheets · Google Apps Script · Vanilla JS · GitHub Pages

### Data Flow

1. You update the **Google Sheet** (or use local JSON fallback files in `/data/`)
2. Apps Script serves data via `?action=artworks|categories|testimonials|faq|content|blog`
3. `api.js` fetches, caches in sessionStorage (5 min), falls back to local JSON if offline
4. `cms.js` renders all sections dynamically: gallery grid, category cards, featured, blog, FAQ accordion, testimonials, SEO tags
5. `main.js` handles UI: lightbox, cart, navigation, cursor effects, parallax

---

## 🗄️ Managing Content

### From Phone (Once API is deployed)

Everything is managed from **one Google Sheet** with these tabs:

| Tab | What it controls |
|-----|-----------------|
| **Artworks** | Add/edit/remove products — title, price, category, image, stock |
| **Categories** | Shop categories (Landscapes, Abstract, Lippan Art, etc.) |
| **Testimonials** | Customer reviews that appear on the homepage |
| **FAQs** | Accordion Q&A on the FAQ page |
| **Website_Content** | Site text: hero title, about story, contact info, social links |
| **Blog_Posts** | Add/edit blog posts — title, excerpt, body HTML, publish date |
| **Orders** | Orders placed through the site (auto-populated via contact form) |
| **Image_Manager** | Map artwork titles to image URLs (for future CDN migration) |

**No GitHub commits needed** — changes appear on your site within seconds (first load may cold-start ~6s).

### From Browser (GitHub.dev — Fallback)

If the API is unreachable, the site falls back to local JSON files:

```
data/
├── settings.json        ← Site name, tagline, social links
├── products.json        ← All 13 products
├── categories.json      ← 5 categories
├── testimonials.json    ← Customer reviews
├── faq.json             ← FAQ Q&A
└── blog.json            ← Blog posts
```

1. Open [github.com/pankajjjat/Art](https://github.com/pankajjjat/Art)
2. Press **`.` (dot key)** — VS Code in browser
3. Edit the JSON files → commit to `main`
4. ✅ GitHub Pages auto-deploys in ~30 seconds

---

## 🛠️ Google Sheets Setup

### Step 1: Create the Sheet & Deploy the API

Full instructions in **`google-apps-script/DEPLOY.md`** — but the TL;DR:

1. Go to [sheets.new](https://sheets.new), rename to **MITTI CMS**
2. **Extensions → Apps Script** → paste `google-apps-script/code.gs`
3. Run `createAllSheets()` to auto-generate all 8 tabs with sample data
4. **Deploy → New deployment → Web app** (Anyone can access)
5. Copy the URL → paste into `js/api.js` as `API_BASE`

### Step 2: Update Your Site from Anywhere

| Task | How |
|------|-----|
| **Add a product** | New row in Artworks sheet |
| **Change price** | Edit the price cell |
| **Add a blog post** | New row in Blog_Posts with title, slug, excerpt, content |
| **Update FAQ** | Edit/Add rows in FAQs sheet |
| **Change site tagline** | Edit Website_Content sheet |
| **Mark sold** | Set inStock to FALSE in Artworks |

### API Endpoints

```
GET ?action=artworks       → All products
GET ?action=categories     → Shop categories
GET ?action=testimonials   → Customer reviews
GET ?action=faq            → FAQ entries
GET ?action=content        → Site text (key-value map)
GET ?action=blog           → Blog posts
GET ?action=images         → Image URL manager
GET ?action=stats          → Shop statistics
GET ?action=all            → Everything in one call
```

---

## 🎨 Color Palette

```
🟤 #1A1612  Deep Earth / Charcoal
🟤 #3A3028  Dark Clay
🟤 #5A4A3A  Raw Earth
🔴 #8A4A30  Terracotta
🟠 #C2623E  Warm Clay
🟡 #C4883A  Golden Amber
⚪ #F2EBE0  Cream / Parchment
```

---

## 📁 File Structure

```
mitti-website/
├── index.html                ← Home page (CMS-driven)
├── css/
│   └── style.css             ← All styles (FAQ + testimonial styles added)
├── js/
│   ├── api.js                ← Data fetch layer + sessionStorage cache
│   ├── cms.js                ← Render engine (gallery, blog, FAQ, SEO)
│   └── main.js               ← UI (lightbox, cart, cursor, effects)
├── data/
│   ├── products.json         ← Local fallback (API unavailable)
│   ├── categories.json
│   ├── testimonials.json
│   ├── faq.json
│   ├── blog.json
│   └── settings.json
├── google-apps-script/
│   ├── code.gs               ← Complete Apps Script backend
│   └── DEPLOY.md             ← Full setup guide
├── images/
│   ├── optimized/            ← 34 JPG product photos
│   └── svg/                  ← 37 SVG fallbacks
├── blog/                     ← Blog index (CMS-driven)
├── faq/                      ← FAQ page (CMS-driven accordion)
├── shipping/                 ← Static shipping info
├── payment/                  ← Static payment info
└── .github/workflows/        ← GitHub Actions deploy
```

---

## 🌐 Connect

<p align="center">
  <a href="https://www.instagram.com/saumya.chaurasia04">📷 Instagram</a> •
  <a href="https://www.facebook.com/profile.php?id=100077641696027">📘 Facebook</a> •
  <a href="https://pinterest.com/mittiart">📌 Pinterest</a> •
  <a href="https://pankajjjat.github.io/Art/">🌍 MITTI Art Gallery</a>
</p>

---

<p align="center">
  <sub>Built with 🪴 by <a href="https://github.com/pankajjjat">Pankaj</a> for <strong>MITTI (मिट्टी)</strong> — founded by Saumya · © 2024–2026</sub>
</p>
