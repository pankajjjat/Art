# MITTI Google Apps Script API — Deployment Guide

## Step 1: Create the Google Sheet

1. Go to [sheets.new](https://sheets.new)
2. Rename the spreadsheet to **MITTI CMS**
3. Run the **createAllSheets()** function (see next step) — this auto-creates all tabs with headers and sample data

## Step 2: Link Apps Script

1. In the sheet, go to **Extensions → Apps Script**
2. Delete the default `myFunction()` code
3. Paste the contents of `code.gs` into the editor
4. **Also create a new HTML file:** File → New → HTML file → name it `Dashboard`
   - Copy the contents of `Dashboard.html` from the repo into this file
5. Click the save icon (💾) and name the project **MITTI CMS API**

## Step 3: Run the Sheet Creator (first time only)

1. In the Apps Script editor, select `createAllSheets` from the dropdown
2. Click **Run** — it will ask for permissions (review your own sheet data)
3. After running, check your Google Sheet — all tabs should exist with sample data

## Step 3: Run the Dashboard Setup

1. Save the project, then **reload your Google Sheet**
2. You'll see a new **🌍 MITTI** menu appear in the sheet toolbar:
   - **📊 Dashboard** — opens the sidebar with stats, products, inquiries, orders
   - **📦 / 💬 / 📋 / ✏️** — shortcut to each sheet tab
   - **➕ New Product** — opens the Artworks tab to add a new row
   - **✚ Create Contacts Tab** — adds the Contacts sheet (run once)
   - **📦 Fix Prices & Stock** — resets correct prices
3. Click **🌍 MITTI → ✚ Create Contacts Tab** to add the Contacts sheet (if it doesn't exist yet)

## Step 4: Deploy as Web App

1. Click **Deploy → New deployment**
2. Choose type: **Web app**
3. Settings:
   - **Description:** `MITTI CMS API v1`
   - **Execute as:** `Me` (uses your Google account)
   - **Who has access:** `Anyone`
4. Click **Deploy**
5. **Copy the Web App URL** — it looks like:
   `https://script.google.com/macros/s/ABC123.../exec`
6. Click **Done**

## Step 5: Configure the Frontend

1. Open `js/api.js` in the project
2. Replace `YOUR_DEPLOYED_SCRIPT_URL` with the URL from Step 4
3. Commit and push to GitHub:

```bash
git add -A
git commit -m "Add Google Sheets CMS system"
git push
```

## API Endpoints

Once deployed, the API responds to:

| Endpoint | Description |
|----------|-------------|
| `?action=artworks` | All artworks/products |
| `?action=categories` | Shop categories |
| `?action=testimonials` | Customer reviews |
| `?action=faq` | Frequently asked questions |
| `?action=content` | Site-wide text content |
| `?action=blog` | Blog posts |
| `?action=images` | Image URL manager |
| `?action=orders` | Customer orders |
| `?action=contact` | Contact form (POST with name, email, message) |
| `?action=all` | Everything in one request |
| `?action=stats` | Shop statistics |

All responses follow the format:
```json
{ "success": true, "data": [...] }
```

## Updating Your Site

**To add a product:** Add a row to the Artworks sheet → website updates automatically (no GitHub commit needed)

**To change site text:** Edit the Website_Content sheet → changes appear on refresh

**To add a blog post:** Add a row to Blog_Posts with title, slug, date, excerpt, content → appears on blog index

**Inquiries:** Contact form submissions are stored in the Contacts sheet (columns: timestamp, name, email, phone, message, status)

## Permissions Note

The first time someone visits your site, the API call will return data immediately. Apps Script has a ~6s cold-start latency after prolonged inactivity, so the first request of the day may be slow. Subsequent requests are fast. The `api.js` layer includes caching to handle this.

## Troubleshooting

- **401/403 error:** Re-deploy the web app (Deploy → Manage deployments → Edit → Deploy)
- **Blank data:** Check that all sheet tab names match exactly (Artworks, Categories, etc.)
- **Column mismatch:** The `id` column must be the first column in Artworks, Categories, Blog_Posts, and Orders
