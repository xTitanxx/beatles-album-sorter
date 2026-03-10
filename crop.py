from PIL import Image
import sys
try:
    img = Image.open('let_it_be.png')
    w, h = img.size
    print(f"Loaded {w}x{h}")
    pw = w // 4
    for i, name in enumerate(['john', 'paul', 'george', 'ringo']):
        box = (i * pw, 0, (i + 1) * pw, h)
        cropped = img.crop(box)
        cropped.save(f"assets/{name}.png")
        print(f"Saved {name}.png")
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)
