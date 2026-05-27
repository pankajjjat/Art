"""Regenerate all product pages, blog posts, and static pages for MITTI website."""
import json, os, re

BASE = "C:/Users/panka/OneDrive/Desktop/Project/mitti-website"

# Full product data matching products.js EXACTLY including image paths
products = [
  {"id":1,"name":"Mountain Vista","slug":"mountain-vista","category":"landscapes","price":12999,"description":"A breathtaking panoramic landscape capturing the golden hour over majestic mountain peaks and serene waters — where earth meets sky in perfect stillness.","dimensions":"30\" × 40\"","cat_clean":"Landscapes","image":"abstract_11.jpg","svg":"mountain-vista.svg"},
  {"id":2,"name":"Midnight Solitude","slug":"midnight-solitude","category":"landscapes","price":8999,"description":"A moody nocturnal landscape bathed in moonlight, evoking a sense of quiet contemplation and mystery. The stars mirror the stillness within.","dimensions":"24\" × 36\"","cat_clean":"Landscapes","image":"landscapes_5.jpg","svg":"midnight-solitude.svg"},
  {"id":3,"name":"Forest Canopy","slug":"forest-canopy","category":"landscapes","price":10999,"description":"Sunlight filtering through a dense forest canopy, painting the forest floor in dappled gold and emerald — nature's own stained glass.","dimensions":"28\" × 36\"","cat_clean":"Landscapes","image":"landscapes_9.jpg","svg":"forest-canopy.svg"},
  {"id":4,"name":"Golden Pastoral","slug":"golden-pastoral","category":"landscapes","price":7499,"description":"A warm pastoral scene bathed in golden sunlight — rolling fields and gentle skies captured at the perfect hour when the world turns to amber.","dimensions":"20\" × 28\"","cat_clean":"Landscapes","image":"landscapes_13.jpg","svg":"golden-pastoral.svg"},
  {"id":5,"name":"Monsoon Mountains","slug":"monsoon-mountains","category":"landscapes","price":11999,"description":"Lush green Western Ghats landscape with mist rolling through valleys. An ode to India's monsoon beauty — layer upon layer of misty blue-green mountains.","dimensions":"24\" × 36\"","cat_clean":"Landscapes","image":"landscape-monsoon.jpg","svg":"monsoon-mountains.svg"},
  {"id":6,"name":"Sacred Ganga","slug":"sacred-ganga","category":"landscapes","price":13999,"description":"A serene depiction of the Ganga at dawn — soft pastels, gentle ripples, and the first light over Haridwar's ghats. A meditation in paint.","dimensions":"30\" × 40\"","cat_clean":"Landscapes","image":"landscape-ganga.jpg","svg":"sacred-ganga.svg"},
  {"id":7,"name":"Desert Solitude","slug":"desert-solitude","category":"landscapes","price":9999,"description":"Rajasthan's Thar Desert in golden hour — endless dunes, a single camel silhouette, and a sky on fire. The raw beauty of the desert at sunset.","dimensions":"24\" × 36\"","cat_clean":"Landscapes","image":"landscape-desert.jpg","svg":"desert-solitude.svg"},
  {"id":8,"name":"Ethereal Mist","slug":"ethereal-mist","category":"abstract","price":6999,"description":"A soft, minimalist abstract composition where muted tones blend like morning mist over still waters — quiet, contemplative, essential.","dimensions":"18\" × 24\"","cat_clean":"Abstract","image":"abstract_2.jpg","svg":"ethereal-mist.svg"},
  {"id":9,"name":"Earthen Flow","slug":"earthen-flow","category":"abstract","price":8499,"description":"Warm earth tones converge in flowing organic patterns, inspired by natural textures and geological formations carved over millennia.","dimensions":"24\" × 30\"","cat_clean":"Abstract","image":"abstract_3.jpg","svg":"earthen-flow.svg"},
  {"id":10,"name":"Textured Rhythms","slug":"textured-rhythms","category":"abstract","price":9999,"description":"A richly textured abstract piece where layered vertical rhythms create depth, movement, and visual intrigue — a meditation in monochrome.","dimensions":"28\" × 36\"","cat_clean":"Abstract","image":"abstract_7.jpg","svg":"textured-rhythms.svg"},
  {"id":11,"name":"Golden Cascade","slug":"golden-cascade","category":"abstract","price":14999,"description":"A luminous golden abstract where cascading warm tones meet subtle texture — a statement piece that transforms any space with its quiet radiance.","dimensions":"36\" × 48\"","cat_clean":"Abstract","image":"abstract_11.jpg","svg":"golden-cascade.svg"},
  {"id":12,"name":"Crimson Horizon","slug":"crimson-horizon","category":"abstract","price":18999,"description":"A bold abstract composition in deep crimson and gold, with textured impasto strokes that catch light dramatically — a statement of passion.","dimensions":"36\" × 48\"","cat_clean":"Abstract","image":"abstract-crimson.jpg","svg":"crimson-horizon.svg"},
  {"id":13,"name":"Earthy Resonance","slug":"earthy-resonance","category":"abstract","price":14999,"description":"Textural abstract in layered earth tones — ochre, umber, and clay white. Organic forms that evoke soil, stone, and sediment.","dimensions":"30\" × 40\"","cat_clean":"Abstract","image":"abstract-earthy.jpg","svg":"earthy-resonance.svg"},
  {"id":14,"name":"Mirror Mandala","slug":"mirror-mandala","category":"lippan-art","price":5999,"description":"Intricate handcrafted lippan art featuring a traditional mandala pattern with embedded mirror work that catches and reflects light beautifully.","dimensions":"18\" × 18\"","cat_clean":"Lippan Art","image":"lippan-art_6.jpg","svg":"mirror-mandala.svg"},
  {"id":15,"name":"Geometric Radiance","slug":"geometric-radiance","category":"lippan-art","price":7499,"description":"A contemporary lippan art piece blending traditional mirror inlay with bold geometric patterns — a brilliant fusion of heritage and modern design.","dimensions":"24\" × 24\"","cat_clean":"Lippan Art","image":"lippan-art_10.jpg","svg":"geometric-radiance.svg"},
  {"id":16,"name":"Modern Lippan Mandala","slug":"modern-lippan-mandala","category":"lippan-art","price":12999,"description":"A stunning modern interpretation of traditional Kutch lippan art. Intricate mirror work embedded in white clay on a deep indigo canvas.","dimensions":"30\" × 40\"","cat_clean":"Lippan Art","image":"lippan-mandala.jpg","svg":"modern-lippan-mandala.svg"},
  {"id":17,"name":"Traditional Kutch Geometric","slug":"traditional-kutch-geometric","category":"lippan-art","price":8999,"description":"Authentic Kutch-inspired geometric patterns with embedded mirrors on a warm terracotta clay base. Pure earthy elegance rooted in tradition.","dimensions":"24\" × 36\"","cat_clean":"Lippan Art","image":"lippan-geometric.jpg","svg":"traditional-kutch-geometric.svg"},
  {"id":18,"name":"White & Gold Celestial","slug":"white-gold-celestial","category":"lippan-art","price":15999,"description":"Luxurious white-and-gold lippan art depicting celestial motifs. Gold-leaf accents elevate traditional craft into modern luxury.","dimensions":"36\" × 48\"","cat_clean":"Lippan Art","image":"lippan-celestial.jpg","svg":"white-gold-celestial.svg"},
  {"id":19,"name":"Terracotta & Teal Harmony","slug":"terracotta-teal-harmony","category":"lippan-art","price":7499,"description":"A vibrant fusion of warm terracotta clay and cool teal accents. Modern lippan art reimagined with contemporary color blocking.","dimensions":"18\" × 24\"","cat_clean":"Lippan Art","image":"lippan-terracotta.jpg","svg":"terracotta-teal-harmony.svg"},
  {"id":20,"name":"Abstract Lippan Fusion","slug":"abstract-lippan-fusion","category":"lippan-art","price":10999,"description":"Where abstract expressionism meets traditional lippan craft. Fluid clay forms with scattered mirrors create an ever-changing visual experience.","dimensions":"30\" × 30\"","cat_clean":"Lippan Art","image":"lippan-abstract.jpg","svg":"abstract-lippan-fusion.svg"},
  {"id":21,"name":"Custom Name Lippan Art","slug":"custom-name-lippan","category":"lippan-art","price":5999,"description":"Personalized lippan art with your name, family name, or mantra — handcrafted in clay and mirrors. A one-of-a-kind gift that tells your story.","dimensions":"12\" × 18\"","cat_clean":"Lippan Art","image":"lippan-custom.jpg","svg":"custom-name-lippan.svg"},
  {"id":22,"name":"Urban Layers","slug":"urban-layers","category":"modern-art","price":11999,"description":"An evocative cityscape where layered architectural forms and geometric compositions capture the restless energy of urban life.","dimensions":"30\" × 40\"","cat_clean":"Modern Art","image":"modern-art_4.jpg","svg":"urban-layers.svg"},
  {"id":23,"name":"Modern Symmetry","slug":"modern-symmetry","category":"modern-art","price":9999,"description":"Clean lines and balanced architectural forms create a meditative modern art piece that brings sophisticated calm to any interior.","dimensions":"24\" × 36\"","cat_clean":"Modern Art","image":"modern-art_8.jpg","svg":"modern-symmetry.svg"},
  {"id":24,"name":"Urban Geometry","slug":"urban-geometry","category":"modern-art","price":21999,"description":"A bold modern composition exploring the geometry of Indian urban architecture — balconies, jaali patterns, windows, and dancing shadows.","dimensions":"48\" × 36\"","cat_clean":"Modern Art","image":"modern-urban.jpg","svg":"urban-geometry.svg"},
  {"id":25,"name":"Minimalist Lotus","slug":"minimalist-lotus","category":"modern-art","price":15999,"description":"Clean, contemporary line art of a blooming lotus. Single continuous stroke style on textured paper — framed in minimalist elegance.","dimensions":"24\" × 36\"","cat_clean":"Modern Art","image":"modern-lotus.jpg","svg":"minimalist-lotus.svg"},
  {"id":26,"name":"Ornate Opulence","slug":"ornate-opulence","category":"wall-decor","price":18999,"description":"A stunning decorative piece with rich golden tones and intricate ornamental detailing — designed to become the crown jewel of your wall.","dimensions":"36\" × 48\"","cat_clean":"Wall Decor","image":"wall-decor_12.jpg","svg":"ornate-opulence.svg"},
  {"id":27,"name":"Set of 3 — Earth Triptych","slug":"set-of-3-earth-triptych","category":"wall-decor","price":24999,"description":"A trio of textured abstract landscapes — earth, water, and sky — designed to span an entire wall with seamless flow across three panels.","dimensions":"3 x 24\" × 36\"","cat_clean":"Wall Decor","image":"wall-triptych.jpg","svg":"set-of-3-earth-triptych.svg"},
  {"id":28,"name":"Mandala Metal Wall Art","slug":"mandala-metal-wall-art","category":"wall-decor","price":6999,"description":"Laser-cut mandala in powder-coated iron with a hand-patinated copper finish. Intricate geometric pattern casts stunning shadow plays on your wall.","dimensions":"24\" diameter","cat_clean":"Wall Decor","image":"wall-mandala.jpg","svg":"mandala-metal-wall-art.svg"},
]

# Blog data matching products.js
blog_posts_data = [
    {"id":1,"title":"What Is Lippan Art? India's Ancient Mirror Craft Explained","slug":"what-is-lippan-art-india","category":"Lippan Art","readTime":6,"date":"Jan 15, 2026","excerpt":"Discover the centuries-old tradition of Lippan Art — the mud-and-mirror craft from Kutch, Gujarat. Learn how this ancient technique is being reimagined for modern Indian homes.","image":"blog-lippan-intro.jpg","svg":"blog-lippan-intro.svg"},
    {"id":2,"title":"Modern Lippan Wall Decor: 7 Stunning Ideas for Your Home","slug":"modern-lippan-wall-decor-ideas","category":"Home Decor","readTime":8,"date":"Jan 22, 2026","excerpt":"From minimalist white-and-gold compositions to bold terracotta statements — explore 7 modern lippan wall decor ideas that transform any room into a gallery.","image":"blog-lippan-decor.jpg","svg":"blog-lippan-decor.svg"},
    {"id":3,"title":"Lippan Art vs Warli Art: Key Differences Every Art Lover Should Know","slug":"lippan-art-vs-warli-art","category":"Art Guide","readTime":5,"date":"Feb 1, 2026","excerpt":"Two of India's most beloved folk art forms — Lippan and Warli — explained. Materials, techniques, origins, and which one suits your space better.","image":"blog-lippan-vs-warli.jpg","svg":"blog-lippan-vs-warli.svg"},
    {"id":4,"title":"How to Display Lippan Art in Your Home: A Complete Guide","slug":"how-to-display-lippan-art-home","category":"Home Decor","readTime":7,"date":"Feb 10, 2026","excerpt":"Lighting, placement, framing, and pairing tips for lippan art. Make your mirror-work pieces shine with these expert display strategies.","image":"blog-display-guide.jpg","svg":"blog-display-guide.svg"},
    {"id":5,"title":"Lippan Art Gift Guide: 5 Unique Indian Handicraft Gifts for Every Occasion","slug":"lippan-art-gift-guide","category":"Gifting","readTime":6,"date":"Feb 18, 2026","excerpt":"Looking for a meaningful gift? From housewarming to weddings — lippan art pieces make unforgettable, handcrafted presents that tell a story.","image":"blog-gift-guide.jpg","svg":"blog-gift-guide.svg"},
]

def fmt_price(n):
    s = "{:,}".format(n)
    return "\u20B9" + s

for p in products:
    jpg = p["image"]
    svg = p["svg"]
    pdir = os.path.join(BASE, "product", p["slug"])
    os.makedirs(pdir, exist_ok=True)

    cat_lower = p["category"].replace("-", " ")
    canonical = "https://mittiart.com/product/{}/".format(p['slug'])

    add_to_cart_html = '<button class="btn btn-primary" onclick="addToCart({id:' + str(p['id']) + ",name:'" + p['name'].replace("'", "\\'") + "',price:" + str(p['price']) + ",image:'../images/optimized/" + jpg + "'})" + '">Add to collection</button>'

    # Build JSON-LD product schema
    schema_name = p['name'].replace('"', '\\"')
    schema_desc = p['description'].replace('"', '\\"')

    html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>''' + p['name'] + ''' — MITTI Art Gallery | ''' + p['cat_clean'] + '''</title>
  <meta name="description" content="''' + p['description'][:120] + '''" />
  <link rel="canonical" href="''' + canonical + '''" />
  <meta property="og:title" content="''' + p['name'] + ''' — MITTI Art Gallery" />
  <meta property="og:description" content="''' + p['description'][:120] + '''" />
  <meta property="og:type" content="product" />
  <meta property="og:url" content="''' + canonical + '''" />
  <meta property="og:image" content="https://mittiart.com/images/optimized/''' + jpg + '''" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="''' + p['name'] + ''' — MITTI Art Gallery" />
  <meta name="twitter:description" content="''' + p['description'][:120] + '''" />
  <meta name="twitter:image" content="https://mittiart.com/images/optimized/''' + jpg + '''" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "''' + schema_name + '''",
    "description": "''' + schema_desc + '''",
    "image": "https://mittiart.com/images/optimized/''' + jpg + '''",
    "category": "''' + p['cat_clean'] + '''",
    "offers": {
      "@type": "Offer",
      "price": "''' + str(p['price']) + '''",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "url": "''' + canonical + '''"
    }
  }
  </script>
  <link rel="stylesheet" href="../css/style.css" />
  <link rel="icon" href="../favicon.svg" />
</head>
<body>
  <nav id="navbar">
    <div class="nav-inner">
      <a href="../" class="logo">MI<span>TTI</span><span class="logo-tagline">Earth &middot; Art &middot; Belonging</span></a>
      <button id="hamburger" aria-label="Toggle menu"><span></span><span></span><span></span></button>
      <ul class="nav-links" id="navLinks">
        <li><a href="../#gallery" class="nav-link">Gallery</a></li>
        <li><a href="../#categories" class="nav-link">Categories</a></li>
        <li><a href="../#featured" class="nav-link">Featured</a></li>
        <li><a href="../#about" class="nav-link">About</a></li>
        <li><a href="../#contact" class="nav-link">Contact</a></li>
        <li><a href="../blog/" class="nav-link">Blog</a></li>
        <li><button id="cartBtn"><span>&#128722;</span><span id="cartBadge">0</span></button></li>
      </ul>
    </div>
  </nav>

  <main class="product-page">
    <div class="container">
      <div class="product-detail">
        <div class="product-detail-image">
          <img id="mainProductImg" src="../images/optimized/''' + jpg + '''" alt="''' + p['name'] + ' - ' + p['cat_clean'] + ''' by MITTI" />
        </div>
        <div class="product-detail-info">
          <div class="product-detail-category">''' + cat_lower + '''</div>
          <h1 class="product-detail-name">''' + p['name'] + '''</h1>
          <div class="product-detail-price">''' + fmt_price(p['price']) + '''</div>
          <div class="product-detail-dimensions">''' + p['dimensions'] + '''</div>
          <p class="product-detail-desc">''' + p['description'] + '''</p>
          <div class="product-detail-actions">
            ''' + add_to_cart_html + '''
            <a href="../#gallery" class="btn btn-secondary">Back to gallery</a>
          </div>
          <div class="product-detail-share">
            <span>Share</span>
            <a href="https://www.facebook.com/sharer/sharer.php?u=''' + canonical + '''" target="_blank">Facebook</a>
            <a href="https://twitter.com/intent/tweet?text=''' + p['name'] + ''' by MITTI&amp;url=''' + canonical + '''" target="_blank">Twitter</a>
            <a href="https://pinterest.com/pin/create/button/?url=''' + canonical + '''&amp;media=https://mittiart.com/images/optimized/''' + jpg + '''&amp;description=''' + p['name'] + '''" target="_blank">Pinterest</a>
            <a href="https://api.whatsapp.com/send?text=''' + p['name'] + ''' - ''' + canonical + '''" target="_blank">WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  </main>

  <footer class="footer" style="margin-top:3rem">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <div class="footer-logo">MI<span>TTI</span></div>
          <p class="footer-tagline">From earth, for the wall. MITTI brings authentic Indian handcrafted art to your home.</p>
        </div>
        <div><h4>Explore</h4><ul class="footer-links"><li><a href="../#gallery">Gallery</a></li><li><a href="../#categories">Categories</a></li><li><a href="../#featured">Featured</a></li><li><a href="../blog/">Blog</a></li></ul></div>
        <div><h4>Support</h4><ul class="footer-links"><li><a href="../faq/">FAQ</a></li><li><a href="../shipping/">Shipping</a></li><li><a href="../payment/">Payment</a></li><li><a href="../#contact">Contact</a></li></ul></div>
        <div><h4>Connect</h4><ul class="footer-links"><li><a href="https://instagram.com/mittiart">Instagram</a></li><li><a href="https://facebook.com/mittiart">Facebook</a></li><li><a href="https://pinterest.com/mittiart">Pinterest</a></li></ul></div>
      </div>
      <div class="footer-bottom">&copy; 2026 MITTI Art Gallery. Made with earth in India.</div>
    </div>
  </footer>

  <div class="toast" id="toast"></div>
  <script src="../js/products.js"></script>
  <script src="../js/main.js"></script>
  <script>
    (function() {
      var img = document.getElementById('mainProductImg');
      var fbIdx = 0;
      var fbSources = ['../images/optimized/''' + jpg + '''', '../images/svg/''' + svg + ''''];
      img.onerror = function() {
        fbIdx++;
        if (fbIdx === 1 && fbSources[1]) { this.src = fbSources[1]; }
        else {
          this.style.display = 'none';
          var parent = this.parentNode;
          if (parent) {
            parent.style.background = '#3A3028';
            parent.style.minHeight = '300px';
            parent.style.display = 'flex';
            parent.style.alignItems = 'center';
            parent.style.justifyContent = 'center';
            var fbEl = document.createElement('div');
            fbEl.style.cssText = 'text-align:center;color:rgba(242,235,224,0.5);padding:40px;';
            fbEl.innerHTML = '<div style="font-size:3rem;margin-bottom:12px;opacity:0.6;">&#127912;</div><div style="font-size:0.85rem;text-transform:uppercase;letter-spacing:1px;">''' + p['name'] + '''</div>';
            parent.appendChild(fbEl);
          }
        }
      };
    })();
  </script>
</body>
</html>'''

    with open(os.path.join(pdir, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    print("OK product/{}/index.html".format(p['slug']))

# ===== BLOG INDEX =====
blog_index = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MITTI Blog &mdash; Art Stories, Guides &amp; Inspiration | MITTI Art Gallery</title>
  <meta name="description" content="Explore the MITTI art blog &mdash; stories about lippan art, Indian handicrafts, home decor ideas, and the artists behind the work." />
  <link rel="canonical" href="https://mittiart.com/blog/" />
  <meta property="og:title" content="MITTI Blog &mdash; Art Stories, Guides &amp; Inspiration" />
  <meta property="og:description" content="Explore the MITTI art blog &mdash; stories about lippan art, Indian handicrafts, and home decor ideas." />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://mittiart.com/blog/" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "MITTI Art Blog",
    "description": "Stories, guides, and inspiration from MITTI Art Gallery.",
    "url": "https://mittiart.com/blog/"
  }
  </script>
  <link rel="stylesheet" href="../css/style.css" />
  <link rel="icon" href="../favicon.svg" />
</head>
<body>
  <nav id="navbar">
    <div class="nav-inner">
      <a href="../" class="logo">MI<span>TTI</span><span class="logo-tagline">Earth &middot; Art &middot; Belonging</span></a>
      <button id="hamburger"><span></span><span></span><span></span></button>
      <ul class="nav-links">
        <li><a href="../#gallery" class="nav-link">Gallery</a></li>
        <li><a href="../#categories" class="nav-link">Categories</a></li>
        <li><a href="../#about" class="nav-link">About</a></li>
        <li><a href="../#contact" class="nav-link">Contact</a></li>
        <li><a href="../" class="nav-link">Home</a></li>
        <li><button id="cartBtn"><span>&#128722;</span><span id="cartBadge">0</span></button></li>
      </ul>
    </div>
  </nav>

  <div class="blog-post-page">
    <h1 style="margin-bottom:0.5rem">From the studio</h1>
    <p style="color:var(--text-muted);margin-bottom:2.5rem">Stories, guides, and inspiration from MITTI</p>
    <div class="blog-grid" id="blogGrid"></div>
  </div>

  <footer class="footer" style="margin-top:2rem">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand"><div class="footer-logo">MI<span>TTI</span></div><p class="footer-tagline">From earth, for the wall.</p></div>
        <div><h4>Explore</h4><ul class="footer-links"><li><a href="../#gallery">Gallery</a></li><li><a href="../blog/">Blog</a></li></ul></div>
        <div><h4>Support</h4><ul class="footer-links"><li><a href="../faq/">FAQ</a></li><li><a href="../shipping/">Shipping</a></li><li><a href="../payment/">Payment</a></li></ul></div>
        <div><h4>Connect</h4><ul class="footer-links"><li><a href="https://instagram.com/mittiart">Instagram</a></li><li><a href="https://facebook.com/mittiart">Facebook</a></li></ul></div>
      </div>
      <div class="footer-bottom">&copy; 2026 MITTI Art Gallery.</div>
    </div>
  </footer>

  <div class="toast" id="toast"></div>
  <script src="../js/products.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>'''

with open(os.path.join(BASE, "blog", "index.html"), "w", encoding="utf-8") as f:
    f.write(blog_index)
print("OK blog/index.html")

# ===== BLOG POST PAGES =====
blog_contents = {
    "what-is-lippan-art-india": """
<p>India's artistic heritage is vast and varied, with each region contributing its own unique craft traditions. Among these, <strong>Lippan Art</strong> (also known as Lippan Kaam) stands out as a stunning example of how humble materials &mdash; mud, clay, and mirrors &mdash; can be transformed into breathtaking wall art.</p>

<h2>What Is Lippan Art?</h2>
<p>Lippan Art is a traditional mud-and-mirror craft originating from the <strong>Kutch region of Gujarat</strong>, India. The word "Lippan" comes from the Gujarati word "Lippan Kaam" (&lambda;&iota;&pi;&alpha;&nu; &kappa;&alpha;&alpha;&mu;), meaning "the work of plastering" &mdash; referencing the technique of applying a mixture of clay, dung, and natural binders onto fabric or wood to create intricate raised patterns embedded with small mirrors (called "abhla" or "sheesha").</p>

<h2>The History Behind the Craft</h2>
<p>Lippan art has been practised for centuries by the <strong>Maldhari and Rabari communities</strong> of Kutch. Originally, women would decorate the interiors of their mud-bhunga (round huts) with lippan work to beautify their homes. The mirrors served both decorative and practical purposes &mdash; they reflected light into the dark, windowless interiors and were believed to ward off evil spirits.</p>

<p>What was once a domestic craft passed down through generations of women has now become a celebrated art form recognised worldwide.</p>

<h2>How Lippan Art Is Made</h2>
<p>The traditional process is labour-intensive and deeply connected to the earth:</p>
<ul>
  <li><strong>Base preparation:</strong> A mixture of locally sourced clay, camel dung (or cow dung), and chopped hay is prepared &mdash; creating a natural plaster that dries hard and durable.</li>
  <li><strong>Design tracing:</strong> Patterns inspired by nature, geometric shapes, and spiritual symbols are traced onto the base.</li>
  <li><strong>Mirror inlay:</strong> Small, hand-cut mirrors are pressed into the wet clay at specific points to catch and reflect light.</li>
  <li><strong>Drying and finishing:</strong> The piece is allowed to dry naturally in the sun. A final coat of white clay or natural pigment is applied to create contrast.</li>
</ul>

<h2>Modern Evolution</h2>
<p>Today, MITTI and other contemporary studios are reimagining Lippan Art for modern homes. While staying true to traditional techniques, we use modern materials like MDF boards, acrylic colours, and gold leaf to create pieces that blend seamlessly with contemporary interiors &mdash; from minimalist apartments to luxury villas.</p>

<h2>Why Lippan Art Belongs in Your Home</h2>
<ul>
  <li><strong>Texture &amp; depth:</strong> The raised clay patterns and mirror inlays create a tactile, three-dimensional effect that flat art cannot replicate.</li>
  <li><strong>Light play:</strong> Mirrors catch natural and artificial light, making the piece change throughout the day &mdash; alive with movement.</li>
  <li><strong>Cultural connection:</strong> Each piece carries centuries of tradition and the skill of artisans from one of India's most creative regions.</li>
  <li><strong>Conversation starter:</strong> Your guests will ask about it &mdash; and you'll have a beautiful story to tell.</li>
</ul>

<p>At MITTI, we work directly with Kutch artisans to bring you authentic lippan art that honours tradition while embracing modern design. Explore our collection and bring a piece of this ancient craft into your space.</p>
""",
    "modern-lippan-wall-decor-ideas": """
<p>Thinking of adding something unique to your walls? Forget generic framed prints &mdash; <strong>modern lippan art</strong> brings texture, light, and centuries of Indian craftsmanship into your home. Here are 7 ways to incorporate it into your decor.</p>

<h2>1. The Statement Focal Point</h2>
<p>Choose a large lippan piece (36" x 48" or larger) and let it dominate a feature wall &mdash; above a console table in the living room, behind the dining table, or at the end of a hallway. The mirror work will catch light from multiple angles, making it the room's natural centrepiece.</p>

<h2>2. Minimalist White &amp; Gold</h2>
<p>For modern and Scandinavian-style interiors, white lippan art with gold-leaf accents provides texture without visual clutter. The raised patterns create subtle shadows &mdash; a perfect balance between tradition and minimalism.</p>

<h2>3. Terracotta &amp; Teal &mdash; A Colour Story</h2>
<p>Pair warm terracotta clay lippan pieces with teal or navy walls for a rich, earthy contrast. This combination evokes Indian desert landscapes and brings a cosy, grounded energy to any room.</p>

<h2>4. Create a Lippan Gallery Wall</h2>
<p>Mix smaller lippan pieces (12"&ndash;18") with other textured wall elements &mdash; macram&eacute;, brass mirrors, or wooden masks. The variety of materials creates an eclectic, collected-over-time look.</p>

<h2>5. Bedroom Serenity</h2>
<p>Above the bed, a circular or mandala lippan piece can serve as an alternative to a traditional headboard. The mirrors provide soft reflected light &mdash; calming and meditative.</p>

<h2>6. Bathroom Spa Vibes</h2>
<p>Yes &mdash; lippan art in the bathroom! The natural clay and mirror texture creates an instant spa atmosphere. Opt for smaller, sealed pieces away from direct water contact.</p>

<h2>7. Custom Name or Mantra Art</h2>
<p>Personalised lippan pieces with names, family mottos, or Sanskrit mantras make meaningful gifts and powerful personal talismans. Each piece is entirely unique.</p>

<p>At MITTI, every lippan piece is handcrafted. No two are identical &mdash; because your home deserves art that's as individual as you are.</p>
""",
    "lippan-art-vs-warli-art": """
<p>India's folk art traditions are a treasure trove of visual storytelling. Two of the most beloved &mdash; <strong>Lippan Art</strong> and <strong>Warli Art</strong> &mdash; often find themselves compared. But while they share Indian roots, they are fundamentally different in material, technique, and spirit.</p>

<h2>Origin &amp; Region</h2>
<p><strong>Lippan Art</strong> comes from the Kutch district of Gujarat, created primarily by the Maldhari and Rabari communities.</p>
<p><strong>Warli Art</strong> originates from the Sahyadri region of Maharashtra, practised by the Warli tribe.</p>

<h2>Materials &amp; Technique</h2>
<p><strong>Lippan:</strong> A three-dimensional craft using a clay-dung plaster base with embedded mirrors. It is tactile, raised, and reflective. The process involves moulding wet clay, inlaying mirrors, and allowing the piece to dry naturally.</p>
<p><strong>Warli:</strong> A two-dimensional painting style using white pigment (rice paste + gum) on a dark brown or red ochre background. Figures are drawn in a distinctive stick-and-circle style &mdash; simple, graphic, and rhythmic.</p>

<h2>Visual Style</h2>
<p><strong>Lippan:</strong> Geometric patterns, mandalas, floral motifs, and symmetrical designs. The mirrors add sparkle and depth.</p>
<p><strong>Warli:</strong> Human figures, animals, hunting scenes, dances, and daily life. The style is primitive, narrative, and monochromatic &mdash; white on dark earth.</p>

<h2>Best Use in Your Home</h2>
<p><strong>Lippan:</strong> Makes striking wall art &mdash; best for living rooms, entryways, bedrooms, and meditation spaces. Its three-dimensional nature makes it a sculptural element.</p>
<p><strong>Warli:</strong> Works beautifully as framed art, murals, or even on fabric and pottery. Its narrative quality adds storytelling to any room.</p>

<h2>Which One Should You Choose?</h2>
<p>If you want <strong>texture, light, and sculptural presence</strong> &mdash; go with <strong>Lippan Art</strong>. It's ideal for contemporary spaces that need warmth and dimension.</p>
<p>If you prefer <strong>graphic simplicity, narrative charm, and cultural storytelling</strong> &mdash; choose <strong>Warli Art</strong>.</p>
<p>And if you love both? Mix them. An all-India art wall featuring both traditions is a beautiful celebration of the country's diverse creative heritage.</p>
""",
    "how-to-display-lippan-art-home": """
<p>So you've fallen in love with a piece of lippan art. Now comes the next question: <strong>how do you display it to best effect?</strong> Here's a complete guide &mdash; from lighting to placement &mdash; to make your mirror-work piece shine.</p>

<h2>Lighting Is Everything</h2>
<p>Lippan art was designed to interact with light. The mirrors embedded in the clay catch and scatter ambient light, creating a dynamic visual experience that changes throughout the day.</p>
<ul>
  <li><strong>Natural light:</strong> Place the piece where it receives indirect sunlight at different times of day. Morning and golden-hour light bring out warm tones in terracotta and white clay.</li>
  <li><strong>Accent lighting:</strong> A picture light or track light positioned at a 30-degree angle creates dramatic shadow patterns from the raised clay.</li>
  <li><strong>Backlighting (advanced):</strong> For larger pieces, LED backlighting behind the panel creates a stunning halo effect &mdash; the mirrors glow against the dark.</li>
</ul>

<h2>Wall Colour Matters</h2>
<p>The background wall colour dramatically affects how lippan art reads:</p>
<ul>
  <li><strong>Dark walls</strong> (deep blue, charcoal, forest green): Make the mirrors pop dramatically. The contrast is striking and the piece becomes a focal point.</li>
  <li><strong>Light walls</strong> (cream, warm grey, white): Emphasise the texture and raised patterns. More subtle, elegant, and minimalist.</li>
  <li><strong>Earthy walls</strong> (terracotta, ochre, sage): Create a harmonious monochromatic look where the piece blends with its environment.</li>
</ul>

<h2>Placement Guidelines</h2>
<ul>
  <li><strong>Eye level:</strong> The centre of the piece should be at 145&ndash;155 cm from the floor (typical art gallery height).</li>
  <li><strong>Space around it:</strong> Give lippan art breathing room &mdash; at least 15 cm clearance on each side.</li>
  <li><strong>Avoid direct sunlight:</strong> Prolonged direct UV exposure can fade natural clay pigments over time.</li>
  <li><strong>Avoid high-humidity areas:</strong> While sealed, lippan pieces are best kept away from direct steam sources.</li>
</ul>

<h2>Framing or Unframed?</h2>
<p>Most modern lippan pieces come mounted on a wooden or MDF board and can be hung directly. A floating frame adds a contemporary touch, while a shadow box frame creates additional depth. At MITTI, we deliver pieces ready to hang &mdash; no framing needed unless you want a specific look.</p>

<h2>Pairing with Other Art</h2>
<p>Lippan art pairs beautifully with brass accents, wooden decor, and indoor plants. Avoid pairing it with overly busy patterned wallpapers &mdash; the mirror work needs a calm background to shine.</p>
""",
    "lippan-art-gift-guide": """
<p>Looking for a gift that truly stands apart from mass-produced presents? <strong>Handcrafted lippan art</strong> is thoughtful, unique, and carries a story &mdash; making it one of the most meaningful Indian handicraft gifts you can give. Here's a guide to choosing the perfect piece for every occasion.</p>

<h2>1. Housewarming &mdash; The Welcome Piece</h2>
<p><strong>Recommended: Mirror Mandala or Terracotta &amp; Teal Harmony</strong></p>
<p>A piece of lippan art is more than decor &mdash; it's a blessing for the new home. The traditional mirror work is believed to reflect negative energy, making it a thoughtful and symbolic gift. Choose something that matches the new home's colour scheme.</p>

<h2>2. Weddings &mdash; The Heirloom Gift</h2>
<p><strong>Recommended: White &amp; Gold Celestial or Modern Lippan Mandala</strong></p>
<p>For weddings, go big and luxurious. White-and-gold lippan pieces with gold-leaf accents make stunning statement gifts that new couples will treasure for a lifetime. A large 36" x 48" piece becomes an instant family heirloom.</p>

<h2>3. Anniversaries &mdash; The Personal Touch</h2>
<p><strong>Recommended: Custom Name Lippan Art</strong></p>
<p>A personalised lippan piece with the couple's name, wedding date, or a meaningful mantra. It's one-of-a-kind &mdash; no one else in the world owns the same piece. This is the kind of gift that brings tears of joy.</p>

<h2>4. Diwali &amp; Festivals &mdash; The Auspicious Gift</h2>
<p><strong>Recommended: Traditional Kutch Geometric or Mirror Mandala</strong></p>
<p>During Indian festivals, lippan art makes an especially meaningful gift. The mirrors symbolise light and positivity &mdash; perfect for Diwali, Pongal, or Onam.</p>

<h2>5. Corporate Gifts &mdash; Premium Brand Impressions</h2>
<p><strong>Recommended: Set of 3 panels or Urban Geometry</strong></p>
<p>Impress clients and partners with a luxury Indian handicraft piece that reflects thoughtfulness and cultural appreciation. Custom branding options available for bulk orders.</p>

<h2>6. For the Art Lover Who Has Everything</h2>
<p><strong>Recommended: Abstract Lippan Fusion</strong></p>
<p>For someone whose walls are already filled with conventional art, an abstract lippan fusion piece offers something completely different &mdash; texture, dimension, and heritage all in one.</p>

<h2>Gift Wrapping &amp; Delivery</h2>
<p>Every MITTI piece is packed in custom wooden crating with bubble-wrap cushioning. We include a certificate of authenticity and care instructions &mdash; so your gift is ready to present as soon as it arrives.</p>
<p>Looking for the perfect lippan art gift? <a href="../#gallery">Browse our collection</a> or <a href="../#contact">contact us</a> for personalised recommendations.</p>
"""
}

for bp in blog_posts_data:
    pdir = os.path.join(BASE, "blog", bp["slug"])
    os.makedirs(pdir, exist_ok=True)
    content = blog_contents[bp["slug"]]

    html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>''' + bp['title'] + ''' &mdash; MITTI Art Blog</title>
  <meta name="description" content="''' + bp['excerpt'][:150] + '''" />
  <link rel="canonical" href="https://mittiart.com/blog/''' + bp['slug'] + '''/" />
  <meta property="og:title" content="''' + bp['title'] + '''" />
  <meta property="og:description" content="''' + bp['excerpt'][:150] + '''" />
  <meta property="og:type" content="article" />
  <meta property="og:url" content="https://mittiart.com/blog/''' + bp['slug'] + '''/" />
  <meta property="og:image" content="https://mittiart.com/images/optimized/''' + bp['image'] + '''" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="''' + bp['title'] + '''" />
  <meta name="twitter:description" content="''' + bp['excerpt'][:150] + '''" />
  <meta name="twitter:image" content="https://mittiart.com/images/optimized/''' + bp['image'] + '''" />
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": "''' + bp['title'] + '''",
    "description": "''' + bp['excerpt'][:150] + '''",
    "image": "https://mittiart.com/images/optimized/''' + bp['image'] + '''",
    "datePublished": "''' + bp['date'] + '''",
    "author": {
      "@type": "Organization",
      "name": "MITTI Art Gallery"
    },
    "publisher": {
      "@type": "Organization",
      "name": "MITTI Art Gallery"
    }
  }
  </script>
  <link rel="stylesheet" href="../../css/style.css" />
  <link rel="icon" href="../../favicon.svg" />
</head>
<body>
  <nav id="navbar">
    <div class="nav-inner">
      <a href="../../" class="logo">MI<span>TTI</span><span class="logo-tagline">Earth &middot; Art &middot; Belonging</span></a>
      <button id="hamburger"><span></span><span></span><span></span></button>
      <ul class="nav-links">
        <li><a href="../../#gallery" class="nav-link">Gallery</a></li>
        <li><a href="../../#categories" class="nav-link">Categories</a></li>
        <li><a href="../../#about" class="nav-link">About</a></li>
        <li><a href="../../#contact" class="nav-link">Contact</a></li>
        <li><a href="../../blog/" class="nav-link">Blog</a></li>
        <li><button id="cartBtn"><span>&#128722;</span><span id="cartBadge">0</span></button></li>
      </ul>
    </div>
  </nav>

  <article class="blog-post-page">
    <a href="../" class="blog-back">&larr; Back to blog</a>
    <div class="blog-post-meta">''' + bp['date'] + ''' &middot; ''' + str(bp['readTime']) + ''' min read &middot; ''' + bp['category'] + '''</div>
    <h1 class="blog-post-title">''' + bp['title'] + '''</h1>
    <div class="blog-post-image"><img src="../../images/optimized/''' + bp['image'] + '''" alt="''' + bp['title'] + '''" loading="lazy" onerror="this.parentElement.style.background=\'var(--clay-mid)\';this.parentElement.style.minHeight=\'250px\';this.style.display=\'none\'" /></div>
    <div class="blog-post-content">
      ''' + content + '''
    </div>
    <a href="../" class="blog-back">&larr; Back to blog</a>
  </article>

  <footer class="footer" style="margin-top:2rem">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand"><div class="footer-logo">MI<span>TTI</span></div><p class="footer-tagline">From earth, for the wall.</p></div>
        <div><h4>Explore</h4><ul class="footer-links"><li><a href="../../#gallery">Gallery</a></li><li><a href="../../blog/">Blog</a></li></ul></div>
        <div><h4>Support</h4><ul class="footer-links"><li><a href="../../faq/">FAQ</a></li><li><a href="../../shipping/">Shipping</a></li><li><a href="../../payment/">Payment</a></li></ul></div>
        <div><h4>Connect</h4><ul class="footer-links"><li><a href="https://instagram.com/mittiart">Instagram</a></li><li><a href="https://facebook.com/mittiart">Facebook</a></li></ul></div>
      </div>
      <div class="footer-bottom">&copy; 2026 MITTI Art Gallery.</div>
    </div>
  </footer>

  <div class="toast" id="toast"></div>
  <script src="../../js/products.js"></script>
  <script src="../../js/main.js"></script>
</body>
</html>'''

    with open(os.path.join(pdir, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    print("OK blog/{}/index.html".format(bp['slug']))

# ===== STATIC PAGES =====
pages = {
    "faq": ("FAQ &mdash; MITTI Art Gallery", [
        ("How do I place an order?", "You can browse our gallery and click 'Add to collection' on any piece. Your selections are saved in the cart. To place an order, please reach out via our contact form or email us at hello@mittiart.com with your cart items. We will confirm availability and send you payment details."),
        ("Do you ship internationally?", "Yes! We ship worldwide. Shipping costs vary by destination. We use reliable courier partners with tracking. International shipping typically takes 7&ndash;14 business days depending on the destination."),
        ("How are the artworks packaged?", "Each piece is carefully packed in a custom wooden crate with multiple layers of bubble wrap and foam cushioning. We take every precaution to ensure your artwork arrives in perfect condition."),
        ("What is your return policy?", "We want you to love your MITTI piece. If you're not completely satisfied, you can return it within 7 days of delivery for a full refund (minus shipping costs). The artwork must be returned in its original condition and packaging."),
        ("How long does delivery take?", "Domestic deliveries (India): 5&ndash;7 business days. International: 7&ndash;14 business days. Custom/personalised pieces may take 10&ndash;14 business days for crafting plus shipping time."),
        ("Can I customise a piece?", "Absolutely! We offer custom lippan art with names, mantras, or specific colour palettes. Custom pieces typically take 10&ndash;14 business days to craft. Contact us with your requirements."),
        ("How do I care for my lippan art?", "Dust gently with a soft, dry cloth. Avoid using water or cleaning chemicals on the clay surface. Keep away from direct sunlight for prolonged periods to preserve the natural pigments."),
        ("Do you offer bulk orders for corporate gifting?", "Yes, we offer special pricing for bulk/corporate orders. We can also add custom branding elements. Please reach out via our contact form or email us for a quote.")
    ]),
    "shipping": ("Shipping &amp; Delivery &mdash; MITTI Art Gallery", [
        ("Domestic Shipping (India)", "We ship to all states and union territories across India. Shipping is free on orders above &#8377;10,000. For orders below &#8377;10,000, a flat shipping fee of &#8377;199 applies. Delivery time: 5&ndash;7 business days."),
        ("International Shipping", "We ship to over 30 countries worldwide. International shipping costs are calculated based on destination, weight, and dimensions. You will see the cost before confirming your order. Delivery time: 7&ndash;14 business days."),
        ("Packaging", "All artworks are packed in custom wooden crates with acid-free tissue paper wrapping, multiple layers of bubble wrap, foam corner protectors, and a sturdy wooden crate exterior with 'Fragile' handling labels. We've shipped over 500 pieces with zero damage."),
        ("Tracking", "Every order comes with a tracking number that is shared with you as soon as the shipment is dispatched. You can track your package in real-time through our courier partner's website."),
        ("Delivery Timeline", "In-stock pieces: Dispatched within 2&ndash;3 business days. Custom/personalised pieces: Crafting takes 10&ndash;14 business days plus shipping time. You will receive a dispatch confirmation email with tracking details."),
        ("Customs &amp; Duties (International)", "International customers are responsible for any customs duties, import taxes, or brokerage fees applicable in their country. Please check with your local customs office before ordering.")
    ]),
    "payment": ("Payment Information &mdash; MITTI Art Gallery", [
        ("Accepted Payment Methods", "We accept UPI (Google Pay, PhonePe, Paytm), Bank Transfer/NEFT/IMPS, Credit &amp; Debit Cards (Visa, Mastercard, RuPay), Net Banking, and PayPal (for international customers)."),
        ("Payment Process", "After you place an order through our contact form, we will send you a payment link or invoice via email. Once payment is confirmed, we begin processing your order."),
        ("Secure Payments", "All payments are processed through secure, encrypted payment gateways. We do not store any card or banking information on our servers."),
        ("Currency", "All prices on our website are listed in Indian Rupees (&#8377;/INR). For international customers, your bank will convert the amount at their applicable exchange rate."),
        ("Payment Terms", "Full payment is required before dispatch. For custom orders over &#8377;15,000, a 50% advance may be required to begin crafting, with the balance due before shipping."),
        ("Refunds &amp; Cancellations", "Orders can be cancelled within 24 hours of placement for a full refund. After 24 hours, cancellation charges may apply if the order is already in processing. Refunds are processed within 5&ndash;7 business days to the original payment method.")
    ])
}

for slug, (title, qa_list) in pages.items():
    pdir = os.path.join(BASE, slug)
    os.makedirs(pdir, exist_ok=True)
    content_html = ""
    for q, a in qa_list:
        content_html += "<h2>" + q + "</h2>\n<p>" + a + "</p>\n"

    html = '''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>''' + title + ''' | MITTI Art Gallery</title>
  <meta name="description" content="''' + ('FAQ about MITTI Art Gallery' if slug == 'faq' else 'Shipping and delivery information for MITTI Art Gallery' if slug == 'shipping' else 'Payment methods and information for MITTI Art Gallery') + '''." />
  <link rel="canonical" href="https://mittiart.com/''' + slug + '''/" />
  <meta property="og:title" content="''' + title + '''" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://mittiart.com/''' + slug + '''/" />
  <link rel="stylesheet" href="../css/style.css" />
  <link rel="icon" href="../favicon.svg" />
</head>
<body>
  <nav id="navbar">
    <div class="nav-inner">
      <a href="../" class="logo">MI<span>TTI</span><span class="logo-tagline">Earth &middot; Art &middot; Belonging</span></a>
      <button id="hamburger"><span></span><span></span><span></span></button>
      <ul class="nav-links">
        <li><a href="../#gallery" class="nav-link">Gallery</a></li>
        <li><a href="../#categories" class="nav-link">Categories</a></li>
        <li><a href="../#about" class="nav-link">About</a></li>
        <li><a href="../#contact" class="nav-link">Contact</a></li>
        <li><a href="../blog/" class="nav-link">Blog</a></li>
        <li><button id="cartBtn"><span>&#128722;</span><span id="cartBadge">0</span></button></li>
      </ul>
    </div>
  </nav>

  <main class="static-page">
    <h1>''' + title.split(" &mdash; ")[0] + '''</h1>
    ''' + content_html + '''
    <a href="../" class="blog-back">&larr; Back to home</a>
  </main>

  <footer class="footer" style="margin-top:2rem">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand"><div class="footer-logo">MI<span>TTI</span></div><p class="footer-tagline">From earth, for the wall.</p></div>
        <div><h4>Explore</h4><ul class="footer-links"><li><a href="../#gallery">Gallery</a></li><li><a href="../blog/">Blog</a></li></ul></div>
        <div><h4>Support</h4><ul class="footer-links"><li><a href="../faq/">FAQ</a></li><li><a href="../shipping/">Shipping</a></li><li><a href="../payment/">Payment</a></li></ul></div>
        <div><h4>Connect</h4><ul class="footer-links"><li><a href="https://instagram.com/mittiart">Instagram</a></li><li><a href="https://facebook.com/mittiart">Facebook</a></li></ul></div>
      </div>
      <div class="footer-bottom">&copy; 2026 MITTI Art Gallery.</div>
    </div>
  </footer>

  <script src="../js/products.js"></script>
  <script src="../js/main.js"></script>
</body>
</html>'''

    with open(os.path.join(pdir, "index.html"), "w", encoding="utf-8") as f:
        f.write(html)
    print("OK {}/index.html".format(slug))

print("\nDONE: All pages generated successfully!")
