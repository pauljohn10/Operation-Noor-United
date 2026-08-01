"""
Remove white/light background from logo PNG using pure Pillow (no numpy).
Saves result as transparent RGBA PNG in /public/logo_transparent.png
"""
import urllib.request
import io
from PIL import Image

# Download the original logo
url = 'https://gpljpjnzpyvmvlndcnfb.supabase.co/storage/v1/object/public/Logo/ChatGPT%20Image%20Jul%2028,%202026,%2009_09_50%20AM.png'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
raw = urllib.request.urlopen(req).read()
print(f"Downloaded {len(raw):,} bytes")

img = Image.open(io.BytesIO(raw)).convert("RGBA")
pixels = img.load()
width, height = img.size
print(f"Image size: {width}x{height}")

THRESHOLD_FULL = 240   # fully transparent above this
THRESHOLD_SOFT = 210   # soft blend from 210..240

processed = 0
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        # near-white region -> transparent
        if r >= THRESHOLD_FULL and g >= THRESHOLD_FULL and b >= THRESHOLD_FULL:
            pixels[x, y] = (r, g, b, 0)
            processed += 1
        elif r >= THRESHOLD_SOFT and g >= THRESHOLD_SOFT and b >= THRESHOLD_SOFT:
            # soft anti-alias transition
            min_channel = min(r, g, b)
            alpha = int(((255 - min_channel) / (255 - THRESHOLD_SOFT)) * 255)
            pixels[x, y] = (r, g, b, max(0, min(255, alpha)))
            processed += 1

print(f"Processed {processed:,} pixels")

out_path = r"public\logo_transparent.png"
img.save(out_path, "PNG", optimize=True)
print(f"Saved: {out_path}")
print("Done!")
