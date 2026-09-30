#!/usr/bin/env python3
"""
Generate complete Android and iOS mascot app launcher icons.
Uses Coach Nova's face on a luxury midnight-navy background with cyan-indigo rim lighting.
"""

import os
import json
from PIL import Image, ImageDraw

def create_master_icons(src_path):
    orig = Image.open(src_path).convert('RGB')
    
    # 1. Master Square Full-Bleed 1024x1024 (for iOS & Android square)
    canvas = Image.new('RGBA', (1024, 1024), (12, 16, 36, 255))
    canvas_draw = ImageDraw.Draw(canvas)
    
    # Draw dark midnight gradient
    for y in range(1024):
        ratio = y / 1024.0
        r = int(12 + (24 - 12) * ratio)
        g = int(16 + (30 - 16) * ratio)
        b = int(36 + (64 - 36) * ratio)
        canvas_draw.line([(0, y), (1024, y)], fill=(r, g, b, 255))
        
    # Circle portal
    center_x, center_y = 512, 512
    radius = 405
    circle_mask = Image.new('L', (1024, 1024), 0)
    mask_draw = ImageDraw.Draw(circle_mask)
    mask_draw.ellipse([center_x - radius, center_y - radius, center_x + radius, center_y + radius], fill=255)
    
    canvas.paste(orig, (0, 0), circle_mask)
    
    # Rim highlight
    rim = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    rim_draw = ImageDraw.Draw(rim)
    rim_draw.ellipse([center_x - radius, center_y - radius, center_x + radius, center_y + radius], outline=(56, 189, 248, 65), width=4)
    master_square = Image.alpha_composite(canvas, rim)
    
    # 2. Master Round 1024x1024 (for Android round icon)
    master_round = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    round_mask = Image.new('L', (1024, 1024), 0)
    round_mask_draw = ImageDraw.Draw(round_mask)
    round_mask_draw.ellipse([20, 20, 1004, 1004], fill=255)
    master_round.paste(master_square, (0, 0), round_mask)
    
    # 3. Master Adaptive Foreground 1024x1024 (scaled to 68% safe zone for 108dp canvas)
    master_fg = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
    scale = 0.70
    scaled_w, scaled_h = int(1024 * scale), int(1024 * scale)
    scaled_square = master_square.resize((scaled_w, scaled_h), Image.Resampling.LANCZOS)
    offset_x = (1024 - scaled_w) // 2
    offset_y = (1024 - scaled_h) // 2
    master_fg.paste(scaled_square, (offset_x, offset_y))
    
    return master_square, master_round, master_fg

def generate_android_icons(master_square, master_round, master_fg):
    res_dir = "/Users/rahullahoria/dina/Jobs_search_app/android/app/src/main/res"
    densities = {
        "mipmap-mdpi": (48, 108),
        "mipmap-hdpi": (72, 162),
        "mipmap-xhdpi": (96, 216),
        "mipmap-xxhdpi": (144, 324),
        "mipmap-xxxhdpi": (192, 432),
    }
    
    # Store Web Icon (512x512)
    os.makedirs(os.path.join(res_dir, "drawable"), exist_ok=True)
    master_square.resize((512, 512), Image.Resampling.LANCZOS).convert('RGB').save(
        os.path.join(res_dir, "drawable", "ic_launcher_web.png")
    )
    
    for folder, (dim, fg_dim) in densities.items():
        folder_path = os.path.join(res_dir, folder)
        os.makedirs(folder_path, exist_ok=True)
        
        # ic_launcher.png
        master_square.resize((dim, dim), Image.Resampling.LANCZOS).convert('RGBA').save(
            os.path.join(folder_path, "ic_launcher.png"), "PNG"
        )
        
        # ic_launcher_round.png
        master_round.resize((dim, dim), Image.Resampling.LANCZOS).convert('RGBA').save(
            os.path.join(folder_path, "ic_launcher_round.png"), "PNG"
        )
        
        # ic_launcher_foreground.png
        master_fg.resize((fg_dim, fg_dim), Image.Resampling.LANCZOS).convert('RGBA').save(
            os.path.join(folder_path, "ic_launcher_foreground.png"), "PNG"
        )
        print(f"Android {folder}: {dim}x{dim} launcher & {fg_dim}x{fg_dim} foreground")
        
    # Values background color
    values_dir = os.path.join(res_dir, "values")
    os.makedirs(values_dir, exist_ok=True)
    with open(os.path.join(values_dir, "ic_launcher_background.xml"), "w") as f:
        f.write('''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0C1024</color>
</resources>
''')
        
    # Adaptive XMLs
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
    print("Android launcher assets generated successfully.")

def generate_ios_icons(master_square):
    appiconset_dir = "/Users/rahullahoria/dina/Jobs_search_app/ios/OfflineInterviewApp/Images.xcassets/AppIcon.appiconset"
    os.makedirs(appiconset_dir, exist_ok=True)
    
    # iOS icon specifications
    specs = [
        {"size": "20x20", "scale": "2x", "dim": 40, "filename": "icon-20@2x.png"},
        {"size": "20x20", "scale": "3x", "dim": 60, "filename": "icon-20@3x.png"},
        {"size": "29x29", "scale": "2x", "dim": 58, "filename": "icon-29@2x.png"},
        {"size": "29x29", "scale": "3x", "dim": 87, "filename": "icon-29@3x.png"},
        {"size": "40x40", "scale": "2x", "dim": 80, "filename": "icon-40@2x.png"},
        {"size": "40x40", "scale": "3x", "dim": 120, "filename": "icon-40@3x.png"},
        {"size": "60x60", "scale": "2x", "dim": 120, "filename": "icon-60@2x.png"},
        {"size": "60x60", "scale": "3x", "dim": 180, "filename": "icon-60@3x.png"},
        {"size": "1024x1024", "scale": "1x", "dim": 1024, "filename": "icon-1024.png", "idiom": "ios-marketing"},
    ]
    
    contents_images = []
    
    for item in specs:
        dim = item["dim"]
        filename = item["filename"]
        idiom = item.get("idiom", "iphone")
        
        # Save solid RGB PNG (iOS does not allow transparency in AppIcon)
        icon_img = master_square.resize((dim, dim), Image.Resampling.LANCZOS).convert('RGB')
        icon_img.save(os.path.join(appiconset_dir, filename), "PNG")
        print(f"iOS {filename}: {dim}x{dim}")
        
        entry = {
            "size": item["size"],
            "idiom": idiom,
            "filename": filename,
            "scale": item["scale"],
        }
        contents_images.append(entry)
        
    contents_json = {
        "images": contents_images,
        "info": {
            "version": 1,
            "author": "xcode"
        }
    }
    
    with open(os.path.join(appiconset_dir, "Contents.json"), "w") as f:
        json.dump(contents_json, f, indent=2)
    print("iOS AppIcon.appiconset generated successfully.")

def main():
    src_path = "/Users/rahullahoria/.gemini/antigravity/brain/2d2e6988-b4cb-47b3-b235-d1ebc0e0ef39/mascot_logo_master_1790771824227.jpg"
    print(f"Processing master mascot logo from {src_path}...")
    master_square, master_round, master_fg = create_master_icons(src_path)
    
    generate_android_icons(master_square, master_round, master_fg)
    generate_ios_icons(master_square)
    print("All Android and iOS mascot logos completed!")

if __name__ == "__main__":
    main()
