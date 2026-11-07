"""App icons from the same geometry as src/art/logo.ts."""
import cairosvg
from PIL import Image, ImageDraw

PINE, SAND, TERRA = '#0F4A3C', '#F7F1E8', '#E2725B'
ROOF, WALLS = 'M14 48 L50 16 L86 48', 'M22 42 V84 H78 V42'
RING, STEM = 'M50 49 A7 7 0 1 1 49.99 49 Z', 'M50 63 L50 74'

def mark(canvas, px, fg=SAND, acc=TERRA, bg=None, sw=6):
    off = (canvas - px) / 2
    k = px / 100
    b = f'<rect width="{canvas}" height="{canvas}" fill="{bg}"/>' if bg else ''
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{canvas}" height="{canvas}">{b}'
            f'<g transform="translate({off} {off}) scale({k})" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="{sw}">'
            f'<path d="{ROOF}" stroke="{fg}"/><path d="{WALLS}" stroke="{fg}"/><path d="{RING}" stroke="{acc}"/><path d="{STEM}" stroke="{acc}"/></g></svg>')

def png(svg, out, px):
    cairosvg.svg2png(bytestring=svg.encode(), write_to=out, output_width=px, output_height=px)

png(mark(1024, 640, bg=PINE), 'assets/images/icon.png', 1024)
png(mark(1024, 560), 'assets/images/android-icon-foreground.png', 1024)
Image.new('RGBA', (1024, 1024), PINE).save('assets/images/android-icon-background.png')
png(mark(96, 70, bg=PINE), 'assets/images/favicon.png', 96)
# native splash is just the dark sky color: the animated splash takes over with no jump
Image.new('RGBA', (512, 512), (0, 0, 0, 0)).save('assets/images/splash-icon.png')
# monochrome (Android themed icons): white strokes
png(mark(1024, 560, fg='#FFFFFF', acc='#FFFFFF'), 'assets/images/android-icon-monochrome.png', 1024)
print('icons ok')
