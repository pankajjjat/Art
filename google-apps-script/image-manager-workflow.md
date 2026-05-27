# Image Manager — Upload & Manage Artwork Images from Phone

The **Image_Manager** sheet tab lets you manage all artwork images without editing code.

## How it Works

| Column | Description |
|--------|-------------|
| `title` | Artwork name (matches Artworks sheet) |
| `image_url` | Full-resolution image URL (Google Drive, CDN, or relative path) |
| `thumbnail_url` | Smaller thumbnail URL (optional — falls back to image_url) |

## Workflow (Phone-Friendly)

### Option A: Google Drive (free, 15GB)

1. Open Google Drive app on your phone
2. Upload your artwork photo
3. Tap the file → **Copy link** → set sharing to **"Anyone with the link"**
4. Paste the URL into the Image_Manager sheet

### Option B: ImgBB / Free Image Hosting

1. Go to [imgbb.com](https://imgbb.com) on your phone
2. Upload the artwork image
3. Copy the direct image URL (ends in .jpg/.png)
4. Paste into the Image_Manager sheet

### Option C: Keep Using GitHub (current)

The current images at `images/optimized/` and `images/svg/` still work. The Image_Manager sheet is for **future migration** when you want to manage images from your phone.

## Accessing Image URLs in Code

The `api.js` layer automatically resolves image paths:

```javascript
// Image_Manager data is loaded via: ?action=images
// The render engine prioritizes Image_Manager URLs over local paths
```

## When to Switch to Image_Manager

- ✅ You want to upload new product photos from your phone
- ✅ You're adding a product and need to link its image
- ✅ You want to use a CDN for faster loading
- ❌ Don't worry about it if you're happy with the current local images

Currently the site uses the `Artworks` sheet's `image` column (local path like `landscapes_1.jpg`), which resolves to `images/optimized/landscapes_1.jpg`. The Image_Manager is ready for when you want to switch to remote URLs.
