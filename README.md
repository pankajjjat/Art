# MITTI (मिट्टी) — Art Gallery

**A headless CMS-driven art gallery website** built on Google Sheets, Google Apps Script, vanilla JavaScript, and GitHub Pages. Product data, blog posts, testimonials, and site content are managed through a single Google Sheet — no code edits required for day-to-day updates.

**[Live Site](https://pankajjjat.github.io/Art/)**

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│  Google Sheets (9 tabs)         ← CMS data source   │
│  Artworks · Categories · Blog · FAQs · Content ...  │
└────────────────────┬─────────────────────────────────┘
                     │ Google Apps Script (code.gs)
                     ▼ JSON REST API
┌──────────────────────────────────────────────────────┐
│  api.js             Fetch layer + sessionStorage      │
│  cms.js             Render engine (gallery, blog,     │
│                     FAQ, testimonials, SEO tags)     │
│  main.js            UI (lightbox, cart, cursor,       │
│                     navigation)                      │
│  product-detail.js  Per-product CMS data loader      │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────┐
│  GitHub Pages          Static hosting, auto-deploy    │
│  (vanilla HTML/JS)     via GitHub Actions             │
└──────────────────────────────────────────────────────┘
```

**Stack:** Google Sheets · Google Apps Script · Vanilla JavaScript · GitHub Pages · GitHub Actions

### Data Flow

1. You update the **Google Sheet** from any device
2. **Apps Script** (`code.gs`) exposes the data as JSON endpoints (`?action=artworks`, `?action=blog`, etc.)
3. **`api.js`** fetches from the API, caches in `sessionStorage` (5-minute TTL), and falls back to local JSON files in `/data/` if the API is unreachable
4. **`cms.js`** renders all dynamic sections: gallery grid, category cards, featured pieces, blog feed, FAQ accordion, testimonials, and SEO meta tags
5. **`product-detail.js`** loads the correct product data per page (name, price, description, dimensions, images) from the CMS and updates all SEO metadata, JSON-LD schema, share links, and cart integration
6. **`main.js`** provides the UI layer: lightbox gallery, cart with UPI checkout, custom cursor, scroll effects

---

## Features

- **Headless CMS** — Google Sheets as the data layer; edit products, prices, blog posts, and site content from your phone
- **Dynamic product pages** — 13 product pages load name, price, description, images, dimensions, and SEO metadata live from the CMS
- **Google Image Search** — Sitemap includes `<image:image>` entries for all products and blog posts
- **RSS feed** — Blog content available via `blog/feed.xml` with auto-discovery link
- **Structured data** — JSON-LD (`ArtGallery`, `Product`, `BlogPosting`) on every relevant page
- **Open Graph / Twitter Cards** — Per-page social sharing metadata (product-specific OG images)
- **Image fallback chain** — JPG → SVG → gradient placeholder (no broken images)
- **Lightbox gallery** — Full-screen product viewer with category filter
- **Shopping cart** — localStorage-persisted cart with UPI payment modal
- **Mobile responsive** — Optimised for all device sizes (hamburger nav, fluid grids, responsive hero)
- **Accessibility** — Semantic HTML, ARIA labels, alt text on all images, keyboard navigation

---

## Project Structure

```
mitti-website/
├── index.html                    Homepage (CMS-driven)
├── 404.html                      Custom error page
├── robots.txt                    Search engine crawl rules
├── sitemap.xml                   27 URLs with 36 image entries
├── favicon.svg
│
├── css/
│   └── style.css                 All styles (single file)
│
├── js/
│   ├── api.js                    CMS API fetch layer + sessionStorage cache
│   ├── cms.js                    CMS render engine (gallery, blog, FAQ, SEO)
│   ├── main.js                   UI: lightbox, cart, cursor, navigation
│   └── product-detail.js         Per-product CMS data loader
│
├── data/                         Local JSON fallbacks (API unavailable)
│   ├── products.json
│   ├── categories.json
│   ├── faq.json
│   ├── blog.json
│   ├── testimonials.json
│   └── settings.json
│
├── images/
│   ├── optimized/                19 product and blog images (JPG/PNG)
│   └── svg/                      18 SVG fallbacks
│
├── product/                      13 product detail pages
├── blog/                         5 blog posts + RSS feed
├── faq/                          FAQ page (accordion, CMS-driven)
├── shipping/                     Shipping policy (static)
├── payment/                      Payment info (static)
│
├── google-apps-script/
│   ├── code.gs                   Apps Script backend (API + sheet management)
│   ├── Dashboard.html           4-tab sidebar dashboard for CMS
│   └── DEPLOY.md                 Full deployment guide
│
└── .github/workflows/deploy.yml  GitHub Actions auto-deploy
```

---

## Managing Content

All day-to-day content is managed through the **Google Sheet**. No code or GitHub commits are required for:

| Data | Sheet Tab | What You Can Edit |
|------|-----------|-------------------|
| Products | **Artworks** | Title, price, description, category, dimensions, stock status, images |
| Categories | **Categories** | Name, slug, display order |
| Blog posts | **Blog_Posts** | Title, slug, excerpt, body content, publish date |
| FAQs | **FAQs** | Question, answer, display order |
| Testimonials | **Testimonials** | Customer name, review text, rating |
| Site content | **Website_Content** | Hero text, about story, contact info, social links |
| Orders | **Orders** | Auto-populated from contact form submissions |
| Images | **Image_Manager** | Map artwork titles to image URLs (for future CDN migration) |

Changes appear on the live site within seconds. The first API call after inactivity may cold-start in ~6 seconds.

### Fallback: Editing Local JSON Files

If the API is unreachable, the site falls back to the JSON files in `data/`. Edit these through GitHub.dev (press `.` on the repository page) and commit to `main`:

```jsonc
// data/products.json
[
  {
    "id": 1,
    "name": "Mountain Vista",
    "slug": "mountain-vista",
    "category": "landscapes",
    "price": 12999,
    "description": "...",
    "image": "images/optimized/landscapes_1.jpg"
  }
]
```

---

## Setup Guide

### 1. Deploy the Google Apps Script API

Full instructions: [`google-apps-script/DEPLOY.md`](google-apps-script/DEPLOY.md)

1. Create a new Google Sheet at [sheets.new](https://sheets.new)
2. Open **Extensions → Apps Script**
3. Paste the contents of [`google-apps-script/code.gs`](google-apps-script/code.gs)
4. Run the `createAllSheets()` function to auto-generate the 9 sheet tabs with sample data
5. Click **Deploy → New deployment → Web app** (set "Execute as: Me", "Who has access: Anyone")
6. Copy the deployment URL
7. Update `API_BASE` in `js/api.js` with the new URL

### 2. Deploy the Frontend

1. Push to the `main` branch of your GitHub repository
2. Enable **GitHub Pages** in the repository settings (Source: `main`, folder: `/`)
3. The `.github/workflows/deploy.yml` action handles auto-deployment
4. Your site is live at `https://<username>.github.io/<repository>/`

---

## API Endpoints

| Endpoint | Description |
|----------|-------------|
| `?action=artworks` | All products with prices, categories, stock |
| `?action=categories` | Shop categories and metadata |
| `?action=testimonials` | Customer reviews |
| `?action=faq` | FAQ entries |
| `?action=content` | Site text and settings (key-value) |
| `?action=blog` | Blog posts |
| `?action=images` | Image URL manager |
| `?action=stats` | Shop statistics (counts per category, totals) |
| `?action=all` | All data in a single response |

---

## Performance

- **No frameworks** — vanilla JavaScript, zero dependencies
- **Lazy loading** — all images use `loading="lazy"`
- **SessionStorage cache** — API responses cached for 5 minutes to reduce network calls
- **Image fallback chain** — JPG → SVG → gradient, ensuring no broken images
- **Minimal CSS** — single stylesheet (~700 lines), no unused rules
- **GitHub Actions** — continuous deployment on every push

---

## Color System

| Token | Hex | Usage |
|-------|-----|-------|
| `--deep-earth` | `#1A1612` | Backgrounds, footer |
| `--dark-clay` | `#3A3028` | Cards, nav |
| `--raw-earth` | `#5A4A3A` | Borders, muted text |
| `--terracotta` | `#8A4A30` | Accents, links |
| `--warm-clay` | `#C2623E` | Primary brand colour |
| `--golden-amber` | `#C4883A` | Highlights |
| `--cream` | `#F2EBE0` | Text on dark backgrounds |

---

## License

© 2024–2026 MITTI (मिट्टी) — founded by Saumya. All rights reserved.

Built by [Pankaj](https://github.com/pankajjjat).
