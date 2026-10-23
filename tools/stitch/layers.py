import sys
from PIL import Image, ImageDraw, ImageFilter
import numpy as np
from scipy import ndimage
src=Image.open(sys.argv[1]).convert('RGB'); out=sys.argv[2]
W,H=src.size; m=src.copy()
for xy in [(0,0),(W-1,0),(0,H-1),(W-1,H-1),(W//2,0),(0,H//2),(W-1,H//2),(20,H-1),(260,H-1)]:
    if sum(m.getpixel(xy))>600: ImageDraw.floodfill(m, xy, (255,0,255), thresh=90)
rgb=np.asarray(src).astype(float); bg=np.all(np.asarray(m)==[255,0,255],axis=2)
edge=ndimage.binary_dilation(bg,iterations=2)
alpha=np.ones((H,W))
# colour-to-alpha against white on the background and its 2px rim (soft anti-aliased outline, no white halo)
lo=rgb.min(axis=2); a2=np.clip((255-lo)/255*1.15,0,1)
alpha[edge]=a2[edge]; alpha[bg & (lo>235)]=0
col=rgb.copy()
safe=np.maximum(alpha,1e-3)[...,None]
col[edge]=np.clip((rgb[edge]-(1-alpha[edge])[...,None]*255)/safe[edge],0,255)
rgba=np.dstack([col,alpha*255]).astype(np.uint8)
im=Image.fromarray(rgba,'RGBA')
def poly_mask(pts):
    mk=Image.new('L',(W,H),0); ImageDraw.Draw(mk).polygon(pts,fill=255); return np.asarray(mk)>0
L=[(0,0),(68,0),(68,96),(61,124),(58,152),(60,182),(0,182)]
R=[(269,0),(198,0),(198,96),(200,120),(203,150),(203,176),(269,176)]
S=3
def save(arr,name):
    i=Image.fromarray(arr,'RGBA').convert('RGBa').resize((W*S,H*S),Image.LANCZOS).convert('RGBA')
    i=i.filter(ImageFilter.UnsharpMask(radius=2,percent=60,threshold=2))
    i.save(f'{out}/{name}.webp',quality=90,method=6)
full=np.asarray(im).copy(); body=full.copy()
for pts,name in [(L,'stitch-ear-l'),(R,'stitch-ear-r')]:
    mk=poly_mask(pts); grow=ndimage.binary_dilation(mk,iterations=4)  # ear layer overlaps under the head: no seam
    e=full.copy(); e[~grow]=0; save(e,name); body[mk]=0
save(body,'stitch-body')
