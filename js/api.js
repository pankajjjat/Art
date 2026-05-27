/**
 * MITTI CMS — API Client
 * =========================
 * Fetches data from Google Apps Script API.
 * Caches in sessionStorage. Falls back to local JSON if API is down.
 *
 * USAGE:
 *   await MITTI_API.loadAll();
 *   // Then access:  MITTI_API.artworks, MITTI_API.categories, ...
 */

const MITTI_API = (function() {
  'use strict';

  // ─── CONFIG ──────────────────────────────────────────────────────────────
  // 🔽 REPLACE THIS with your deployed Google Apps Script Web App URL:
  const API_BASE = 'https://script.google.com/macros/s/AKfycbxHPfAn6qtczvsNfneGCaTzAxrgWNAxWw19wj34eeReEa9I4r5H2dnRpWFEe1O1Ltl1Zw/exec';

  // Fallback: if API is unreachable, load from local JSON files
  // This lets the site work even offline / during initial setup
  const FALLBACK_PATHS = {
    artworks:   'data/products.json',
    categories: 'data/categories.json',   // we'll generate this
    testimonials: 'data/testimonials.json',
    faqs:       'data/faq.json',
    content:    'data/settings.json',
    blog:       'data/blog.json',
    images:     null  // no local fallback — images auto-derive from artworks
  };

  // Cache duration in milliseconds (default: 5 minutes)
  const CACHE_TTL = 5 * 60 * 1000;

  // ─── STATE ───────────────────────────────────────────────────────────────
  const _cache = {};
  let _loaded = false;
  let _loading = null;  // promise while loading

  // ─── INTERNAL ────────────────────────────────────────────────────────────

  /** Generate categories.json from products.json if it doesn't exist yet */
  function _generateFallbackCategories() {
    const prods = _cache.artworks || [];
    const seen = {};
    const cats = [];
    prods.forEach(p => {
      const key = p.category || '';
      if (key && !seen[key]) {
        seen[key] = true;
        cats.push({
          id: cats.length + 1,
          name: p.cat_clean || key,
          slug: key
        });
      }
    });
    return cats;
  }

  /** Fetch with timeout */
  function _fetchWithTimeout(url, ms = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    return fetch(url, { signal: controller.signal })
      .then(r => {
        clearTimeout(id);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .catch(e => {
        clearTimeout(id);
        throw e;
      });
  }

  /** Read local JSON file (for fallback) */
  function _loadLocal(path) {
    if (!path) return Promise.resolve(null);
    return fetch(path)
      .then(r => r.ok ? r.json() : null)
      .catch(() => null);
  }

  /** Store in sessionStorage with timestamp */
  function _cacheSet(key, data) {
    try {
      sessionStorage.setItem('mitti_cms_' + key, JSON.stringify({
        data: data,
        ts: Date.now()
      }));
    } catch (e) {
      // sessionStorage full or unavailable — skip cache
    }
  }

  /** Retrieve from sessionStorage if fresh */
  function _cacheGet(key) {
    try {
      const raw = sessionStorage.getItem('mitti_cms_' + key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (Date.now() - parsed.ts < CACHE_TTL) {
        return parsed.data;
      }
      sessionStorage.removeItem('mitti_cms_' + key);
    } catch (e) { /* ignore */ }
    return null;
  }

  /** Try API first, then session cache, then local fallback */
  function _fetchWithFallback(action, cacheKey, localPath) {
    // 1. Check session cache
    const cached = _cacheGet(cacheKey || action);
    if (cached) return Promise.resolve(cached);

    // 2. Try API
    return _fetchWithTimeout(API_BASE + '?action=' + action)
      .then(resp => {
        if (resp.success && resp.data) {
          _cacheSet(cacheKey || action, resp.data);
          return resp.data;
        }
        throw new Error('API returned unsuccessful');
      })
      .catch(() => {
        // 3. Fallback to local
        return _loadLocal(localPath)
          .then(localData => {
            if (localData) {
              // If loading products.json, also handle the transform
              if (action === 'artworks') {
                const transformed = _transformLegacyProducts(localData);
                _cacheSet(cacheKey || action, transformed);
                return transformed;
              }
              return localData;
            }
            // 4. Ultimate fallback: empty
            return [];
          });
      });
  }

  /** Transform legacy products.json format to match API format */
  function _transformLegacyProducts(legacy) {
    if (!Array.isArray(legacy)) return [];
    return legacy.map(p => ({
      id: p.id,
      title: p.name,
      slug: p.slug,
      category: p.category,
      cat_clean: p.cat_clean || '',
      price: p.price,
      description: p.description,
      dimensions: p.dimensions || '',
      image: p.image,
      svg: p.svg || '',
      featured: p.featured || false,
      inStock: p.inStock !== false
    }));
  }

  /** Transform legacy settings.json to flat key-value map */
  function _transformLegacySettings(s) {
    if (!s) return {};
    return {
      hero_title: s.site_name + ' — ' + s.tagline,
      hero_subtitle: s.full_tagline || s.description,
      featured_title: 'Featured Artworks',
      gallery_title: 'Our Collection',
      about_title: 'The MITTI Story',
      about_text: s.description,
      about_image: 'about-mitti.jpg',
      contact_email: s.email || '',
      contact_phone: s.phone || '',
      footer_tagline: s.full_tagline || 'From earth, for the wall.',
      footer_credit: '© MITTI Art. All rights reserved.',
      // Pass through social links
      instagram: s.social?.instagram || '',
      facebook: s.social?.facebook || '',
      pinterest: s.social?.pinterest || '',
      // Pass through site info
      site_url: s.url || '',
      founder: s.founder || '',
      currency: s.currency || 'INR'
    };
  }

  // ─── PUBLIC API ─────────────────────────────────────────────────────────

  return {

    /** Is the API URL configured? */
    get isConfigured() {
      return API_BASE && API_BASE !== 'YOUR_DEPLOYED_SCRIPT_URL';
    },

    /** Load all data in parallel */
    loadAll: function() {
      if (_loading) return _loading;
      if (_loaded) return Promise.resolve();

      _loading = Promise.all([
        _fetchWithFallback('artworks', 'artworks', FALLBACK_PATHS.artworks),
        _fetchWithFallback('categories', 'categories', FALLBACK_PATHS.categories),
        _fetchWithFallback('testimonials', 'testimonials', FALLBACK_PATHS.testimonials),
        _fetchWithFallback('faq', 'faqs', FALLBACK_PATHS.faqs),
        _fetchWithFallback('content', 'content', FALLBACK_PATHS.content)
          .then(d => _transformLegacySettings(d)),
        _fetchWithFallback('blog', 'blog', FALLBACK_PATHS.blog),
      ])
      .then(function(results) {
        _cache.artworks   = results[0];
        _cache.categories = results[1] && results[1].length ? results[1] : _generateFallbackCategories();
        _cache.testimonials = results[2] || [];
        _cache.faqs       = results[3] || [];
        _cache.content    = results[4] || {};
        _cache.blog       = results[5] || [];
        _loaded = true;
        _loading = null;
      })
      .catch(function(err) {
        _loading = null;
        console.warn('MITTI CMS: loadAll failed —', err);
        // Even on failure, mark loaded so page still renders with empty data
        _loaded = true;
      });

      return _loading;
    },

    /**
     * Load a single dataset (lighter than loadAll for individual pages)
     * @param {string} action — e.g. 'faq', 'blog', 'testimonials'
     * @param {string} cacheKey — optional different cache key
     * @param {string} localPath — fallback JSON path
     */
    loadOne: function(action, cacheKey, localPath) {
      const path = localPath || FALLBACK_PATHS[action] || null;
      return _fetchWithFallback(action, cacheKey || action, path)
        .then(function(data) {
          if (action === 'content' && Array.isArray(data)) {
            data = _transformLegacySettings({ social: {} });
          } else if (action === 'content' && !data.site_url) {
            data = _transformLegacySettings({ social: {}, ...data });
          }
          _cache[action] = data;
          return data;
        });
    },

    // ─── ACCESSORS ────────────────────────────────────────────────────────

    get artworks()     { return _cache.artworks || []; },
    get categories()   { return _cache.categories || []; },
    get testimonials() { return _cache.testimonials || []; },
    get faqs()         { return _cache.faqs || []; },
    get content()      { return _cache.content || {}; },
    get blog()         { return _cache.blog || []; },

    /** Get featured artworks */
    get featured() {
      return this.artworks.filter(function(a) { return a.featured === true || a.featured === 'TRUE'; });
    },

    /** Get an artwork by slug */
    getBySlug: function(slug) {
      return this.artworks.find(function(a) { return a.slug === slug; }) || null;
    },

    /** Get artworks by category */
    getByCategory: function(cat) {
      return this.artworks.filter(function(a) { return a.category === cat; });
    },

    /** Get a blog post by slug */
    getBlogBySlug: function(slug) {
      return this.blog.find(function(p) { return p.slug === slug; }) || null;
    },

    /** Count artworks per category */
    getCategoryCounts: function() {
      const counts = {};
      this.artworks.forEach(function(a) {
        if (a.category) counts[a.category] = (counts[a.category] || 0) + 1;
      });
      return counts;
    },

    /** Format price in INR */
    formatPrice: function(price) {
      return '₹' + Number(price).toLocaleString('en-IN', { minimumFractionDigits: 0 });
    },

    /** Invalidate cache so next load hits the API */
    clearCache: function() {
      const keys = Object.keys(sessionStorage);
      keys.forEach(function(k) {
        if (k.startsWith('mitti_cms_')) sessionStorage.removeItem(k);
      });
      _loaded = false;
      _loading = null;
    }
  };
})();
