"""Build the finale Stitch layers from the owner's picture.

  python3 tools/stitch/layers.py <source.png> <out_dir> [EDSR_x4.pb]

With the EDSR model (https://raw.githubusercontent.com/Saafke/EDSR_Tensorflow/master/models/EDSR_x4.pb,
needs opencv-contrib-python-headless) the 269x372 source is upscaled 4x by a super-resolution network
(crisp outlines); without it, Lanczos 4x. Then: white background -> clean alpha (colour-to-alpha on the
anti-aliased rim, no halo), ears cut into their own layers (overlapping under the head so no seam).
"""
import sys
from PIL import Image, ImageDraw
import numpy as np
from scipy import ndimage

src_path, out = sys.argv[1], sys.argv[2]
F = 4
src0 = Image.open(src_path).convert('RGB')
if len(sys.argv) > 3:
    import cv2
    sr = cv2.dnn_superres.DnnSuperResImpl_create(); sr.readModel(sys.argv[3]); sr.setModel('edsr', F)
    up = sr.upsample(cv2.cvtColor(np.asarray(src0), cv2.COLOR_RGB2BGR))
    src = Image.fromarray(cv2.cvtColor(up, cv2.COLOR_BGR2RGB))
else:
    src = src0.resize((src0.width * F, src0.height * F), Image.LANCZOS)

W, H = src.size; m = src.copy()
for xy in [(0, 0), (W-1, 0), (0, H-1), (W-1, H-1), (W//2, 0), (0, H//2), (W-1, H//2), (20*F, H-1), (260*F, H-1)]:
    if sum(m.getpixel(xy)) > 600: ImageDraw.floodfill(m, xy, (255, 0, 255), thresh=90)
rgb = np.asarray(src).astype(float); bg = np.all(np.asarray(m) == [255, 0, 255], axis=2)
edge = ndimage.binary_dilation(bg, iterations=2 * F)
alpha = np.ones((H, W))
lo = rgb.min(axis=2); a2 = np.clip((255 - lo) / 255 * 1.15, 0, 1)
alpha[edge] = a2[edge]; alpha[bg & (lo > 235)] = 0
col = rgb.copy(); safe = np.maximum(alpha, 1e-3)[..., None]
col[edge] = np.clip((rgb[edge] - (1 - alpha[edge])[..., None] * 255) / safe[edge], 0, 255)
full = np.dstack([col, alpha * 255]).astype(np.uint8)

def poly_mask(pts):
    mk = Image.new('L', (W, H), 0); ImageDraw.Draw(mk).polygon([(x * F, y * F) for x, y in pts], fill=255); return np.asarray(mk) > 0
L = [(0, 0), (68, 0), (68, 96), (61, 124), (58, 152), (60, 182), (0, 182)]
R = [(269, 0), (198, 0), (198, 96), (200, 120), (203, 150), (203, 176), (269, 176)]
save = lambda arr, name: Image.fromarray(arr, 'RGBA').save(f'{out}/{name}.webp', quality=92, method=6)
body = full.copy()
for pts, name in [(L, 'stitch-ear-l'), (R, 'stitch-ear-r')]:
    mk = poly_mask(pts); grow = ndimage.binary_dilation(mk, iterations=4 * F)  # ear layer overlaps under the head: no seam
    e = full.copy(); e[~grow] = 0; save(e, name); body[mk] = 0
save(body, 'stitch-body')
