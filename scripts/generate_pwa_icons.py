"""Generate PWA icons for MidScope (Crystalline Pomegranate).
Creates icon-192.png, icon-512.png, icon-maskable-512.png, apple-touch-icon.png, favicon.ico
"""
from PIL import Image, ImageDraw
import os

OUT = "/app/frontend/public"
os.makedirs(OUT, exist_ok=True)

POM_TOP = (169, 61, 79)
POM_BOT = (92, 17, 28)
PEARL_CYAN = (180, 235, 242)
WHITE = (255, 255, 255)

def _vertical_gradient(size, top, bottom):
    img = Image.new("RGB", (size, size), top)
    draw = ImageDraw.Draw(img)
    for y in range(size):
        t = y / max(1, size - 1)
        r = int(top[0]*(1-t) + bottom[0]*t)
        g = int(top[1]*(1-t) + bottom[1]*t)
        b = int(top[2]*(1-t) + bottom[2]*t)
        draw.line([(0, y), (size, y)], fill=(r, g, b))
    return img

def _add_crystalline_highlight(canvas, size):
    overlay = Image.new("RGBA", (size, size), (0,0,0,0))
    od = ImageDraw.Draw(overlay)
    od.polygon([(0,0),(size,0),(size,int(size*0.18)),(int(size*0.6),int(size*0.45)),(0,int(size*0.55))], fill=(255,255,255,38))
    od.polygon([(size,size),(size,int(size*0.45)),(int(size*0.55),size)], fill=(PEARL_CYAN[0],PEARL_CYAN[1],PEARL_CYAN[2],32))
    canvas.alpha_composite(overlay)

def _rounded_mask(size, radius_ratio=0.22):
    mask = Image.new("L", (size, size), 0)
    d = ImageDraw.Draw(mask)
    r = int(size * radius_ratio)
    d.rounded_rectangle([(0,0),(size,size)], radius=r, fill=255)
    return mask

def _draw_logo(canvas, size, full_bleed=False):
    draw = ImageDraw.Draw(canvas, "RGBA")
    margin = int(size*0.10) if full_bleed else int(size*0.04)
    inner = size - 2*margin
    cx, cy = size//2, size//2
    line_w = max(2, int(inner*0.085))
    span = int(inner*0.78)
    left, right = cx - span//2, cx + span//2
    amp = int(inner*0.22)
    points = [(left,cy),(cx-amp,cy),(cx-amp//2,cy-amp),(cx,cy+amp),(cx+amp//2,cy-int(amp*1.2)),(cx+amp,cy),(right,cy)]
    draw.line([(x+2,y+3) for (x,y) in points], fill=(0,0,0,90), width=line_w, joint="curve")
    draw.line(points, fill=WHITE, width=line_w, joint="curve")
    dot_r = max(3, int(inner*0.055))
    p5 = points[4]
    draw.ellipse([(p5[0]-dot_r,p5[1]-dot_r),(p5[0]+dot_r,p5[1]+dot_r)], fill=PEARL_CYAN, outline=WHITE, width=max(1,line_w//4))

def make_standard(size, path):
    bg = _vertical_gradient(size, POM_TOP, POM_BOT)
    canvas = Image.new("RGBA", (size, size), (0,0,0,0))
    canvas.paste(bg, (0,0))
    _add_crystalline_highlight(canvas, size)
    _draw_logo(canvas, size, full_bleed=False)
    mask = _rounded_mask(size, 0.22)
    out = Image.new("RGBA", (size, size), (0,0,0,0))
    out.paste(canvas, (0,0), mask)
    out.save(path, "PNG", optimize=True)

def make_maskable(size, path):
    bg = _vertical_gradient(size, POM_TOP, POM_BOT)
    canvas = Image.new("RGBA", (size, size), (0,0,0,0))
    canvas.paste(bg, (0,0))
    _add_crystalline_highlight(canvas, size)
    _draw_logo(canvas, size, full_bleed=True)
    canvas.save(path, "PNG", optimize=True)

def make_apple(size, path):
    bg = _vertical_gradient(size, POM_TOP, POM_BOT)
    canvas = Image.new("RGB", (size, size), POM_TOP)
    canvas.paste(bg, (0,0))
    rgba = canvas.convert("RGBA")
    _add_crystalline_highlight(rgba, size)
    _draw_logo(rgba, size, full_bleed=False)
    rgba.convert("RGB").save(path, "PNG", optimize=True)

def make_favicon(path):
    sizes = [16,32,48,64]
    imgs = []
    for s in sizes:
        bg = _vertical_gradient(s, POM_TOP, POM_BOT)
        canvas = Image.new("RGBA", (s, s), (0,0,0,0))
        canvas.paste(bg, (0,0))
        _add_crystalline_highlight(canvas, s)
        _draw_logo(canvas, s, full_bleed=False)
        mask = _rounded_mask(s, 0.22)
        out = Image.new("RGBA", (s, s), (0,0,0,0))
        out.paste(canvas, (0,0), mask)
        imgs.append(out)
    imgs[0].save(path, format="ICO", sizes=[(s,s) for s in sizes])

if __name__ == "__main__":
    make_standard(192, os.path.join(OUT, "icon-192.png"))
    make_standard(512, os.path.join(OUT, "icon-512.png"))
    make_maskable(512, os.path.join(OUT, "icon-maskable-512.png"))
    make_apple(180, os.path.join(OUT, "apple-touch-icon.png"))
    make_favicon(os.path.join(OUT, "favicon.ico"))
    print("Generated MidScope Crystalline Pomegranate icons")
    for f in ["icon-192.png","icon-512.png","icon-maskable-512.png","apple-touch-icon.png","favicon.ico"]:
        p = os.path.join(OUT, f)
        print(f"  {p}  ({os.path.getsize(p)} bytes)")
