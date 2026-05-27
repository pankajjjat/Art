// ===== MITTI (मिट्टी) — Product Catalog (auto-generated from data/products.json) =====
// JPG-primary architecture with DOM-based SVG fallback
// Fallback chain: JPG → SVG → category gradient placeholder

const products = [
  {
    id: 1, name: "Mountain Vista", slug: "mountain-vista", category: "landscapes",
    price: 12999,
    description: "A breathtaking panoramic landscape capturing the golden hour over majestic mountain peaks and serene waters — where earth meets sky in perfect stillness.",
    image: "images/optimized/landscapes_1.jpg",
    imageFallback: "images/svg/mountain-vista.svg",
    featured: true, dimensions: '30" × 40"', inStock: true
  },
  {
    id: 2, name: "Midnight Solitude", slug: "midnight-solitude", category: "landscapes",
    price: 8999,
    description: "A moody nocturnal landscape bathed in moonlight, evoking a sense of quiet contemplation and mystery. The stars mirror the stillness within.",
    image: "images/optimized/landscapes_5.jpg",
    imageFallback: "images/svg/midnight-solitude.svg",
    featured: false, dimensions: '24" × 36"', inStock: true
  },
  {
    id: 3, name: "Forest Canopy", slug: "forest-canopy", category: "landscapes",
    price: 10999,
    description: "Sunlight filtering through a dense forest canopy, painting the forest floor in dappled gold and emerald — nature’s own stained glass.",
    image: "images/optimized/landscapes_9.jpg",
    imageFallback: "images/svg/forest-canopy.svg",
    featured: true, dimensions: '28" × 36"', inStock: true
  },
  {
    id: 4, name: "Golden Pastoral", slug: "golden-pastoral", category: "landscapes",
    price: 7499,
    description: "A warm pastoral scene bathed in golden sunlight — rolling fields and gentle skies captured at the perfect hour when the world turns to amber.",
    image: "images/optimized/landscapes_13.jpg",
    imageFallback: "images/svg/golden-pastoral.svg",
    featured: false, dimensions: '20" × 28"', inStock: true
  },
  {
    id: 5, name: "Ethereal Mist", slug: "ethereal-mist", category: "abstract",
    price: 6999,
    description: "A soft, minimalist abstract composition where muted tones blend like morning mist over still waters — quiet, contemplative, essential.",
    image: "images/optimized/abstract_2.jpg",
    imageFallback: "images/svg/ethereal-mist.svg",
    featured: false, dimensions: '18" × 24"', inStock: true
  },
  {
    id: 6, name: "Earthen Flow", slug: "earthen-flow", category: "abstract",
    price: 8499,
    description: "Warm earth tones converge in flowing organic patterns, inspired by natural textures and geological formations carved over millennia.",
    image: "images/optimized/abstract_3.jpg",
    imageFallback: "images/svg/earthen-flow.svg",
    featured: true, dimensions: '24" × 30"', inStock: true
  },
  {
    id: 7, name: "Textured Rhythms", slug: "textured-rhythms", category: "abstract",
    price: 9999,
    description: "A richly textured abstract piece where layered vertical rhythms create depth, movement, and visual intrigue — a meditation in monochrome.",
    image: "images/optimized/abstract_7.jpg",
    imageFallback: "images/svg/textured-rhythms.svg",
    featured: false, dimensions: '28" × 36"', inStock: true
  },
  {
    id: 8, name: "Golden Cascade", slug: "golden-cascade", category: "abstract",
    price: 14999,
    description: "A luminous golden abstract where cascading warm tones meet subtle texture — a statement piece that transforms any space with its quiet radiance.",
    image: "images/optimized/abstract_11.jpg",
    imageFallback: "images/svg/golden-cascade.svg",
    featured: true, dimensions: '36" × 48"', inStock: true
  },
  {
    id: 9, name: "Mirror Mandala", slug: "mirror-mandala", category: "lippan-art",
    price: 5999,
    description: "Intricate handcrafted lippan art featuring a traditional mandala pattern with embedded mirror work that catches and reflects light beautifully.",
    image: "images/optimized/lippan-art_6.jpg",
    imageFallback: "images/svg/mirror-mandala.svg",
    featured: true, dimensions: '18" × 18"', inStock: true
  },
  {
    id: 10, name: "Geometric Radiance", slug: "geometric-radiance", category: "lippan-art",
    price: 7499,
    description: "A contemporary lippan art piece blending traditional mirror inlay with bold geometric patterns — a brilliant fusion of heritage and modern design.",
    image: "images/optimized/lippan-art_10.jpg",
    imageFallback: "images/svg/geometric-radiance.svg",
    featured: false, dimensions: '24" × 24"', inStock: true
  },
  {
    id: 11, name: "Urban Layers", slug: "urban-layers", category: "modern-art",
    price: 11999,
    description: "An evocative cityscape where layered architectural forms and geometric compositions capture the restless energy of urban life.",
    image: "images/optimized/modern-art_4.jpg",
    imageFallback: "images/svg/urban-layers.svg",
    featured: true, dimensions: '30" × 40"', inStock: true
  },
  {
    id: 12, name: "Modern Symmetry", slug: "modern-symmetry", category: "modern-art",
    price: 9999,
    description: "Clean lines and balanced architectural forms create a meditative modern art piece that brings sophisticated calm to any interior.",
    image: "images/optimized/modern-art_8.jpg",
    imageFallback: "images/svg/modern-symmetry.svg",
    featured: false, dimensions: '24" × 36"', inStock: true
  },
  {
    id: 13, name: "Ornate Opulence", slug: "ornate-opulence", category: "wall-decor",
    price: 18999,
    description: "A stunning decorative piece with rich golden tones and intricate ornamental detailing — designed to become the crown jewel of your wall.",
    image: "images/optimized/wall-decor_12.jpg",
    imageFallback: "images/svg/ornate-opulence.svg",
    featured: true, dimensions: '36" × 48"', inStock: true
  },
];

// Categories metadata (auto-generated)
const categories = [
  { id: "landscapes", name: "Landscapes", count: 4, image: "images/optimized/landscapes_1.jpg" },
  { id: "abstract", name: "Abstract", count: 4, image: "images/optimized/abstract_2.jpg" },
  { id: "lippan-art", name: "Lippan Art", count: 2, image: "images/optimized/lippan-art_6.jpg" },
  { id: "modern-art", name: "Modern Art", count: 2, image: "images/optimized/modern-art_4.jpg" },
  { id: "wall-decor", name: "Wall Decor", count: 1, image: "images/optimized/wall-decor_12.jpg" },
];

// Blog posts (auto-generated)
const blogPosts = [
  {
    id: 1,
    title: "What Is Lippan Art? India's Ancient Mirror Craft Explained",
    slug: "what-is-lippan-art-india",
    url: "blog/what-is-lippan-art-india/",
    category: "Lippan Art",
    readTime: 6,
    date: "Jan 15, 2026",
    excerpt: "Discover the centuries-old tradition of Lippan Art — the mud-and-mirror craft from Kutch, Gujarat. Learn how this ancient technique is being reimagined for modern Indian homes.",
    image: "images/optimized/blog-lippan-intro.jpg",
    imageFallback: "images/svg/blog-lippan-intro.svg"
  },
  {
    id: 2,
    title: "Modern Lippan Wall Decor: 7 Stunning Ideas for Your Home",
    slug: "modern-lippan-wall-decor-ideas",
    url: "blog/modern-lippan-wall-decor-ideas/",
    category: "Home Decor",
    readTime: 8,
    date: "Jan 22, 2026",
    excerpt: "From minimalist white-and-gold compositions to bold terracotta statements — explore 7 modern lippan wall decor ideas that transform any room into a gallery.",
    image: "images/optimized/blog-lippan-decor.jpg",
    imageFallback: "images/svg/blog-lippan-decor.svg"
  },
  {
    id: 3,
    title: "Lippan Art vs Warli Art: Key Differences Every Art Lover Should Know",
    slug: "lippan-art-vs-warli-art",
    url: "blog/lippan-art-vs-warli-art/",
    category: "Art Guide",
    readTime: 5,
    date: "Feb 1, 2026",
    excerpt: "Two of India’s most beloved folk art forms — Lippan and Warli — explained. Materials, techniques, origins, and which one suits your space better.",
    image: "images/optimized/blog-lippan-vs-warli.jpg",
    imageFallback: "images/svg/blog-lippan-vs-warli.svg"
  },
  {
    id: 4,
    title: "How to Display Lippan Art in Your Home: A Complete Guide",
    slug: "how-to-display-lippan-art-home",
    url: "blog/how-to-display-lippan-art-home/",
    category: "Home Decor",
    readTime: 7,
    date: "Feb 10, 2026",
    excerpt: "Lighting, placement, framing, and pairing tips for lippan art. Make your mirror-work pieces shine with these expert display strategies.",
    image: "images/optimized/blog-display-guide.jpg",
    imageFallback: "images/svg/blog-display-guide.svg"
  },
  {
    id: 5,
    title: "Lippan Art Gift Guide: 5 Unique Indian Handicraft Gifts for Every Occasion",
    slug: "lippan-art-gift-guide",
    url: "blog/lippan-art-gift-guide/",
    category: "Gifting",
    readTime: 6,
    date: "Feb 18, 2026",
    excerpt: "Looking for a meaningful gift? From housewarming to weddings — lippan art pieces make unforgettable, handcrafted presents that tell a story.",
    image: "images/optimized/blog-gift-guide.jpg",
    imageFallback: "images/svg/blog-gift-guide.svg"
  },
];