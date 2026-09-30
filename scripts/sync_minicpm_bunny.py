#!/usr/bin/env python3
"""
Sync MiniCPM5-2B-Q4_K_M.gguf to BunnyCDN
Downloads the 4-bit quantized MiniCPM5-2B model from Hugging Face and uploads to BunnyCDN.
Credentials are read dynamically from environment variables or local .env (never committed).
"""

import os
import sys
import time
import urllib.request
import urllib.error
from concurrent.futures import ThreadPoolExecutor

HF_MODEL_URL = "https://huggingface.co/openbmb/MiniCPM5-2B-GGUF/resolve/main/MiniCPM5-2B-Q4_K_M.gguf"
MODEL_FILE_NAME = "MiniCPM5-2B-Q4_K_M.gguf"
TEMP_LOCAL_PATH = os.path.join("/tmp", MODEL_FILE_NAME)
TOTAL_SIZE = 1561318368  # Exact byte length from Hugging Face

def load_credentials():
    # 1. Check environment variables
    storage_zone = os.environ.get("BUNNY_STORAGE_ZONE")
    access_key = os.environ.get("BUNNY_ACCESS_KEY")
    pull_zone = os.environ.get("BUNNY_PULL_ZONE_URL") or os.environ.get("BUNNYCDN_CDN_HOSTNAME")

    # 2. Check local or known safe .env locations
    candidates = [
        os.path.join(os.getcwd(), ".env"),
        os.path.expanduser("~/.env"),
        "/Users/rahullahoria/dina/AI Recuritment Manager/.env",
        "/Users/rahullahoria/dina/Restocare/.env",
    ]

    for p in candidates:
        if storage_zone and access_key and pull_zone:
            break
        if os.path.exists(p):
            with open(p, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        k, v = line.split("=", 1)
                        k = k.strip()
                        v = v.strip().strip("\"'")
                        if k == "BUNNY_STORAGE_ZONE" and not storage_zone:
                            storage_zone = v
                        elif k == "BUNNY_ACCESS_KEY" and not access_key:
                            access_key = v
                        elif k in ("BUNNY_PULL_ZONE_URL", "BUNNYCDN_CDN_HOSTNAME") and not pull_zone:
                            pull_zone = v

    if not storage_zone or not access_key:
        print("❌ Error: Missing BUNNY_STORAGE_ZONE or BUNNY_ACCESS_KEY.", file=sys.stderr)
        sys.exit(1)

    if pull_zone and not pull_zone.startswith("http"):
        pull_zone = f"https://{pull_zone}"

    return storage_zone, access_key, pull_zone or "https://zdina.b-cdn.net"

def download_chunk(url, start_byte, end_byte, filepath, thread_id):
    req = urllib.request.Request(url, headers={
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        "Range": f"bytes={start_byte}-{end_byte}"
    })
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = resp.read()
        with open(filepath, "r+b") as f:
            f.seek(start_byte)
            f.write(data)

def download_model_parallel(url, target_path, num_workers=8):
    print(f"📦 Target model: {MODEL_FILE_NAME} ({TOTAL_SIZE / (1024*1024):.2f} MB)")
    
    # Pre-allocate sparse file if not existing
    if not os.path.exists(target_path) or os.path.getsize(target_path) != TOTAL_SIZE:
        print(f"📄 Initializing local file at {target_path}...")
        with open(target_path, "wb") as f:
            f.seek(TOTAL_SIZE - 1)
            f.write(b"\0")
    else:
        print(f"✅ Local model file already present and sized at {target_path}.")
        return

    # Split into 64MB chunks
    chunk_size = 64 * 1024 * 1024
    chunks = []
    offset = 0
    while offset < TOTAL_SIZE:
        end = min(offset + chunk_size - 1, TOTAL_SIZE - 1)
        chunks.append((offset, end))
        offset = end + 1

    print(f"🚀 Downloading in {len(chunks)} chunks with {num_workers} parallel workers...")
    start_time = time.time()
    completed_bytes = 0

    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        futures = []
        for i, (s, e) in enumerate(chunks):
            futures.append(executor.submit(download_chunk, url, s, e, target_path, i))

        for f in futures:
            f.result()
            completed_bytes += chunk_size
            pct = min(100.0, (completed_bytes / TOTAL_SIZE) * 100.0)
            elapsed = time.time() - start_time
            speed = (completed_bytes / (1024 * 1024)) / max(1.0, elapsed)
            print(f"\r  Progress: {pct:5.1f}% | Elapsed: {elapsed:.0f}s | Speed: {speed:5.2f} MB/s", end="", flush=True)

    print(f"\n✅ Download complete in {time.time() - start_time:.1f}s!")

def upload_to_bunny(storage_zone, access_key, local_path, destination_path):
    bunny_upload_url = f"https://storage.bunnycdn.com/{storage_zone}/{destination_path}"
    print(f"\n📤 Uploading to BunnyCDN: {bunny_upload_url}...")
    
    file_size = os.path.getsize(local_path)
    start_time = time.time()

    with open(local_path, "rb") as f:
        req = urllib.request.Request(
            bunny_upload_url,
            data=f,
            headers={
                "AccessKey": access_key,
                "Content-Type": "application/octet-stream",
                "Content-Length": str(file_size),
            },
            method="PUT"
        )
        with urllib.request.urlopen(req, timeout=300) as resp:
            status = resp.status
            body = resp.read().decode("utf-8", errors="ignore")
            print(f"✅ BunnyCDN Upload Response [{status}]: {body}")

    elapsed = time.time() - start_time
    speed = (file_size / (1024 * 1024)) / max(1.0, elapsed)
    print(f"⚡ Upload completed in {elapsed:.1f}s ({speed:.2f} MB/s)")

def verify_cdn(pull_zone, destination_path):
    cdn_url = f"{pull_zone.rstrip('/')}/{destination_path.lstrip('/')}"
    print(f"\n🔍 Verifying public CDN availability: {cdn_url}...")
    time.sleep(2)
    
    req = urllib.request.Request(cdn_url, headers={
        "User-Agent": "Mozilla/5.0 (Android; Mobile; rv:109.0)"
    }, method="HEAD")

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            content_length = int(resp.headers.get("Content-Length", 0))
            print(f"HTTP Status: {resp.status}")
            print(f"Content-Length: {content_length} bytes (Expected: {TOTAL_SIZE})")
            if content_length == TOTAL_SIZE:
                print(f"🎉 VERIFIED! Model is live on BunnyCDN edge: {cdn_url}")
                return cdn_url
            else:
                print("⚠️ Size mismatch on CDN.")
    except Exception as e:
        print(f"Verification notice: {e}")

    return cdn_url

def main():
    storage_zone, access_key, pull_zone = load_credentials()
    destination_path = f"models/{MODEL_FILE_NAME}"

    # 1. Download
    download_model_parallel(HF_MODEL_URL, TEMP_LOCAL_PATH, num_workers=8)

    # 2. Upload
    upload_to_bunny(storage_zone, access_key, TEMP_LOCAL_PATH, destination_path)

    # 3. Verify
    final_cdn_url = verify_cdn(pull_zone, destination_path)
    print(f"\n🔥 MiniCPM5-2B GGUF is available at: {final_cdn_url}")

if __name__ == "__main__":
    main()
