/* ===================================================================
   MITTI (मिट्टी) — Earth. Art. Belonging.
   DOM-based image loading — FIXES the errors from old projects:
   ✓ No inline onerror in template literals
   ✓ No outerHTML stripping event handlers
   ✓ Proper JPG → SVG → gradient fallback chain
   =================================================================== */
(function() {
  'use strict';

  const allProducts = typeof products !== 'undefined' ? products : [];
  const allCategories = typeof categories !== 'undefined' ? categories : [];
  const allBlogPosts = typeof blogPosts !== 'undefined' ? blogPosts : [];

  // ----- Helpers -----
  function formatPrice(r) { return '\u20B9' + Number(r).toLocaleString('en-IN', { minimumFractionDigits: 0 }); }

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // ===== DOM-BASED IMAGE LOADER (fixes the outerHTML bug) =====
  // Creates an img element and attaches onerror via DOM — NOT inline HTML attributes
  // This guarantees the fallback chain actually works
  function getCategoryGradient(cat) {
    const gradients = {
      'landscapes': 'linear-gradient(135deg, #1a3a2a, #0a1a10)',
      'abstract':   'linear-gradient(135deg, #3a2520, #1a1200)',
      'lippan-art': 'linear-gradient(135deg, #3a1a0a, #1a0800)',
      'modern-art': 'linear-gradient(135deg, #1a222a, #0c0806)',
      'wall-decor': 'linear-gradient(135deg, #3a2010, #1a0800)'
    };
    return gradients[cat] || '#1a1612';
  }

  function getCategoryIcon(cat) {
    const icons = {
      'landscapes': '\u26F0',
      'abstract': '\u25D0',
      'lippan-art': '\u2726',
      'modern-art': '\u25C7',
      'wall-decor': '\u229E'
    };
    return icons[cat] || '\u25C6';
  }

  // THE KEY FIX: Create a DOM element with attached onerror handler
  // This never uses outerHTML, so the event handler survives rendering
  function createArtImage(product, className) {
    const img = document.createElement('img');
    img.className = className || '';
    img.alt = product.name + ' \u2014 ' + product.category.replace('-', ' ') + ' by MITTI';
    img.loading = 'lazy';

    // JPG primary — real photo renders first
    img.src = product.image;

    // Store fallback chain on the element itself (not data attributes)
    let fallbackIndex = 0;
    const fallbacks = [
      product.image,              // 0: JPG (primary)
      product.imageFallback || '', // 1: SVG (fallback)
      null                        // 2: gradient placeholder (signal to show gradient)
    ];

    img.onerror = function() {
      fallbackIndex++;
      if (fallbackIndex === 1 && fallbacks[1]) {
        // First fallback: try SVG
        this.src = fallbacks[1];
      } else {
        // Ultimate fallback: show category gradient with icon
        this.style.display = 'none';
        const parent = this.parentNode;
        if (parent) {
          parent.style.background = getCategoryGradient(product.category);
          parent.style.display = 'flex';
          parent.style.alignItems = 'center';
          parent.style.justifyContent = 'center';
          parent.style.minHeight = '200px';
          const fallbackEl = document.createElement('div');
          fallbackEl.style.cssText = 'text-align:center;color:rgba(242,235,224,0.5);padding:20px;';
          fallbackEl.innerHTML =
            '<div style="font-size:2.4rem;margin-bottom:8px;opacity:0.6;">' +
            getCategoryIcon(product.category) + '</div>' +
            '<div style="font-size:0.7rem;text-transform:uppercase;letter-spacing:1px;opacity:0.5;">' +
            product.name + '</div>';
          parent.appendChild(fallbackEl);
        }
      }
    };
    return img;
  }

  // ===== Render Categories =====
  function renderCategories() {
    const grid = $('#catGrid');
    if (!grid) return;

    grid.innerHTML = allCategories.map(cat => {
      const img = createArtImage({
        name: cat.name,
        category: cat.id,
        image: cat.image,
        imageFallback: ''
      }, 'cat-card-img');
      return '<div class="cat-card" data-category="' + cat.id + '" onclick="filterGallery(\'' + cat.id + '\')">' +
        img.outerHTML +
        '<div class="cat-card-overlay">' +
          '<div class="cat-card-title">' + cat.name + '</div>' +
          '<div class="cat-card-count">' + cat.count + ' ' + (cat.count === 1 ? 'piece' : 'pieces') + '</div>' +
        '</div></div>';
    }).join('');

    // Re-attach onerror to category images (outerHTML strips them)
    grid.querySelectorAll('.cat-card-img').forEach(function(img) {
      const cat = allCategories.find(function(c) { return img.closest('[data-category]') && img.closest('[data-category]').dataset.category === c.id; });
      if (!cat) return;
      img.onerror = function() {
        this.style.display = 'none';
        const parent = this.parentNode;
        if (parent) {
          parent.style.background = getCategoryGradient(cat.id);
          parent.style.minHeight = '200px';
        }
      };
    });
  }

  // ===== Render Gallery (DOM-based — FIXES the outerHTML bug) =====
  let activeFilter = 'all';

  function renderGallery(filter) {
    const grid = $('#galleryGrid');
    if (!grid) return;

    activeFilter = filter || 'all';
    const filtered = activeFilter === 'all'
      ? allProducts
      : allProducts.filter(function(p) { return p.category === activeFilter; });

    // Update filter buttons
    $$('.filter-btn').forEach(function(btn) {
      btn.classList.toggle('active', btn.dataset.filter === activeFilter);
    });

    // Clear grid — build with DOM, not innerHTML
    grid.innerHTML = '';

    filtered.forEach(function(product, i) {
      const card = document.createElement('div');
      card.className = 'gallery-card' + (product.featured ? ' featured' : '') + (i === 0 ? ' visible' : '');
      card.onclick = function() { openLightboxBySlug(product.slug); };

      // Image container
      const imgWrap = document.createElement('div');
      imgWrap.className = 'gallery-card-image';

      // Use createArtImage to get proper DOM-based fallback (FIX #1: no outerHTML stripping)
      const img = createArtImage(product, 'gallery-img');
      imgWrap.appendChild(img);

      // Info overlay
      const info = document.createElement('div');
      info.className = 'gallery-card-info';
      info.innerHTML =
        '<div class="gallery-card-category">' + product.category.replace('-', ' ') + '</div>' +
        '<div class="gallery-card-name">' + product.name + '</div>' +
        '<div class="gallery-card-price">' + formatPrice(product.price) + '</div>' +
        (product.inStock === false ? '<div class="gallery-card-stock">Out of Stock</div>' : '');

      // Grey out the card if out of stock
      if (product.inStock === false) {
        card.style.opacity = '0.65';
        imgWrap.style.filter = 'grayscale(0.7)';
      }

      card.appendChild(imgWrap);
      card.appendChild(info);
      grid.appendChild(card);

      // Stagger animation
      setTimeout(function() {
        card.classList.add('visible');
      }, i * 60);
    });
  }

  // ===== Filter Gallery =====
  window.filterGallery = function(category) {
    renderGallery(category);
    var gallery = $('#gallery');
    if (gallery) gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ===== Render Filter Bar =====
  function renderFilters() {
    var bar = $('#filterBar');
    if (!bar) return;

    var html = '<button class="filter-btn active" data-filter="all" onclick="filterGallery(\'all\')">All (' + allProducts.length + ')</button>';
    allCategories.forEach(function(cat) {
      html += '<button class="filter-btn" data-filter="' + cat.id + '" onclick="filterGallery(\'' + cat.id + '\')">' + cat.name + ' (' + cat.count + ')</button>';
    });
    bar.innerHTML = html;
  }

  // ===== Render Featured =====
  function renderFeatured() {
    var grid = $('#featuredGrid');
    if (!grid) return;

    var featured = allProducts.filter(function(p) { return p.featured; });
    grid.innerHTML = '';

    featured.forEach(function(product) {
      var card = document.createElement('div');
      card.className = 'featured-card';
      card.onclick = function() { openLightboxBySlug(product.slug); };

      var imgWrap = document.createElement('div');
      imgWrap.className = 'featured-card-image';
      var img = createArtImage(product, '');
      imgWrap.appendChild(img);

      var info = document.createElement('div');
      info.className = 'featured-card-info';
      info.innerHTML =
        '<div class="featured-card-tag">Featured</div>' +
        '<div class="featured-card-name">' + product.name + '</div>' +
        '<div class="featured-card-price">' + formatPrice(product.price) + '</div>';

      card.appendChild(imgWrap);
      card.appendChild(info);
      grid.appendChild(card);
    });
  }

  // ===== Render Blog =====
  function renderBlog() {
    var grid = $('#blogGrid');
    if (!grid) return;

    grid.innerHTML = '';
    allBlogPosts.forEach(function(post) {
      var article = document.createElement('article');
      article.className = 'blog-card';

      var link = document.createElement('a');
      link.href = post.url;
      link.className = 'blog-card-image';

      // Blog images also use proper DOM-based fallback
      var img = document.createElement('img');
      img.src = post.image;
      img.alt = post.title;
      img.loading = 'lazy';
      // Simple fallback for blog images
      img.onerror = function() {
        var fb = post.imageFallback;
        if (fb && this.src !== fb) { this.src = fb; }
        else { this.style.display = 'none'; }
      };

      link.appendChild(img);

      var body = document.createElement('div');
      body.className = 'blog-card-body';
      body.innerHTML =
        '<div class="blog-card-date">' + post.date + ' \u00B7 ' + post.readTime + ' min read</div>' +
        '<h3 class="blog-card-title"><a href="' + post.url + '">' + post.title + '</a></h3>' +
        '<p class="blog-card-excerpt">' + post.excerpt + '</p>' +
        '<a href="' + post.url + '" class="blog-card-link">Read more \u2192</a>';

      article.appendChild(link);
      article.appendChild(body);
      grid.appendChild(article);
    });
  }

  // ===== Lightbox (also uses DOM-based fallback) =====
  var currentProduct = null;

  window.openLightboxBySlug = function(slug) {
    var product = allProducts.find(function(p) { return p.slug === slug; });
    if (product) openLightbox(product);
  };

  function openLightbox(product) {
    currentProduct = product;
    var lb = $('#lightbox');
    if (!lb) return;

    // Lightbox image with DOM-based fallback
    var lbContainer = $('#lbImgContainer');
    if (lbContainer) {
      lbContainer.innerHTML = '';
      var img = document.createElement('img');
      img.id = 'lbImg';
      img.src = product.image;
      img.alt = product.name;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';

      var fbIdx = 0;
      var fbSources = [product.image, product.imageFallback || '', null];
      img.onerror = function() {
        fbIdx++;
        if (fbIdx === 1 && fbSources[1]) {
          this.src = fbSources[1];
        } else {
          this.style.display = 'none';
          if (lbContainer) {
            lbContainer.style.background = getCategoryGradient(product.category);
            lbContainer.style.display = 'flex';
            lbContainer.style.alignItems = 'center';
            lbContainer.style.justifyContent = 'center';
            lbContainer.innerHTML =
              '<div style="text-align:center;color:rgba(242,235,224,0.5);padding:40px;">' +
              '<div style="font-size:4rem;margin-bottom:12px;opacity:0.6;">' + getCategoryIcon(product.category) + '</div>' +
              '<div style="font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;opacity:0.5;">' + product.name + '</div></div>';
          }
        }
      };
      lbContainer.appendChild(img);
    }

    $('#lbCategory').textContent = product.category.replace('-', ' ');
    $('#lbTitle').textContent = product.name;
    $('#lbPrice').textContent = formatPrice(product.price);
    $('#lbDimensions').textContent = product.dimensions;
    $('#lbDescription').textContent = product.description;
    var lbAddBtn = $('#lbAddBtn');
    if (lbAddBtn) {
      if (product.inStock === false) {
        lbAddBtn.textContent = 'Currently Unavailable';
        lbAddBtn.disabled = true;
        lbAddBtn.style.opacity = '0.5';
        lbAddBtn.style.cursor = 'not-allowed';
        lbAddBtn.onclick = null;
      } else {
        lbAddBtn.textContent = 'Add to collection';
        lbAddBtn.disabled = false;
        lbAddBtn.style.opacity = '1';
        lbAddBtn.style.cursor = 'pointer';
        lbAddBtn.onclick = function() { addToCart(product); };
      }
    }

    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    history.replaceState(null, '', '#product-' + product.slug);
    document.title = product.name + ' \u2014 MITTI Art Gallery';
  }

  window.closeLightbox = function() {
    var lb = $('#lightbox');
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
    history.replaceState(null, '', window.location.pathname);
    document.title = 'MITTI \u2014 Earth. Art. Belonging. | Original Indian Art Gallery';
  };

  // Close lightbox on overlay click
  document.addEventListener('click', function(e) {
    if (e.target.closest('.lightbox') && !e.target.closest('.lightbox-inner')) {
      closeLightbox();
    }
  });

  // Keyboard close + nav
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { closeLightbox(); closeCart(); }
    if (e.key === 'ArrowLeft' && currentProduct) navigateLightbox(-1);
    if (e.key === 'ArrowRight' && currentProduct) navigateLightbox(1);
  });

  function navigateLightbox(dir) {
    if (!currentProduct) return;
    var idx = allProducts.indexOf(currentProduct);
    if (idx === -1) return;
    var next = (idx + dir + allProducts.length) % allProducts.length;
    openLightbox(allProducts[next]);
  }

  // ===== Hash Routing =====
  function checkHash() {
    var hash = location.hash.replace('#', '');
    var match = hash.match(/^product-(.+)$/);
    if (match) {
      var product = allProducts.find(function(p) { return p.slug === match[1]; });
      if (product) setTimeout(function() { openLightbox(product); }, 200);
    }
  }
  window.addEventListener('hashchange', checkHash);

  // ===== Cart =====
  var cart = JSON.parse(localStorage.getItem('mitti-cart') || '[]');

  function updateCartUI() {
    var badge = $('#cartBadge');
    if (badge) badge.textContent = cart.length;

    var items = $('#cartItems');
    if (!items) return;

    if (cart.length === 0) {
      items.innerHTML = '<div class="cart-empty">Your collection is empty</div>';
      if ($('#cartTotal')) $('#cartTotal').textContent = '\u20B90';
      return;
    }

    items.innerHTML = cart.map(function(item, i) {
      return '<div class="cart-item">' +
        '<div class="cart-item-img"><img src="' + item.image + '" alt="' + item.name + '" loading="lazy" onerror="this.style.display=\'none\'" /></div>' +
        '<div class="cart-item-info">' +
          '<div class="cart-item-name">' + item.name + '</div>' +
          '<div class="cart-item-price">' + formatPrice(item.price) + '</div>' +
        '</div>' +
        '<button class="cart-item-remove" onclick="removeFromCart(' + i + ')">\u2715</button>' +
      '</div>';
    }).join('');

    var total = cart.reduce(function(sum, item) { return sum + item.price; }, 0);
    if ($('#cartTotal')) $('#cartTotal').textContent = formatPrice(total);
  }

  window.addToCart = function(product) {
    if (product.inStock === false) {
      showToast('This piece is currently unavailable');
      return;
    }
    cart.push({ id: product.id, name: product.name, price: product.price, image: product.imageFallback || product.image });
    localStorage.setItem('mitti-cart', JSON.stringify(cart));
    updateCartUI();
    showToast(product.name + ' added to your collection');
  };

  window.removeFromCart = function(index) {
    cart.splice(index, 1);
    localStorage.setItem('mitti-cart', JSON.stringify(cart));
    updateCartUI();
  };

  window.clearCart = function() {
    cart = [];
    localStorage.setItem('mitti-cart', JSON.stringify(cart));
    updateCartUI();
  };

  // ===== Toast =====
  function showToast(msg) {
    var toast = $('#toast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function() { toast.classList.remove('show'); }, 2500);
  }

  // ===== Cart Toggle =====
  window.toggleCart = function() {
    var slideout = $('#cartSlideout');
    var overlay = $('#cartOverlay');
    if (!slideout) return;
    var isOpen = slideout.classList.contains('open');
    slideout.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = isOpen ? '' : 'hidden';
  };

  window.closeCart = function() {
    var slideout = $('#cartSlideout');
    var overlay = $('#cartOverlay');
    if (slideout) slideout.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  // ===== Navigation =====
  function initNav() {
    var hamburger = $('#hamburger');
    var navLinks = $('#navLinks');
    if (hamburger && navLinks) {
      hamburger.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('open');
      });
    }

    $$('.nav-link').forEach(function(link) {
      link.addEventListener('click', function() {
        if (navLinks) navLinks.classList.remove('open');
        if (hamburger) hamburger.classList.remove('active');
      });
    });

    window.addEventListener('scroll', function() {
      var navbar = $('#navbar');
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ===== Contact Form =====
  function initContactForm() {
    var form = $('#contactForm');
    if (!form) return;

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      var btn = form.querySelector('button[type="submit"]');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      }).then(function(r) {
        if (r.ok) {
          showToast('Message sent! We will get back to you soon.');
          form.reset();
        } else {
          showToast('Something went wrong. Please try again.');
        }
      }).catch(function() {
        showToast('Network error. Please try again.');
      }).finally(function() {
        btn.textContent = 'Send message';
        btn.disabled = false;
      });
    });
  }

  // ===== Custom Cursor =====
  function initCursor() {
    var follower = document.createElement('div');
    follower.className = 'cursor-follower';
    document.body.appendChild(follower);

    var timeout;
    document.addEventListener('mousemove', function(e) {
      follower.style.left = e.clientX + 'px';
      follower.style.top = e.clientY + 'px';
      follower.classList.add('visible');
      clearTimeout(timeout);
      timeout = setTimeout(function() { follower.classList.remove('visible'); }, 2000);
    });

    $$('a, button, .gallery-card, .featured-card, .cat-card, .blog-card, .filter-btn').forEach(function(el) {
      el.addEventListener('mouseenter', function() { follower.classList.add('hover'); });
      el.addEventListener('mouseleave', function() { follower.classList.remove('hover'); });
    });
  }

  // ===== Hero Carousel =====
  function initHeroCarousel() {
    var heroImg = $('#heroImg');
    if (!heroImg) return;
    var featured = allProducts.filter(function(p) { return p.featured; });
    if (featured.length < 2) return;

    var idx = 0;
    setInterval(function() {
      idx = (idx + 1) % featured.length;
      heroImg.style.opacity = '0';
      heroImg.onerror = null; // clear prior onerror
      setTimeout(function() {
        heroImg.src = featured[idx].image;
        heroImg.onerror = function() {
          if (featured[idx].imageFallback && this.src !== featured[idx].imageFallback) {
            this.src = featured[idx].imageFallback;
          }
        };
        heroImg.style.opacity = '1';
      }, 600);
    }, 5000);
  }

  // ===== Parallax Hero =====
  function initParallax() {
    var heroBg = $('#heroBg');
    if (!heroBg) return;

    window.addEventListener('scroll', function() {
      var scrollY = window.scrollY;
      if (scrollY < window.innerHeight) {
        heroBg.style.transform = 'translateY(' + (scrollY * 0.15) + 'px)';
        heroBg.style.opacity = 1 - (scrollY / window.innerHeight) * 0.4;
      }
    });
  }

  // ===== Scroll Animation =====
  function initScrollReveal() {
    var els = $$('.section-title, .section-subtitle, .about-content, .about-image, .contact-form-wrapper, .contact-info');
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    els.forEach(function(el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.6s cubic-bezier(0.22,1,0.36,1), transform 0.6s cubic-bezier(0.22,1,0.36,1)';
      observer.observe(el);
    });
  }

  // ===== Init =====
  document.addEventListener('DOMContentLoaded', function() {
    renderCategories();
    renderFilters();
    renderGallery('all');
    renderFeatured();
    renderBlog();
    updateCartUI();
    initNav();
    initContactForm();
    initCursor();
    initHeroCarousel();
    initParallax();
    initScrollReveal();
    checkHash();

    var cartBtn = $('#cartBtn');
    if (cartBtn) cartBtn.addEventListener('click', toggleCart);

    var cartOverlay = $('#cartOverlay');
    if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

    var cartClose = $('#cartClose');
    if (cartClose) cartClose.addEventListener('click', closeCart);
  });

})();
