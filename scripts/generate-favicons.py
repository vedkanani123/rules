import os
from PIL import Image, ImageDraw

def create_favicon_assets():
    public_dir = os.path.join(os.path.dirname(__file__), '..', 'public')
    os.makedirs(public_dir, exist_ok=True)

    # 1. Write the vector SVG favicon
    svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFFFF"/>
      <stop offset="100%" stop-color="#F1F5F9"/>
    </linearGradient>
    <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0F172A"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981"/>
      <stop offset="100%" stop-color="#059669"/>
    </linearGradient>
  </defs>

  <!-- High-contrast rounded squircle container -->
  <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#bgGrad)" stroke="#E2E8F0" stroke-width="1.5"/>

  <!-- Shield protection outline -->
  <path d="M32 11 C32 11 46 15 48 16.5 C48 29 41.5 44 32 51 C22.5 44 16 29 16 16.5 C18 15 32 11 32 11 Z" 
        fill="url(#shieldGrad)"/>

  <!-- Glowing Emerald Verification & Rule Accuracy Mark -->
  <path d="M25 31.5 L30 36.5 L40 25" 
        fill="none" stroke="url(#emeraldGrad)" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>
</svg>'''

    svg_path = os.path.join(public_dir, 'favicon.svg')
    with open(svg_path, 'w') as f:
        f.write(svg_content)
    print(f"Generated {svg_path}")

    # 2. Render high-resolution master at 1024x1024 for supersampling
    scale = 16  # 64 * 16 = 1024
    img_size = 64 * scale
    img = Image.new('RGBA', (img_size, img_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Draw rounded squircle
    pad = 2 * scale
    radius = 14 * scale
    # Background squircle
    draw.rounded_rectangle(
        [pad, pad, img_size - pad, img_size - pad],
        radius=radius,
        fill=(255, 255, 255, 255),
        outline=(226, 232, 240, 255),
        width=int(1.5 * scale)
    )

    # Draw shield polygon
    # Shield points relative to 64x64
    shield_pts = [
        (32, 11),
        (39, 13),
        (46, 15),
        (48, 16.5),
        (48, 23),
        (47.5, 29),
        (45, 36),
        (41.5, 44),
        (37, 48),
        (32, 51),
        (27, 48),
        (22.5, 44),
        (19, 36),
        (16.5, 29),
        (16, 23),
        (16, 16.5),
        (18, 15),
        (25, 13),
    ]
    scaled_shield = [(int(x * scale), int(y * scale)) for x, y in shield_pts]
    draw.polygon(scaled_shield, fill=(15, 23, 42, 255))

    # Draw emerald checkmark
    # Check lines: (25, 31.5) -> (30, 36.5) -> (40, 25)
    check_pts = [
        (int(25 * scale), int(31.5 * scale)),
        (int(30 * scale), int(36.5 * scale)),
        (int(40 * scale), int(25 * scale)),
    ]
    check_width = int(4.5 * scale)
    
    # Draw thick smooth checkmark
    draw.line([check_pts[0], check_pts[1]], fill=(16, 185, 129, 255), width=check_width)
    draw.line([check_pts[1], check_pts[2]], fill=(16, 185, 129, 255), width=check_width)
    
    # Round endpoints
    half_w = check_width // 2
    for pt in check_pts:
        draw.ellipse([pt[0] - half_w, pt[1] - half_w, pt[0] + half_w, pt[1] + half_w], fill=(16, 185, 129, 255))

    # Generate multi-size PNGs
    sizes = {
        'apple-touch-icon.png': 180,
        'favicon-32x32.png': 32,
        'favicon-16x16.png': 16,
        'icon-192.png': 192,
        'icon-512.png': 512,
    }

    generated_images = {}
    for filename, sz in sizes.items():
        resized = img.resize((sz, sz), Image.Resampling.LANCZOS)
        out_path = os.path.join(public_dir, filename)
        resized.save(out_path, 'PNG', optimize=True)
        generated_images[sz] = resized
        print(f"Generated {out_path} ({sz}x{sz})")

    # Generate multi-layer favicon.ico (16, 32, 48)
    ico_48 = img.resize((48, 48), Image.Resampling.LANCZOS)
    ico_path = os.path.join(public_dir, 'favicon.ico')
    generated_images[32].save(
        ico_path,
        format='ICO',
        sizes=[(16, 16), (32, 32), (48, 48)]
    )
    print(f"Generated {ico_path} (multi-layer ICO)")

if __name__ == '__main__':
    create_favicon_assets()
