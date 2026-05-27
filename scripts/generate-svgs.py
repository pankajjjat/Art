#!/usr/bin/env python3
"""Generate SVG fallback images for MITTI products that don't have them."""

import os

SVG_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'images', 'svg')
os.makedirs(SVG_DIR, exist_ok=True)

# Category color palettes for SVGs
PALETTES = {
    'lippan-art': {'bg': '#1a0800', 'primary': '#c6663d', 'secondary': '#d4a056', 'accent': '#f0e6da'},
    'abstract':   {'bg': '#1a1200', 'primary': '#8B3A2A', 'secondary': '#c25a3c', 'accent': '#e0b470'},
    'landscapes': {'bg': '#0a1a10', 'primary': '#2a5a3a', 'secondary': '#4a8a5a', 'accent': '#d4a056'},
    'modern':     {'bg': '#0c0806', 'primary': '#2a2a3a', 'secondary': '#4a4a5a', 'accent': '#f0e6da'},
    'wall-decor': {'bg': '#0c0800', 'primary': '#5a3a21', 'secondary': '#8a5a31', 'accent': '#f0e6da'},
}

def svg_lippan(name, colors):
    """Generate a lippan-art style SVG with mirror dots and clay textures."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<defs>
  <radialGradient id="bg"><stop offset="0%" stop-color="{colors['primary']}"/><stop offset="100%" stop-color="{colors['bg']}"/></radialGradient>
  <radialGradient id="mirror"><stop offset="0%" stop-color="#fff" stop-opacity=".8"/><stop offset="100%" stop-color="{colors['secondary']}" stop-opacity=".3"/></radialGradient>
</defs>
<rect width="800" height="600" fill="url(#bg)"/>
<circle cx="400" cy="300" r="140" fill="url(#mirror)" opacity=".6"/>
<circle cx="400" cy="300" r="100" fill="none" stroke="{colors['accent']}" stroke-width="2" opacity=".4"/>
<circle cx="400" cy="300" r="60" fill="url(#mirror)" opacity=".5"/>
<circle cx="340" cy="240" r="10" fill="{colors['accent']}" opacity=".6"/>
<circle cx="460" cy="240" r="10" fill="{colors['accent']}" opacity=".6"/>
<circle cx="340" cy="360" r="10" fill="{colors['accent']}" opacity=".6"/>
<circle cx="460" cy="360" r="10" fill="{colors['accent']}" opacity=".6"/>
<circle cx="280" cy="300" r="6" fill="{colors['accent']}" opacity=".4"/>
<circle cx="520" cy="300" r="6" fill="{colors['accent']}" opacity=".4"/>
<path d="M400,160 L440,240 L520,250 L460,310 L480,390 L400,340 L320,390 L340,310 L280,250 L360,240 Z" fill="none" stroke="{colors['accent']}" stroke-width="1" opacity=".3"/>
</svg>'''

def svg_abstract(name, colors):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="{colors['bg']}"/><stop offset="100%" stop-color="{colors['primary']}"/></linearGradient>
  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="{colors['secondary']}" stop-opacity=".5"/><stop offset="100%" stop-color="transparent"/></linearGradient>
</defs>
<rect width="800" height="600" fill="url(#bg)"/>
<ellipse cx="400" cy="350" rx="250" ry="150" fill="url(#g1)"/>
<path d="M0,200 Q200,100 400,200 T800,150" fill="none" stroke="{colors['accent']}" stroke-width="2" opacity=".15"/>
<path d="M0,300 Q200,250 400,350 T800,280" fill="none" stroke="{colors['accent']}" stroke-width="1.5" opacity=".2"/>
<path d="M0,450 Q250,350 450,450 T800,400" fill="none" stroke="{colors['secondary']}" stroke-width="1" opacity=".3"/>
<circle cx="250" cy="220" r="80" fill="{colors['accent']}" opacity=".05"/>
<circle cx="550" cy="400" r="60" fill="{colors['accent']}" opacity=".05"/>
</svg>'''

def svg_landscape(name, colors):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<defs>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="{colors['bg']}"/><stop offset="100%" stop-color="{colors['primary']}"/></linearGradient>
  <linearGradient id="sun" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="{colors['accent']}" stop-opacity=".4"/><stop offset="100%" stop-color="transparent"/></linearGradient>
</defs>
<rect width="800" height="600" fill="url(#sky)"/>
<polygon points="0,350 120,150 250,350" fill="{colors['secondary']}" opacity=".5"/>
<polygon points="150,400 350,100 550,400" fill="{colors['primary']}" opacity=".6"/>
<polygon points="400,450 600,200 800,450" fill="{colors['secondary']}" opacity=".4"/>
<circle cx="650" cy="120" r="50" fill="url(#sun)"/>
<ellipse cx="400" cy="480" rx="350" ry="80" fill="{colors['accent']}" opacity=".05"/>
</svg>'''

def svg_modern(name, colors):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="{colors['bg']}"/><stop offset="100%" stop-color="{colors['primary']}"/></linearGradient>
</defs>
<rect width="800" height="600" fill="url(#bg)"/>
<rect x="80" y="80" width="200" height="440" fill="{colors['secondary']}" opacity=".2"/>
<rect x="320" y="150" width="160" height="370" fill="{colors['accent']}" opacity=".06"/>
<rect x="520" y="200" width="200" height="320" fill="{colors['secondary']}" opacity=".15"/>
<line x1="80" y1="200" x2="280" y2="200" stroke="{colors['accent']}" stroke-width="1" opacity=".2"/>
<line x1="320" y1="300" x2="480" y2="300" stroke="{colors['accent']}" stroke-width="1" opacity=".15"/>
<line x1="520" y1="350" x2="720" y2="350" stroke="{colors['accent']}" stroke-width="1" opacity=".2"/>
<circle cx="400" cy="300" r="100" fill="none" stroke="{colors['accent']}" stroke-width="1" opacity=".1"/>
</svg>'''

def svg_walldecor(name, colors):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
<defs>
  <radialGradient id="bg"><stop offset="0%" stop-color="{colors['secondary']}"/><stop offset="100%" stop-color="{colors['bg']}"/></radialGradient>
</defs>
<rect width="800" height="600" fill="url(#bg)"/>
<rect x="150" y="100" width="500" height="400" rx="8" fill="none" stroke="{colors['accent']}" stroke-width="2" opacity=".25"/>
<rect x="180" y="130" width="440" height="340" rx="4" fill="none" stroke="{colors['accent']}" stroke-width="1" opacity=".15"/>
<circle cx="400" cy="280" r="60" fill="none" stroke="{colors['accent']}" stroke-width="1.5" opacity=".3"/>
<circle cx="400" cy="280" r="30" fill="none" stroke="{colors['accent']}" stroke-width="1" opacity=".2"/>
<circle cx="400" cy="280" r="10" fill="{colors['accent']}" opacity=".15"/>
<line x1="340" y1="280" x2="460" y2="280" stroke="{colors['accent']}" stroke-width="1" opacity=".2"/>
<line x1="400" y1="220" x2="400" y2="340" stroke="{colors['accent']}" stroke-width="1" opacity=".2"/>
</svg>'''

# SVG generators for each product
PRODUCT_SVGS = [
    # From mitti-art-gallery products (need new SVGs)
    ('modern-lippan-mandala', 'lippan-art'),
    ('traditional-kutch-geometric', 'lippan-art'),
    ('white-gold-celestial', 'lippan-art'),
    ('terracotta-teal-harmony', 'lippan-art'),
    ('abstract-lippan-fusion', 'lippan-art'),
    ('custom-name-lippan', 'lippan-art'),
    ('crimson-horizon', 'abstract'),
    ('earthy-resonance', 'abstract'),
    ('monsoon-mountains', 'landscapes'),
    ('sacred-ganga', 'landscapes'),
    ('desert-solitude', 'landscapes'),
    ('urban-geometry', 'modern'),
    ('minimalist-lotus', 'modern'),
    ('set-of-3-earth-triptych', 'wall-decor'),
    ('mandala-metal-wall-art', 'wall-decor'),
    # Also generate blog SVGs
    ('blog-lippan-intro', 'abstract'),
    ('blog-lippan-decor', 'lippan-art'),
    ('blog-lippan-vs-warli', 'abstract'),
    ('blog-display-guide', 'landscapes'),
    ('blog-gift-guide', 'modern'),
]

GENERATORS = {
    'lippan-art': svg_lippan,
    'abstract': svg_abstract,
    'landscapes': svg_landscape,
    'modern': svg_modern,
    'wall-decor': svg_walldecor,
}

for slug, category in PRODUCT_SVGS:
    existing = os.path.join(SVG_DIR, f'{slug}.svg')
    if os.path.exists(existing):
        continue
    colors = PALETTES[category]
    gen = GENERATORS[category]
    svg_content = gen(slug, colors)
    filepath = os.path.join(SVG_DIR, f'{slug}.svg')
    with open(filepath, 'w', newline='\n') as f:
        f.write(svg_content + '\n')
    print(f'  Created: {slug}.svg ({category})')

print(f'Total SVGs: {len(os.listdir(SVG_DIR))}')
