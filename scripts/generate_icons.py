#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_launcher_icon(is_round=False, size=1024):
    canvas = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    
    padding = 24
    if is_round:
        mask_draw.ellipse([padding, padding, size - padding, size - padding], fill=255)
    else:
        corner_radius = int(size * 0.22)
        mask_draw.rounded_rectangle([padding, padding, size - padding, size - padding], radius=corner_radius, fill=255)
    
    bg = Image.new('RGBA', (size, size), (0, 0, 0, 255))
    bg_draw = ImageDraw.Draw(bg)
    
    for y in range(size):
        ratio = y / size
        r = int(10 + (26 - 10) * ratio)
        g = int(15 + (22 - 15) * ratio)
        b = int(28 + (68 - 28) * ratio)
        bg_draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
        
    glow = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    center_x, center_y = size // 2, int(size * 0.48)
    
    for r in range(int(size * 0.45), 0, -8):
        alpha = int(45 * (1.0 - (r / (size * 0.45))))
        glow_draw.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], fill=(56, 189, 248, alpha))
        
    for r in range(int(size * 0.32), 0, -6):
        alpha = int(55 * (1.0 - (r / (size * 0.32))))
        glow_draw.ellipse([center_x - r, center_y - r, center_x + r, center_y + r], fill=(99, 102, 241, alpha))
        
    bg = Image.alpha_composite(bg, glow)
    canvas.paste(bg, (0, 0), mask)
    
    border_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    border_draw = ImageDraw.Draw(border_img)
    if is_round:
        border_draw.ellipse([padding + 1, padding + 1, size - padding - 1, size - padding - 1], outline=(147, 197, 253, 50), width=4)
    else:
        corner_radius = int(size * 0.22)
        border_draw.rounded_rectangle([padding + 1, padding + 1, size - padding - 1, size - padding - 1], radius=corner_radius, outline=(147, 197, 253, 50), width=4)
    canvas = Image.alpha_composite(canvas, border_img)
    
    # Soundwave bars and center star
    fg = render_icon_emblem(size, center_x, int(size * 0.51), scale=1.0)
    canvas = Image.alpha_composite(canvas, fg)
    return canvas

def render_icon_emblem(size, center_x, center_y, scale=1.0):
    fg = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    fg_draw = ImageDraw.Draw(fg)
    
    bar_width = int(size * 0.058 * scale)
    bar_spacing = int(size * 0.105 * scale)
    bars = [
        (-2 * bar_spacing, int(180 * scale), (56, 189, 248)),
        (-1 * bar_spacing, int(310 * scale), (99, 102, 241)),
        (0, int(440 * scale), (129, 140, 248)),
        (1 * bar_spacing, int(310 * scale), (99, 102, 241)),
        (2 * bar_spacing, int(180 * scale), (56, 189, 248)),
    ]
    
    for offset_x, height, color in bars:
        bx = center_x + offset_x - (bar_width // 2)
        by1 = center_y - (height // 2)
        by2 = center_y + (height // 2)
        radius = bar_width // 2
        
        shadow_box = [bx - 4, by1 - 4, bx + bar_width + 4, by2 + 4]
        fg_draw.rounded_rectangle(shadow_box, radius=radius + 2, fill=(0, 0, 0, 40))
        fg_draw.rounded_rectangle([bx, by1, bx + bar_width, by2], radius=radius, fill=(*color, 245))
        
        highlight_h = int(height * 0.35)
        fg_draw.rounded_rectangle([bx + 4, by1 + 4, bx + bar_width - 4, by1 + highlight_h], radius=radius - 2, fill=(255, 255, 255, 120))
    
    spark_img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    spark_draw = ImageDraw.Draw(spark_img)
    
    spark_center = (center_x, center_y)
    spark_radius = int(size * 0.17 * scale)
    spark_inner = int(spark_radius * 0.22)
    
    points = []
    for i in range(8):
        angle = i * (math.pi / 4)
        r = spark_radius if (i % 2 == 0) else spark_inner
        px = spark_center[0] + r * math.cos(angle - math.pi / 2)
        py = spark_center[1] + r * math.sin(angle - math.pi / 2)
        points.append((px, py))
        
    spark_draw.polygon(points, fill=(56, 189, 248, 220))
    spark_blurred = spark_img.filter(ImageFilter.GaussianBlur(radius=int(12 * scale)))
    
    spark_core = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    core_draw = ImageDraw.Draw(spark_core)
    core_draw.polygon(points, fill=(255, 255, 255, 255))
    
    dot_r = int(14 * scale)
    core_draw.ellipse([spark_center[0] - dot_r, spark_center[1] - dot_r, spark_center[0] + dot_r, spark_center[1] + dot_r], fill=(56, 189, 248, 255))
    
    fg = Image.alpha_composite(fg, spark_blurred)
    fg = Image.alpha_composite(fg, spark_core)
    return fg

def create_adaptive_foreground(size=1024):
    # For adaptive icons, safe zone is 66% (radius ~ 33%)
    center_x, center_y = size // 2, size // 2
    return render_icon_emblem(size, center_x, center_y, scale=0.68)

def main():
    res_dir = "/Users/rahullahoria/dina/Jobs_search_app/android/app/src/main/res"
    densities = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }
    
    print("Generating Master 1024x1024 icons...")
    master_square = create_launcher_icon(is_round=False, size=1024)
    master_round = create_launcher_icon(is_round=True, size=1024)
    master_fg = create_adaptive_foreground(size=1024)
    
    os.makedirs(os.path.join(res_dir, "drawable"), exist_ok=True)
    master_square.resize((512, 512), Image.Resampling.LANCZOS).save(os.path.join(res_dir, "drawable", "ic_launcher_web.png"))
    
    for folder, (dim, fg_dim) in densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        sq = master_square.resize((dim, dim), Image.Resampling.LANCZOS)
        sq.save(os.path.join(folder_path, "ic_launcher.png"), "PNG")
        
        rd = master_round.resize((dim, dim), Image.Resampling.LANCZOS)
        rd.save(os.path.join(folder_path, "ic_launcher_round.png"), "PNG")
        
        fg = master_fg.resize((fg_dim, fg_dim), Image.Resampling.LANCZOS)
        fg.save(os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG")
        print(f"Generated {folder}: {dim}x{dim} launcher & {fg_dim}x{fg_dim} foreground")
        
    # Write values/ic_launcher_background.xml
    values_dir = os.path.join(res_dir, "values")
    os.makedirs(values_dir, exist_ok=True)
    with open(os.path.join(values_dir, "ic_launcher_background.xml"), "w") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0B0F19</color>
</resources>
''')

    # Write mipmap-anydpi-v26 adaptive icon configs
    anydpi_dir = os.path.join(res_dir, "mipmap-anydpi-v26")
    os.makedirs(anydpi_dir, exist_ok=True)
    with open(os.path.join(anydpi_dir, "ic_launcher.xml"), "w") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
''')
    with open(os.path.join(anydpi_dir, "ic_launcher_round.xml"), "w") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
''')
    print("Adaptive icon configs written successfully.")

if __name__ == "__main__":
    main()
