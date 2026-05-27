/**
 * MITTI Product Detail — Dynamic CMS Loader
 * ============================================
 * Loads product data from Google Sheets CMS via MITTI_API
 * and updates all page elements (SEO, content, images, share links).
 *
 * Falls back gracefully to hardcoded values if API is unavailable.
 * Order: api.js → cms.js → main.js → product-detail.js
 */
(function() {
  'use strict';

  // Extract product slug from URL path
  var path = window.location.pathname;
  var slug = path.replace(/\/product\//, '').replace(/\/+$/, '');
  if (!slug) return;

  // Wait for MITTI_API to be ready, then load and render
  function initProduct() {
    if (typeof MITTI_API === 'undefined' || typeof MITTI_API.loadAll !== 'function') {
      setTimeout(initProduct, 100);
      return;
    }

    MITTI_API.loadAll().then(function() {
      var product = MITTI_API.getBySlug(slug);
      if (!product) return;

      var siteUrl = MITTI_API.content.site_url || window.location.origin;
      var imageUrl = product.image
        ? (product.image.startsWith('http') ? product.image : siteUrl + '/images/optimized/' + product.image)
        : '';
      var baseUrl = siteUrl + '/product/' + product.slug + '/';
      var productName = product.title || product.name;
      var productCategory = product.cat_clean || product.category || '';
      var titleTag = productName + ' — MITTI Art Gallery | ' + productCategory;

      // ── SEO: Title ──────────────────────────────────────────
      document.title = titleTag;

      // ── SEO: Meta Description ────────────────────────────────
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && product.description) metaDesc.setAttribute('content', product.description);

      // ── SEO: OG Tags ─────────────────────────────────────────
      var ogMap = {
        'og:title': productName + ' — MITTI Art Gallery',
        'og:description': product.description || '',
        'og:url': baseUrl,
      };
      Object.keys(ogMap).forEach(function(key) {
        var el = document.querySelector('meta[property="' + key + '"]');
        if (el) el.setAttribute('content', ogMap[key]);
      });
      if (imageUrl) {
        var ogImg = document.querySelector('meta[property="og:image"]');
        if (ogImg) ogImg.setAttribute('content', imageUrl);
      }

      // ── SEO: Twitter Cards ───────────────────────────────────
      var twMap = {
        'twitter:title': productName + ' — MITTI Art Gallery',
        'twitter:description': product.description || '',
      };
      Object.keys(twMap).forEach(function(key) {
        var el = document.querySelector('meta[name="' + key + '"]');
        if (el) el.setAttribute('content', twMap[key]);
      });
      if (imageUrl) {
        var twImg = document.querySelector('meta[name="twitter:image"]');
        if (twImg) twImg.setAttribute('content', imageUrl);
      }

      // ── SEO: Canonical ───────────────────────────────────────
      var canon = document.querySelector('link[rel="canonical"]');
      if (canon) canon.setAttribute('href', baseUrl);

      // ── SEO: JSON-LD Product Schema ──────────────────────────
      var ldScript = document.querySelector('script[type="application/ld+json"]');
      if (ldScript) {
        try {
          var ld = JSON.parse(ldScript.textContent);
          ld.name = productName;
          ld.description = product.description || '';
          ld.image = imageUrl;
          ld.category = productCategory;
          if (ld.offers) {
            ld.offers.price = String(product.price);
            ld.offers.url = baseUrl;
            ld.offers.availability = product.inStock
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock';
          }
          ldScript.textContent = JSON.stringify(ld);
        } catch(e) { /* keep existing JSON-LD */ }
      }

      // ── Content: Product Details ─────────────────────────────
      var q = document.querySelector.bind(document);

      var catEl = q('.product-detail-category');
      if (catEl) catEl.textContent = productCategory.toLowerCase();

      var nameEl = q('.product-detail-name');
      if (nameEl) nameEl.textContent = productName;

      var priceEl = q('.product-detail-price');
      if (priceEl) priceEl.textContent = MITTI_API.formatPrice(product.price);

      var dimEl = q('.product-detail-dimensions');
      if (dimEl && product.dimensions) dimEl.textContent = product.dimensions;

      var descEl = q('.product-detail-desc');
      if (descEl && product.description) descEl.textContent = product.description;

      // ── Content: Main Image ──────────────────────────────────
      var img = document.getElementById('mainProductImg');
      if (img && imageUrl) {
        // Clear old onerror to avoid conflict with inline fallback
        img.onerror = null;
        img.src = imageUrl;
        img.alt = productName + ' — ' + productCategory + ' by MITTI';
      }

      // ── Content: Add to Cart Button ──────────────────────────
      var cartBtn = q('.product-detail-actions .btn-primary');
      if (cartBtn) {
        var relPath = product.image
          ? (product.image.startsWith('http') ? product.image : '../images/optimized/' + product.image)
          : '';
        var escapedName = (productName).replace(/'/g, "\\'");
        cartBtn.setAttribute('onclick',
          "addToCart({id:'" + product.slug + "',name:'" + escapedName +
          "',price:" + product.price + ",image:'" + relPath + "'})");
      }

      // ── Content: Share Links ────────────────────────────────
      var shareLinks = document.querySelectorAll('.product-detail-share a');
      if (shareLinks.length >= 4) {
        var encodedUrl = encodeURIComponent(baseUrl);
        var encodedName = encodeURIComponent(productName);
        var encodedImage = encodeURIComponent(imageUrl);
        shareLinks[0].href = 'https://www.facebook.com/sharer/sharer.php?u=' + encodedUrl;
        shareLinks[1].href = 'https://twitter.com/intent/tweet?text=' + encodedName + ' by MITTI&url=' + encodedUrl;
        shareLinks[2].href = 'https://pinterest.com/pin/create/button/?url=' + encodedUrl + '&media=' + encodedImage + '&description=' + encodedName;
        shareLinks[3].href = 'https://api.whatsapp.com/send?text=' + encodedName + ' - ' + encodedUrl;
      }
    }).catch(function() {
      // API failed — hardcoded HTML values remain as fallback
    });
  }

  // Start when API script has had a chance to load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProduct);
  } else {
    initProduct();
  }
})();
