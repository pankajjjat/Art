/**
 * MITTI CMS — Dynamic Render Engine
 * ===================================
 * Reads data from MITTI_API and renders all site sections.
 * Replaces all hardcoded product/blog data with live CMS content.
 *
 * ORDER: load api.js → cms.js → then init on DOMContentLoaded
 */

const MITTI_CMS = (function() {
  'use strict';

  // ─── HELPERS ─────────────────────────────────────────────────────────────
  const $  = function(s) { return document.querySelector(s); };
  const $$ = function(s) { return document.querySelectorAll(s); };
  const API = MITTI_API;

  // Category gradient palettes (same as before)
  const GRADIENTS = {
    'landscapes': 'linear-gradient(135deg, #1a3a2a, #0a1a10)',
    'abstract':   'linear-gradient(135deg, #3a2520, #1a1200)',
    'lippan-art': 'linear-gradient(135deg, #3a1a0a, #1a0800)',
    'modern-art': 'linear-gradient(135deg, #1a222a, #0c0806)',
    'wall-decor': 'linear-gradient(135deg, #3a2010, #1a0800)'
  };
  function getGradient(cat) { return GRADIENTS[cat] || '#1a1612'; }

  const ICONS = {
    'landscapes': '🏰',
    'abstract': '◐',
    'lippan-art': '✦',
    'modern-art': '◇',
    'wall-decor': '⊞'
  };
  function getIcon(cat) { return ICONS[cat] || '◆'; }

  // ─── DOM IMAGE CREATOR (from original — no outerHTML bug) ──────────────
  function createArtImage(item, className) {
    const img = document.createElement('img');
    img.className = className || '';
    img.alt = (item.title || item.name) + ' — ' + (item.cat_clean || item.category || '') + ' by MITTI';
    img.loading = 'lazy';

    // Image path resolution
    const basePath = 'images/optimized/';
    const svgPath  = 'images/svg/';
    const imgSrc = item.image
      ? (item.image.startsWith('http') ? item.image : basePath + item.image)
      : (item.image_url || '');
    const svgSrc = item.svg
      ? (item.svg.startsWith('http') ? item.svg : svgPath + item.svg)
      : '';

    img.src = imgSrc;

    let fallbackIdx = 0;
    const fallbacks = [imgSrc, svgSrc, null];

    img.onerror = function() {
      fallbackIdx++;
      if (fallbackIdx === 1 && fallbacks[1]) {
        this.src = fallbacks[1];
      } else {
        this.style.display = 'none';
        const parent = this.parentNode;
        if (parent) {
          parent.style.background = getGradient(item.category);
          parent.style.display = 'flex';
          parent.style.alignItems = 'center';
          parent.style.justifyContent = 'center';
          parent.style.minHeight = '200px';
          const fallbackEl = document.createElement('div');
          fallbackEl.style.cssText = 'text-align:center;color:rgba(242,235,224,0.5);padding:20px;';
          fallbackEl.innerHTML =
            '<div style="font-size:2.4rem;margin-bottom:8px;opacity:0.6;">' +
            getIcon(item.category) + '</div>' +
            '<div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;opacity:0.5;">' +
            (item.title || item.name) + '</div>';
          parent.appendChild(fallbackEl);
        }
      }
    };
    return img;
  }

  // ─── SEO UPDATER ────────────────────────────────────────────────────────
  function updateSEO(title, description, image, url) {
    const siteUrl = API.content.site_url || window.location.origin;

    document.title = title || 'MITTI — Earth. Art. Belonging.';

    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = description || '';

    // OG
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title || '';

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = description || '';

    const ogURL = document.querySelector('meta[property="og:url"]');
    if (ogURL) ogURL.content = url || window.location.href;

    if (image) {
      const ogImg = document.querySelector('meta[property="og:image"]');
      if (ogImg) ogImg.content = image;
    }

    // Twitter
    const twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.content = title || '';

    const twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.content = description || '';

    if (image) {
      const twImg = document.querySelector('meta[name="twitter:image"]');
      if (twImg) twImg.content = image;
    }

    // Canonical
    const canon = document.querySelector('link[rel="canonical"]');
    if (canon) canon.href = url || window.location.href;
  }

  // ─── JSON-LD UPDATER ────────────────────────────────────────────────────
  function updateJSONLD(data, type) {
    const container = document.getElementById('ldJson') || document.createElement('script');
    if (!container.id) {
      container.id = 'ldJson';
      container.type = 'application/ld+json';
      document.head.appendChild(container);
    }
    container.textContent = JSON.stringify(data);
  }

  // ─── HERO ────────────────────────────────────────────────────────────────
  function renderHero() {
    const heroTitle = $('#heroTitle');
    const heroSub = $('#heroSubtitle');
    if (heroTitle) heroTitle.textContent = API.content.hero_title || 'Handcrafted Indian Art';
    if (heroSub) heroSub.textContent = API.content.hero_subtitle || '';
  }

  // ─── CATEGORY CARDS ──────────────────────────────────────────────────────
  function renderCategories() {
    const grid = $('#catGrid');
    if (!grid) return;

    const cats = API.categories;
    const counts = API.getCategoryCounts();

    grid.innerHTML = '';

    cats.forEach(function(cat) {
      const card = document.createElement('div');
      card.className = 'cat-card';
      card.dataset.category = cat.slug;
      card.onclick = function() {
        if (typeof filterGallery === 'function') {
          filterGallery(cat.slug);
          const gallery = $('#gallery');
          if (gallery) gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      };

      const imgWrap = document.createElement('div');
      imgWrap.className = 'cat-card-image';

      // Try to use a product image from this category
      const catProduct = API.getByCategory(cat.slug)[0];
      if (catProduct) {
        const img = createArtImage(catProduct, 'cat-card-img');
        imgWrap.appendChild(img);
      } else {
        imgWrap.style.background = getGradient(cat.slug);
        imgWrap.style.minHeight = '200px';
      }

      const overlay = document.createElement('div');
      overlay.className = 'cat-card-overlay';
      overlay.innerHTML =
        '<div class="cat-card-title">' + (cat.name || cat.slug) + '</div>' +
        '<div class="cat-card-count">' + (counts[cat.slug] || 0) + ' pieces</div>';

      card.appendChild(imgWrap);
      card.appendChild(overlay);
      grid.appendChild(card);
    });
  }

  // ─── GALLERY ─────────────────────────────────────────────────────────────
  let activeFilter = 'all';

  function renderGallery(filter) {
    const grid = $('#galleryGrid');
    if (!grid) return;

    activeFilter = filter || 'all';
    const filtered = activeFilter === 'all'
      ? API.artworks
      : API.getByCategory(activeFilter);

    // Update filter buttons
    $$('.filter-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.filter === activeFilter);
    });

    grid.innerHTML = '';

    filtered.forEach(function(product, i) {
      const card = document.createElement('div');
      card.className = 'gallery-card' + (product.featured ? ' featured' : '');
      card.onclick = function() {
        if (typeof openLightboxBySlug === 'function') {
          openLightboxBySlug(product.slug);
        }
      };

      const imgWrap = document.createElement('div');
      imgWrap.className = 'gallery-card-image';
      const img = createArtImage(product, 'gallery-img');
      imgWrap.appendChild(img);

      const info = document.createElement('div');
      info.className = 'gallery-card-info';
      info.innerHTML =
        '<div class="gallery-card-category">' + (product.cat_clean || product.category || '').replace('-', ' ') + '</div>' +
        '<div class="gallery-card-name">' + (product.title || product.name) + '</div>' +
        '<div class="gallery-card-price">' + API.formatPrice(product.price) + '</div>';

      card.appendChild(imgWrap);
      card.appendChild(info);
      grid.appendChild(card);

      // Stagger animation
      setTimeout(function() {
        card.classList.add('visible');
      }, i * 60);
    });
  }

  window.filterGallery = function(category) {
    renderGallery(category);
  };

  // ─── FILTER BAR ──────────────────────────────────────────────────────────
  function renderFilters() {
    const bar = $('#filterBar');
    if (!bar) return;

    const counts = API.getCategoryCounts();
    const total = API.artworks.length;

    let html = '<button class="filter-btn active" data-filter="all" onclick="filterGallery(\'all\')">All (' + total + ')</button>';

    API.categories.forEach(function(cat) {
      const c = counts[cat.slug] || 0;
      if (c > 0) {
        html += '<button class="filter-btn" data-filter="' + cat.slug + '" onclick="filterGallery(\'' + cat.slug + '\')">' + (cat.name || cat.slug) + ' (' + c + ')</button>';
      }
    });

    bar.innerHTML = html;
  }

  // ─── FEATURED ────────────────────────────────────────────────────────────
  function renderFeatured() {
    const grid = $('#featuredGrid');
    if (!grid) return;

    const featuredArtworks = API.featured;
    grid.innerHTML = '';

    featuredArtworks.forEach(function(product) {
      const card = document.createElement('div');
      card.className = 'featured-card';
      card.onclick = function() {
        if (typeof openLightboxBySlug === 'function') {
          openLightboxBySlug(product.slug);
        }
      };

      const imgWrap = document.createElement('div');
      imgWrap.className = 'featured-card-image';
      const img = createArtImage(product, '');
      imgWrap.appendChild(img);

      const info = document.createElement('div');
      info.className = 'featured-card-info';
      info.innerHTML =
        '<div class="featured-card-tag">Featured</div>' +
        '<div class="featured-card-name">' + (product.title || product.name) + '</div>' +
        '<div class="featured-card-price">' + API.formatPrice(product.price) + '</div>';

      card.appendChild(imgWrap);
      card.appendChild(info);
      grid.appendChild(card);
    });
  }

  // ─── BLOG ────────────────────────────────────────────────────────────────
  function renderBlog() {
    const grid = $('#blogGrid');
    if (!grid) return;

    const posts = API.blog;
    grid.innerHTML = '';

    posts.forEach(function(post) {
      const article = document.createElement('article');
      article.className = 'blog-card';

      const link = document.createElement('a');
      link.href = '/blog/' + post.slug + '/';
      link.className = 'blog-card-image';

      const img = document.createElement('img');
      img.src = post.image ? 'images/optimized/' + post.image : (post.image_url || '');
      img.alt = post.title;
      img.loading = 'lazy';
      img.onerror = function() {
        const fb = post.svg ? 'images/svg/' + post.svg : null;
        if (fb && this.src !== fb) { this.src = fb; }
        else { this.style.display = 'none'; }
      };
      link.appendChild(img);

      const body = document.createElement('div');
      body.className = 'blog-card-body';
      body.innerHTML =
        '<div class="blog-card-date">' + (post.date || '') + ' · ' + (post.readTime || '') + ' min read</div>' +
        '<h3 class="blog-card-title"><a href="/blog/' + post.slug + '/">' + post.title + '</a></h3>' +
        '<p class="blog-card-excerpt">' + (post.excerpt || '') + '</p>' +
        '<a href="/blog/' + post.slug + '/" class="blog-card-link">Read more →</a>';

      article.appendChild(link);
      article.appendChild(body);
      grid.appendChild(article);
    });
  }

  // ─── FAQ (accordion) ────────────────────────────────────────────────────
  function renderFAQ() {
    const container = $('#faqContainer');
    if (!container) return;

    const faqs = API.faqs;
    container.innerHTML = '';

    faqs.forEach(function(item, i) {
      const div = document.createElement('div');
      div.className = 'faq-item';

      const q = document.createElement('div');
      q.className = 'faq-question';
      q.innerHTML = '<span>' + (item.question || '') + '</span><span class="faq-icon">+</span>';
      q.onclick = function() {
        const isOpen = div.classList.contains('open');
        // Close all
        container.querySelectorAll('.faq-item.open').forEach(function(el) { el.classList.remove('open'); });
        if (!isOpen) div.classList.add('open');
      };

      const a = document.createElement('div');
      a.className = 'faq-answer';
      a.textContent = item.answer || '';

      div.appendChild(q);
      div.appendChild(a);
      container.appendChild(div);
    });
  }

  // ─── TESTIMONIALS ────────────────────────────────────────────────────────
  function renderTestimonials() {
    const container = $('#testimonialContainer');
    if (!container) return;

    const reviews = API.testimonials;
    container.innerHTML = '';

    reviews.forEach(function(t) {
      const div = document.createElement('div');
      div.className = 'testimonial-card';

      const stars = '★'.repeat(Number(t.rating) || 5) + '☆'.repeat(5 - Math.min(Number(t.rating) || 5, 5));

      div.innerHTML =
        '<div class="testimonial-stars">' + stars + '</div>' +
        '<p class="testimonial-text">"' + (t.review || '') + '"</p>' +
        '<div class="testimonial-author">— ' + (t.name || '') + '</div>';

      container.appendChild(div);
    });
  }

  // ─── HERO CAROUSEL (dynamic from featured) ──────────────────────────────
  function initHeroCarousel() {
    const heroImg = $('#heroImg');
    if (!heroImg) return;
    const featuredArtworks = API.featured;
    if (featuredArtworks.length < 2) return;

    let idx = 0;
    setInterval(function() {
      idx = (idx + 1) % featuredArtworks.length;
      heroImg.style.opacity = '0';
      heroImg.onerror = null;
      setTimeout(function() {
        const item = featuredArtworks[idx];
        heroImg.src = 'images/optimized/' + item.image;
        heroImg.onerror = function() {
          if (item.svg && this.src !== 'images/svg/' + item.svg) {
            this.src = 'images/svg/' + item.svg;
          }
        };
        heroImg.style.opacity = '1';
      }, 600);
    }, 5000);
  }

  // ─── MAIN INIT ──────────────────────────────────────────────────────────
  function init() {
    renderHero();
    renderCategories();
    renderFilters();
    renderGallery('all');
    renderFeatured();
    renderBlog();
    renderFAQ();
    renderTestimonials();
    initHeroCarousel();

    // Update SEO with content from API
    const siteUrl = API.content.site_url || window.location.origin;
    const pageTitle = API.content.hero_title
      ? API.content.hero_title + ' | MITTI Art Gallery'
      : 'MITTI — Earth. Art. Belonging. | Original Indian Art Gallery';
    const pageDesc = API.content.hero_subtitle || 'Handcrafted Indian paintings, lippan art, and wall decor. From earth, for the wall.';
    updateSEO(pageTitle, pageDesc, siteUrl + '/images/optimized/og-image.jpg', siteUrl + '/');

    // Build JSON-LD dynamically
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'ArtGallery',
      name: 'MITTI Art Gallery',
      description: pageDesc,
      url: siteUrl + '/',
      founder: { '@type': 'Person', name: API.content.founder || 'Saumya' },
      foundingDate: '2024'
    };
    updateJSONLD(ld);
  }

  // ─── PUBLIC API ─────────────────────────────────────────────────────────
  return {
    init: init,
    renderGallery: renderGallery,
    renderCategories: renderCategories,
    renderFeatured: renderFeatured,
    renderBlog: renderBlog,
    renderFAQ: renderFAQ,
    renderTestimonials: renderTestimonials,
    updateSEO: updateSEO,
    updateJSONLD: updateJSONLD
  };
})();
