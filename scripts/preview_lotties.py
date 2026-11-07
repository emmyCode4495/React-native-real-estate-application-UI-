from rlottie_python import LottieAnimation
from PIL import Image
import sys
for name, frames in [('heart-burst', [0, 6, 10, 16, 24, 34]), ('key-turn', [0, 10, 20, 30, 38, 52])]:
    a = LottieAnimation.from_file(f'assets/lottie/{name}.json')
    sheet = Image.new('RGB', (200 * len(frames), 200), (247, 241, 232))
    for i, f in enumerate(frames):
        im = a.render_pillow_frame(frame_num=f, width=200, height=200).convert('RGBA')
        bg = Image.new('RGBA', im.size, (247, 241, 232, 255))
        bg.alpha_composite(im)
        sheet.paste(bg.convert('RGB'), (i * 200, 0))
    sheet.save(f'/tmp/art/{name}.png')
    print(name, a.lottie_animation_get_totalframe(), 'frames')
