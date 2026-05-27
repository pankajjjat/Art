/**
 * MITTI CMS — Google Apps Script Backend
 * ==========================================
 * Connects Google Sheets → JSON API → GitHub Pages
 *
 * SETUP:
 * 1. Create a Google Sheet with tabs named exactly as below
 * 2. Extensions → Apps Script → paste this code
 * 3. Deploy → New deployment → Web app → "Anyone" access
 * 4. Copy the web app URL → paste into js/api.js
 *
 * SHEET TABS REQUIRED:
 *   Artworks, Categories, Testimonials, FAQs, Website_Content,
 *   Orders, Blog_Posts, Image_Manager, Contacts
 */

// ─── CONFIG ────────────────────────────────────────────────────────────────
const SHEET_NAMES = {
  artworks:   'Artworks',
  categories: 'Categories',
  testimonials: 'Testimonials',
  faqs:       'FAQs',
  content:    'Website_Content',
  orders:     'Orders',
  blog:       'Blog_Posts',
  images:     'Image_Manager',
  contacts:   'Contacts'
};

// ─── MAIN ENTRY POINT ──────────────────────────────────────────────────────
function doGet(e) {
  const action = e?.parameter?.action || '';
  
  try {
    const result = handleAction(action);
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, data: result }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── ROUTER ─────────────────────────────────────────────────────────────────
function handleAction(action) {
  switch (action) {
    case 'artworks':     return getArtworks();
    case 'categories':   return getCategories();
    case 'testimonials': return getTestimonials();
    case 'faq':          return getFAQs();
    case 'content':      return getWebsiteContent();
    case 'blog':         return getBlogPosts();
    case 'images':       return getImageManager();
    case 'orders':       return getOrders();
    case 'all':          return getAllData();     // single call fetches everything
    case 'stats':        return getStats();
    default:
      return { message: 'MITTI CMS API is running. Use ?action=artworks|categories|testimonials|faq|content|blog|images|orders|all|stats' };
  }
}

// ─── SHEET HELPERS ──────────────────────────────────────────────────────────
function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error(`Sheet "${name}" not found`);
  return sheet;
}

function rowsToObjects(sheet) {
  const [headers, ...rows] = sheet.getDataRange().getValues();
  if (!headers || headers.length === 0) return [];
  return rows
    .filter(row => row[0] !== '' && row[0] !== null && row[0] !== undefined)  // skip empty rows
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        let val = row[i];
        // Normalize boolean strings
        if (typeof val === 'string') {
          const upper = val.toUpperCase().trim();
          if (upper === 'TRUE') val = true;
          else if (upper === 'FALSE') val = false;
        }
        // Normalize numeric strings
        if (typeof val === 'string' && /^\d+$/.test(val.trim())) {
          val = Number(val.trim());
        }
        obj[String(h).trim()] = val;
      });
      return obj;
    });
}

function getSheetWithId(name) {
  const sheet = getSheet(name);
  const [headers, ...rows] = sheet.getDataRange().getValues();
  if (!headers || headers.length === 0) return [];
  
  // Find the id column index
  const idIdx = headers.findIndex(h => String(h).trim().toLowerCase() === 'id');
  
  return rows
    .filter(row => row[0] !== '' && row[0] !== null && row[0] !== undefined)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => {
        let val = row[i];
        if (typeof val === 'string') {
          const upper = val.toUpperCase().trim();
          if (upper === 'TRUE') val = true;
          else if (upper === 'FALSE') val = false;
        }
        if (typeof val === 'string' && /^\d+$/.test(val.trim())) {
          val = Number(val.trim());
        }
        obj[String(h).trim()] = val;
      });
      return obj;
    });
}

// ─── ENDPOINT FUNCTIONS ─────────────────────────────────────────────────────

/** GET /?action=artworks — full product catalog */
function getArtworks() {
  return getSheetWithId('Artworks');
}

/** GET /?action=categories — shop categories */
function getCategories() {
  return getSheetWithId('Categories');
}

/** GET /?action=testimonials — customer reviews */
function getTestimonials() {
  return rowsToObjects(getSheet('Testimonials'));
}

/** GET /?action=faq — frequently asked questions */
function getFAQs() {
  return rowsToObjects(getSheet('FAQs'));
}

/** GET /?action=content — site-wide content strings */
function getWebsiteContent() {
  const rows = rowsToObjects(getSheet('Website_Content'));
  // Return as key-value map for easier frontend consumption
  const map = {};
  rows.forEach(r => {
    if (r.key) map[r.key] = r.value;
  });
  return map;
}

/** GET /?action=blog — blog posts */
function getBlogPosts() {
  return getSheetWithId('Blog_Posts');
}

/** GET /?action=images — image manager (CDN/Drive URLs) */
function getImageManager() {
  return rowsToObjects(getSheet('Image_Manager'));
}

/** GET /?action=orders — customer orders */
function getOrders() {
  return getSheetWithId('Orders');
}

/** GET /?action=all — everything in one request (saves round trips) */
function getAllData() {
  return {
    artworks:   getArtworks(),
    categories: getCategories(),
    testimonials: getTestimonials(),
    faqs:       getFAQs(),
    content:    getWebsiteContent(),
    blog:       getBlogPosts(),
    images:     getImageManager()
  };
}

/** GET /?action=stats — shop statistics */
function getStats() {
  const artworks = getArtworks();
  const orders = getOrders();
  return {
    totalArtworks: artworks.length,
    inStock: artworks.filter(a => a.inStock !== false).length,
    categories: [...new Set(artworks.map(a => a.category).filter(Boolean))],
    totalOrders: orders.length,
    priceRange: {
      min: artworks.length ? Math.min(...artworks.map(a => Number(a.price) || 0)) : 0,
      max: artworks.length ? Math.max(...artworks.map(a => Number(a.price) || 0)) : 0
    }
  };
}

// ─── ORDER SUBMISSION (POST) — for future contact form / checkout ──────────
function doPost(e) {
  try {
    // Parse action from: JSON body, query param, or form-encoded body
    let data;
    try {
      data = JSON.parse(e?.postData?.contents || '{}');
    } catch (_) {
      data = {};
    }
    
    // Fallback: if body didn't have action, check query params
    if (!data.action && e?.parameter?.action) {
      data.action = e.parameter.action;
    }
    // Fallback: merge query params into data (for name, email, message)
    if (e?.parameter) {
      Object.keys(e.parameter).forEach(k => {
        if (!data[k]) data[k] = e.parameter[k];
      });
    }
    
    if (data.action === 'place-order') {
      const sheet = getSheet('Orders');
      const timestamp = new Date().toISOString();
      // Append order row
      sheet.appendRow([
        data.id || '',
        data.customer || '',
        data.phone || '',
        data.email || '',
        data.artwork_id || '',
        data.artwork_name || '',
        data.price || 0,
        data.status || 'Pending',
        timestamp
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Order placed' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    if (data.action === 'contact') {
      const sheet = getSheet('Contacts');
      sheet.appendRow([
        new Date().toISOString(),
        data.name || '',
        data.email || '',
        data.phone || '',
        data.message || '',
        'New'
      ]);
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, message: 'Message received' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    throw new Error('Unknown action: ' + data.action);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── SHEET CREATION HELPER — run once to set up all tabs ────────────────────
function createAllSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const sheetDefs = {
    'Artworks': [
      ['id','title','slug','category','cat_clean','price','description','dimensions','image','svg','featured','inStock'],
      [1,'Mountain Vista','mountain-vista','landscapes','Landscapes',12999,'A breathtaking panoramic landscape...','30" × 40"','landscapes_1.jpg','mountain-vista.svg','TRUE','TRUE'],
      [2,'Midnight Solitude','midnight-solitude','landscapes','Landscapes',8999,'A moody nocturnal landscape...','24" × 36"','landscapes_5.jpg','midnight-solitude.svg','FALSE','TRUE'],
      [3,'Forest Canopy','forest-canopy','landscapes','Landscapes',10999,'Sunlight filtering through a dense forest canopy...','28" × 36"','landscapes_9.jpg','forest-canopy.svg','TRUE','TRUE'],
      [4,'Golden Pastoral','golden-pastoral','landscapes','Landscapes',7499,'A warm pastoral scene bathed in golden sunlight...','20" × 28"','landscapes_13.jpg','golden-pastoral.svg','FALSE','TRUE'],
      [5,'Ethereal Mist','ethereal-mist','abstract','Abstract',6999,'A soft, minimalist abstract composition...','18" × 24"','abstract_2.jpg','ethereal-mist.svg','FALSE','TRUE'],
      [6,'Earthen Flow','earthen-flow','abstract','Abstract',8499,'Warm earth tones converge in flowing organic patterns...','24" × 30"','abstract_3.jpg','earthen-flow.svg','TRUE','TRUE'],
      [7,'Textured Rhythms','textured-rhythms','abstract','Abstract',9999,'A richly textured abstract piece...','28" × 36"','abstract_7.jpg','textured-rhythms.svg','FALSE','TRUE'],
      [8,'Golden Cascade','golden-cascade','abstract','Abstract',14999,'A luminous golden abstract...','36" × 48"','abstract_11.jpg','golden-cascade.svg','TRUE','TRUE'],
      [9,'Mirror Mandala','mirror-mandala','lippan-art','Lippan Art',5999,'Intricate handcrafted lippan art...','18" × 18"','lippan-art_6.jpg','mirror-mandala.svg','TRUE','TRUE'],
      [10,'Geometric Radiance','geometric-radiance','lippan-art','Lippan Art',7499,'A contemporary lippan art piece...','24" × 24"','lippan-art_10.jpg','geometric-radiance.svg','FALSE','TRUE'],
      [11,'Urban Layers','urban-layers','modern-art','Modern Art',11999,'An evocative cityscape...','30" × 40"','modern-art_4.jpg','urban-layers.svg','TRUE','TRUE'],
      [12,'Modern Symmetry','modern-symmetry','modern-art','Modern Art',9999,'Clean lines and balanced architectural forms...','24" × 36"','modern-art_8.jpg','modern-symmetry.svg','FALSE','TRUE'],
      [13,'Ornate Opulence','ornate-opulence','wall-decor','Wall Decor',18999,'A stunning decorative piece with rich golden tones...','36" × 48"','wall-decor_12.jpg','ornate-opulence.svg','TRUE','TRUE']
    ],
    'Categories': [
      ['id','name','slug'],
      [1,'Landscapes','landscapes'],
      [2,'Abstract','abstract'],
      [3,'Lippan Art','lippan-art'],
      [4,'Modern Art','modern-art'],
      [5,'Wall Decor','wall-decor']
    ],
    'Testimonials': [
      ['name','review','rating'],
      ['Ananya Sharma','Absolutely stunning artwork! The Mirror Mandala is the centerpiece of my living room.','5'],
      ['Rahul Verma','Incredible craftsmanship. The lippan art piece arrived beautifully packed and exceeded expectations.','5'],
      ['Priya Patel','I ordered the Ethereal Mist for my office — everyone compliments it. The earth tones are perfect.','5'],
      ['Arjun Singh','Fast delivery and the quality is outstanding. Will definitely order more.','4'],
      ['Meera Iyer','The Golden Cascade transformed my entire wall. It glows in evening light.','5']
    ],
    'FAQs': [
      ['question','answer'],
      ['How long does delivery take?','We ship within 7-10 business days across India. International shipping takes 12-18 business days.'],
      ['Do you ship internationally?','Yes! We ship worldwide. International shipping costs vary by destination and will be calculated at checkout.'],
      ['What is your return policy?','We want you to love your art. If it arrives damaged or doesn\'t match the description, we offer a full refund within 7 days of delivery.'],
      ['Can I customize an artwork?','Absolutely! Many of our pieces can be customized in size, color palette, or composition. Contact us via the inquiry form with your vision.'],
      ['How are the artworks packaged?','Each piece is carefully wrapped in acid-free paper, bubble-wrapped, and shipped in a sturdy corrugated box with "Fragile" markings.'],
      ['Is Lippan Art durable?','Yes — our lippan pieces use high-quality clay, mirrors, and sealant. They\'re built to last for decades with proper care. Avoid direct moisture.'],
      ['Do you offer framing?','Most pieces come ready-to-hang on a wooden frame. Some larger works may require custom framing at the buyer\'s preference.'],
      ['What payment methods do you accept?','We accept UPI (Google Pay, PhonePe, Paytm), bank transfer, and Razorpay cards. UPI is preferred for fastest processing.'],
      ['Can I visit your studio?','We\'re based in India. Studio visits can be arranged by appointment — please reach out via the contact form.'],
      ['How do I care for my art?','Keep away from direct sunlight and moisture. Dust gently with a soft dry cloth. For lippan art, avoid water near the mirror work.']
    ],
    'Website_Content': [
      ['key','value'],
      ['hero_title','Handcrafted Indian Art — From Earth, For The Wall'],
      ['hero_subtitle','Original paintings, lippan mirror work, and wall decor rooted in Indian tradition. Each piece tells a story of earth and belonging.'],
      ['featured_title','Featured Artworks'],
      ['featured_subtitle','Curated pieces that embody the MITTI spirit'],
      ['gallery_title','Our Collection'],
      ['gallery_subtitle','Browse our complete range of handcrafted artworks'],
      ['about_title','The MITTI Story'],
      ['about_text','MITTI (मिट्टी) means earth — the raw material from which all life springs. Our art begins with the same elemental connection: clay from the soil, pigments from minerals, mirrors that catch the sun like morning dew. Every piece is handcrafted, every stroke intentional. Founded by Saumya, MITTI brings the rich traditions of Indian folk art — especially the lippan mirror work of Kutch, Gujarat — into contemporary homes. We believe art should feel like it belongs, not just hang on a wall.'],
      ['about_image','about-mitti.jpg'],
      ['contact_email','hello@mittiart.com'],
      ['contact_phone','+91-XXX-XXX-XXXX'],
      ['faq_title','Frequently Asked Questions'],
      ['shipping_title','Shipping & Returns'],
      ['payment_title','Payment Information'],
      ['footer_tagline','From earth, for the wall.'],
      ['footer_credit','© MITTI Art. All rights reserved.']
    ],
    'Orders': [
      ['id','customer','phone','email','artwork_id','artwork_name','price','status','timestamp']
    ],
    'Blog_Posts': [
      ['id','title','slug','category','readTime','date','excerpt','image','svg','content'],
      [1,'What Is Lippan Art? India\'s Ancient Mirror Craft Explained','what-is-lippan-art-india','Lippan Art',6,'Jan 15, 2026','Discover the centuries-old tradition of Lippan Art — the mud-and-mirror craft from Kutch, Gujarat.','blog-lippan-intro.jpg','blog-lippan-intro.svg','<p>Lippan art (also known as mud-mirror work) is a traditional craft from the Kutch region of Gujarat, India. The word "lippan" comes from the Gujarati word for "coating" — referring to the clay-mud mixture that forms the base of this art form.</p><p>Artists mix clay, dung, and natural binders to create a pliable paste, then shape intricate patterns on a wooden or cloth base. Small mirror pieces (called "abhla" or "abhla") are embedded into the wet clay. Once dry, the piece is sealed with natural varnish.</p><p>What makes lippan special is its ability to catch and scatter light — the mirrors dance as you move around the piece, creating an ever-changing visual experience. Traditionally, lippan adorned the walls of Kutchi homes as symbols of prosperity and protection.</p><p>Today, MITTI reimagines this ancient craft for contemporary interiors — combining traditional techniques with modern designs, color palettes, and sizes suited for urban homes.</p>'],
      [2,'Modern Lippan Wall Decor: 7 Stunning Ideas for Your Home','modern-lippan-wall-decor-ideas','Home Decor',8,'Jan 22, 2026','From minimalist white-and-gold compositions to bold terracotta statements — explore 7 modern lippan wall decor ideas.','blog-lippan-decor.jpg','blog-lippan-decor.svg','<p>Lippan art has moved far beyond its traditional roots. Here are 7 modern ways to incorporate this stunning mirror-work craft into your contemporary home:</p><ol><li><strong>Minimalist White + Gold:</strong> A single large lippan piece in white clay with gold-tinted mirrors against a white wall creates an ethereal, gallery-like feel.</li><li><strong>Terracotta Statement Wall:</strong> Cover a full wall with terracotta-toned lippan tiles embedded with amber mirrors.</li><li><strong>Lippan Coasters & Trays:</strong> Small functional pieces that bring texture to your coffee table.</li><li><strong>Geometric Compositions:</strong> Modern lippan pieces with sharp geometric patterns rather than traditional floral motifs.</li><li><strong>Lippan Headboard:</strong> A large lippan panel behind your bed creates a warm, textured focal point.</li><li><strong>Entryway Mirror:</strong> A lippan-framed mirror for your foyer — practical and beautiful.</li><li><strong>Layered Gallery Wall:</strong> Mix lippan pieces with abstract canvases, photographs, and textiles.</li></ol><p>Each idea works because lippan\'s tactile, light-catching nature adds warmth that flat art can\'t match.</p>'],
      [3,'Lippan Art vs Warli Art: Key Differences Every Art Lover Should Know','lippan-art-vs-warli-art','Art Guide',5,'Feb 1, 2026','Two of India\'s most beloved folk art forms — Lippan and Warli — explained. Materials, techniques, origins, and which one suits your space better.','blog-lippan-vs-warli.png','blog-lippan-vs-warli.svg','<p>India\'s folk art traditions are incredibly diverse. Two of the most popular — Lippan Art and Warli Art — often get confused. Here\'s a clear breakdown:</p><table><tr><th>Feature</th><th>Lippan Art</th><th>Warli Art</th></tr><tr><td>Origin</td><td>Kutch, Gujarat</td><td>Palghar, Maharashtra</td></tr><tr><td>Material</td><td>Clay, dung, mirrors</td><td>Rice paste, cow dung, bamboo sticks</td></tr><tr><td>Technique</td><td>Mud-relief with embedded mirrors</td><td>Painted stick figures on mud walls</td></tr><tr><td>Key motif</td><td>Geometric patterns, mirrors</td><td>Humans, animals, daily life scenes</td></tr><tr><td>Color palette</td><td>Earth tones, white, gold</td><td>White pigment on brown/red background</td></tr><tr><td>Modern use</td><td>Wall art, coasters, decor objects</td><td>Canvas art, fabric prints, murals</td></tr><tr><td>Light effect</td><td>Mirrors reflect light beautifully</td><td>Matte finish, no reflection</td></tr></table>']
    ],
    'Image_Manager': [
      ['title','image_url','thumbnail_url'],
      ['Mountain Vista','images/optimized/landscapes_1.jpg','images/optimized/landscapes_1.jpg'],
      ['Midnight Solitude','images/optimized/landscapes_5.jpg','images/optimized/landscapes_5.jpg'],
      ['Forest Canopy','images/optimized/landscapes_9.jpg','images/optimized/landscapes_9.jpg'],
      ['Golden Pastoral','images/optimized/landscapes_13.jpg','images/optimized/landscapes_13.jpg'],
      ['Ethereal Mist','images/optimized/abstract_2.jpg','images/optimized/abstract_2.jpg'],
      ['Earthen Flow','images/optimized/abstract_3.jpg','images/optimized/abstract_3.jpg'],
      ['Textured Rhythms','images/optimized/abstract_7.jpg','images/optimized/abstract_7.jpg'],
      ['Golden Cascade','images/optimized/abstract_11.jpg','images/optimized/abstract_11.jpg'],
      ['Mirror Mandala','images/optimized/lippan-art_6.jpg','images/optimized/lippan-art_6.jpg'],
      ['Geometric Radiance','images/optimized/lippan-art_10.jpg','images/optimized/lippan-art_10.jpg'],
      ['Urban Layers','images/optimized/modern-art_4.jpg','images/optimized/modern-art_4.jpg'],
      ['Modern Symmetry','images/optimized/modern-art_8.jpg','images/optimized/modern-art_8.jpg'],
      ['Ornate Opulence','images/optimized/wall-decor_12.jpg','images/optimized/wall-decor_12.jpg']
    ],
    'Contacts': [
      ['timestamp','name','email','phone','message','status']
    ]
  };
  
  Object.entries(sheetDefs).forEach(([name, data]) => {
    let sheet = ss.getSheetByName(name);
    if (sheet) {
      // Clear existing data
      sheet.clear();
    } else {
      sheet = ss.insertSheet(name);
    }
    sheet.getRange(1, 1, data.length, data[0].length).setValues(data);
    sheet.setFrozenRows(1);
    // Auto-resize columns
    data[0].forEach((_, i) => {
      sheet.autoResizeColumn(i + 1);
    });
  });
  
  // Remove default "Sheet1" if it exists
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet) ss.deleteSheet(defaultSheet);
  
  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'All sheets created!' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─── DATA FIX: update prices & inStock in the Artworks sheet ─────────────────
/**
 * Run this ONCE in the Apps Script editor after you've pasted updated code.gs.
 * It finds the Artworks sheet, matches products by slug, and updates only
 * the price and inStock columns — leaving everything else (descriptions,
 * dimensions, etc.) untouched.
 */
function fixArtworkData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Artworks');
  if (!sheet) throw new Error('Artworks sheet not found');
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim().toLowerCase());
  
  // Find column indices
  const slugIdx = headers.indexOf('slug');
  const priceIdx = headers.indexOf('price');
  const stockIdx = headers.indexOf('instock');
  
  if (slugIdx === -1 || priceIdx === -1 || stockIdx === -1) {
    throw new Error('Required columns not found (slug, price, inStock)');
  }
  
  // Correct data: slug → [price, inStock]
  const fixes = {
    'mountain-vista':     [12999, true],
    'midnight-solitude':  [8999,  true],
    'forest-canopy':      [10999, true],
    'golden-pastoral':    [7499,  true],
    'ethereal-mist':      [6999,  true],
    'earthen-flow':       [8499,  true],
    'textured-rhythms':   [9999,  true],
    'golden-cascade':     [14999, true],
    'mirror-mandala':     [5999,  true],
    'geometric-radiance': [7499,  true],
    'urban-layers':       [11999, true],
    'modern-symmetry':    [9999,  true],
    'ornate-opulence':    [18999, true]
  };
  
  let updated = 0;
  
  for (let r = 1; r < data.length; r++) {
    const slug = String(data[r][slugIdx]).trim();
    const fix = fixes[slug];
    if (!fix) continue;
    
    const row = r + 1; // 1-indexed for Sheets API
    const colPrice = priceIdx + 1;
    const colStock = stockIdx + 1;
    
    sheet.getRange(row, colPrice).setValue(fix[0]);
    sheet.getRange(row, colStock).setValue(fix[1]);
    updated++;
  }
  
  SpreadsheetApp.flush();
  
  const msg = 'Fixed ' + updated + ' products — prices and availability updated.';
  console.log(msg);
  SpreadsheetApp.getUi().alert(msg);
}

// ─── DASHBOARD — custom menu + sidebar ──────────────────────────────────────

/**
 * Runs automatically when the sheet opens — adds the MITTI menu.
 */
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('🌍 MITTI')
    .addItem('📊 Dashboard', 'showDashboard')
    .addSeparator()
    .addItem('📦 Products', 'openArtworksTab')
    .addItem('💬 Inquiries', 'openContactsTab')
    .addItem('📋 Orders', 'openOrdersTab')
    .addItem('✏️ Site Content', 'openContentTab')
    .addSeparator()
    .addItem('➕ New Product', 'openNewProduct')
    .addItem('✚ Create Contacts Tab', 'ensureContactsSheet')
    .addSeparator()
    .addItem('📦 Fix Prices & Stock', 'fixArtworkData')
    .addToUi();
}

function openArtworksTab() { openSheetTab('Artworks'); }
function openContactsTab() { openSheetTab('Contacts'); }
function openOrdersTab() { openSheetTab('Orders'); }
function openContentTab() { openSheetTab('Website_Content'); }
function openNewProduct() { openSheetTab('Artworks'); }

/**
 * Opens the Dashboard sidebar.
 */
function showDashboard() {
  const html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setTitle('MITTI Dashboard')
    .setWidth(320);
  SpreadsheetApp.getUi().showSidebar(html);
}

/**
 * Returns summary stats for the dashboard sidebar.
 */
function getDashboardStats() {
  try {
    const artworks = getArtworks();
    const orders = getOrders();
    
    let contacts = [];
    try {
      contacts = getContacts();
    } catch (_) { /* Contacts tab may not exist yet */ }
    
    const prices = artworks.map(a => Number(a.price) || 0);
    
    return {
      totalArtworks: artworks.length,
      inStock: artworks.filter(a => a.inStock !== false).length,
      categories: [...new Set(artworks.map(a => a.category).filter(Boolean))].length,
      priceMin: prices.length ? Math.min(...prices) : 0,
      priceMax: prices.length ? Math.max(...prices) : 0,
      orders: orders.length,
      pendingOrders: orders.filter(o => (o.status || '').toString().toLowerCase() !== 'delivered').length,
      contacts: contacts.length,
      unreadContacts: contacts.filter(c => (c.status || '').toString().toLowerCase() === 'new').length
    };
  } catch (err) {
    return { error: err.message };
  }
}

/**
 * Returns contact form submissions (from Contacts sheet).
 */
function getContacts() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Contacts');
  if (!sheet) return [];
  return getSheetWithId('Contacts');
}

/**
 * Safely creates the Contacts tab if it doesn't exist.
 * Won't overwrite existing data.
 */
function ensureContactsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Contacts');
  if (sheet) {
    SpreadsheetApp.getUi().alert('Contacts tab already exists!');
    return;
  }
  sheet = ss.insertSheet('Contacts');
  const headers = [['timestamp', 'name', 'email', 'phone', 'message', 'status']];
  sheet.getRange(1, 1, 1, headers[0].length).setValues(headers);
  sheet.setFrozenRows(1);
  sheet.autoResizeColumns(1, headers[0].length);
  SpreadsheetApp.getUi().alert('✅ Contacts tab created! Inquiries from the website will appear here.');
}

// ─── DASHBOARD ACTIONS ───────────────────────────────────────────────────────

/**
 * Toggle the featured flag of a product by slug.
 */
function toggleFeatured(slug) {
  const sheet = getSheet('Artworks');
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const slugIdx = headers.indexOf('slug');
  const featIdx = headers.indexOf('featured');
  if (slugIdx === -1 || featIdx === -1) throw new Error('Required columns not found');
  
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][slugIdx]).trim() === slug) {
      const current = String(data[r][featIdx]).trim().toUpperCase();
      const newVal = (current === 'TRUE') ? 'FALSE' : 'TRUE';
      sheet.getRange(r + 1, featIdx + 1).setValue(newVal);
      SpreadsheetApp.flush();
      return { success: true, message: newVal === 'TRUE' ? '⭐ Featured!' : 'Unfeatured' };
    }
  }
  throw new Error('Product not found: ' + slug);
}

/**
 * Toggle the inStock flag of a product by slug.
 */
function toggleStock(slug) {
  const sheet = getSheet('Artworks');
  const data = sheet.getDataRange().getValues();
  const headers = data[0].map(h => String(h).trim().toLowerCase());
  const slugIdx = headers.indexOf('slug');
  const stockIdx = headers.indexOf('instock');
  if (slugIdx === -1 || stockIdx === -1) throw new Error('Required columns not found');
  
  for (let r = 1; r < data.length; r++) {
    if (String(data[r][slugIdx]).trim() === slug) {
      const current = String(data[r][stockIdx]).trim().toUpperCase();
      const newVal = (current === 'TRUE') ? 'FALSE' : 'TRUE';
      sheet.getRange(r + 1, stockIdx + 1).setValue(newVal);
      SpreadsheetApp.flush();
      return { success: true, message: newVal === 'TRUE' ? '✅ In Stock' : '❌ Out of Stock' };
    }
  }
  throw new Error('Product not found: ' + slug);
}

/**
 * Mark a contact inquiry as Read (row = actual sheet row number, 1-indexed).
 */
function markContactRead(row) {
  const sheet = getSheet('Contacts');
  const headers = sheet.getDataRange().getValues()[0];
  const statusIdx = headers.map(h => String(h).trim().toLowerCase()).indexOf('status');
  if (statusIdx === -1) throw new Error('Status column not found');
  sheet.getRange(row, statusIdx + 1).setValue('Read');
  SpreadsheetApp.flush();
  return { success: true, message: '✓ Marked as read' };
}

/**
 * Mark a contact inquiry as New (unread).
 */
function markContactUnread(row) {
  const sheet = getSheet('Contacts');
  const headers = sheet.getDataRange().getValues()[0];
  const statusIdx = headers.map(h => String(h).trim().toLowerCase()).indexOf('status');
  if (statusIdx === -1) throw new Error('Status column not found');
  sheet.getRange(row, statusIdx + 1).setValue('New');
  SpreadsheetApp.flush();
  return { success: true, message: '↩ Marked as new' };
}

/**
 * Activate a specific sheet tab (switches the user's view to that tab).
 */
function openSheetTab(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error('Sheet "' + name + '" not found');
  sheet.activate();
  ss.setActiveSheet(sheet);
  return { success: true };
}
