/* ===================================================================
   MITTI (मिट्टी) — Earth. Art. Belonging.
   UI Layer — lightbox, cart, navigation, cursor, effects.
   Data comes from MITTI_API (Google Sheets CMS).
   CMS rendering from MITTI_CMS.
   =================================================================== */
(function() {
  'use strict';

  // ----- Helpers -----
  function formatPrice(r) { return '₹' + Number(r).toLocaleString('en-IN', { minimumFractionDigits: 0 }); }

  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // ===== DOM-BASED IMAGE LOADER (kept from original — no outerHTML bug) =====
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

  function createArtImage(product, className) {
    const img = document.createElement('img');
    img.className = className || '';
    img.alt = (product.title || product.name) + ' — ' + (product.cat_clean || product.category || '').replace('-', ' ') + ' by MITTI';
    img.loading = 'lazy';

    const imgSrc = product.image
      ? (product.image.startsWith('http') ? product.image : 'images/optimized/' + product.image)
      : '';
    const svgSrc = product.svg
      ? (product.svg.startsWith('http') ? product.svg : 'images/svg/' + product.svg)
      : '';

    img.src = imgSrc;

    let fallbackIndex = 0;
    const fallbacks = [imgSrc, svgSrc, null];

    img.onerror = function() {
      fallbackIndex++;
      if (fallbackIndex === 1 && fallbacks[1]) {
        this.src = fallbacks[1];
      } else {
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
            (product.title || product.name) + '</div>';
          parent.appendChild(fallbackEl);
        }
      }
    };
    return img;
  }

  // ===== Lightbox =====
  var currentProduct = null;

  window.openLightboxBySlug = function(slug) {
    var product = MITTI_API.getBySlug(slug);
    if (product) openLightbox(product);
  };

  function openLightbox(product) {
    currentProduct = product;
    var lb = $('#lightbox');
    if (!lb) return;

    var lbContainer = $('#lbImgContainer');
    if (lbContainer) {
      lbContainer.innerHTML = '';
      var img = document.createElement('img');
      img.id = 'lbImg';

      var imgSrc = product.image
        ? (product.image.startsWith('http') ? product.image : 'images/optimized/' + product.image)
        : '';
      var svgSrc = product.svg
        ? (product.svg.startsWith('http') ? product.svg : 'images/svg/' + product.svg)
        : '';

      img.src = imgSrc;
      img.alt = product.title || product.name;
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';

      var fbIdx = 0;
      var fbSources = [imgSrc, svgSrc, null];
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
              '<div style="font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;opacity:0.5;">' + (product.title || product.name) + '</div></div>';
          }
        }
      };
      lbContainer.appendChild(img);
    }

    $('#lbCategory').textContent = (product.cat_clean || product.category || '').replace('-', ' ');
    $('#lbTitle').textContent = product.title || product.name;
    $('#lbPrice').textContent = formatPrice(product.price);
    $('#lbDimensions').textContent = product.dimensions || '';
    $('#lbDescription').textContent = product.description || '';

    var lbAddBtn = $('#lbAddBtn');
    if (lbAddBtn) {
      if (product.inStock === false || product.inStock === 'FALSE') {
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
    document.title = (product.title || product.name) + ' — MITTI Art Gallery';
  }

  window.closeLightbox = function() {
    var lb = $('#lightbox');
    if (!lb) return;
    lb.classList.remove('open');
    document.body.style.overflow = '';
    history.replaceState(null, '', window.location.pathname);
    document.title = 'MITTI — Earth. Art. Belonging. | Original Indian Art Gallery';
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
    var allProducts = MITTI_API.artworks;
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
      var product = MITTI_API.getBySlug(match[1]);
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
      if ($('#cartTotal')) $('#cartTotal').textContent = '₹0';
      return;
    }

    items.innerHTML = cart.map(function(item, i) {
      return '<div class="cart-item">' +
        '<div class="cart-item-img"><img src="' + (item.image || '') + '" alt="' + item.name + '" loading="lazy" onerror="this.style.display=\'none\'" /></div>' +
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
    if (product.inStock === false || product.inStock === 'FALSE') {
      showToast('This piece is currently unavailable');
      return;
    }
    var imgSrc = product.image
      ? (product.image.startsWith('http') ? product.image : 'images/optimized/' + product.image)
      : '';
    cart.push({ id: product.id, name: product.title || product.name, price: product.price, image: imgSrc });
    localStorage.setItem('mitti-cart', JSON.stringify(cart));
    updateCartUI();
    showToast((product.title || product.name) + ' added to your collection');
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
    // Step 1: Load data from Google Sheets API (with fallback to local JSON)
    MITTI_API.loadAll().then(function() {
      // Step 2: Render all CMS-driven sections
      if (typeof MITTI_CMS !== 'undefined') {
        MITTI_CMS.init();
      }
      // Step 3: UI init
      updateCartUI();
      initNav();
      initContactForm();
      initCursor();
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
  });

})();
