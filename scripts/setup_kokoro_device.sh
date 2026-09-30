#!/usr/bin/env bash
set -e

# ==============================================================================
# Intervity: Automated Kokoro-82M TTS Setup Script for Android
# ==============================================================================

echo "🎙️ Setting up Kokoro-82M TTS on connected Android device..."

# Ensure adb is available
if ! command -v adb &> /dev/null; then
    echo "❌ Error: 'adb' command not found. Please ensure Android platform-tools are in your PATH."
    exit 1
fi

DEVICE_COUNT=$(adb devices | grep -v "List" | grep "device" | wc -l | tr -d ' ')
if [ "$DEVICE_COUNT" -eq 0 ]; then
    echo "❌ Error: No Android device detected. Please connect your device with USB/Wi-Fi debugging enabled."
    exit 1
fi

TEMP_DIR=$(mktemp -d)
KOKORO_TAR="$TEMP_DIR/kokoro-en-v0_19.tar.bz2"
KOKORO_EXTRACT="$TEMP_DIR/kokoro-en-v0_19"

echo "📥 Downloading Kokoro INT8 bundle (~88 MB)..."
curl -L -o "$KOKORO_TAR" "https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/kokoro-en-v0_19.tar.bz2"

echo "📦 Extracting assets..."
tar -xjf "$KOKORO_TAR" -C "$TEMP_DIR"

echo "📱 Creating directory on device (/data/local/tmp/kokoro)..."
adb shell mkdir -p /data/local/tmp/kokoro

echo "🚀 Pushing model assets to device..."
adb push "$KOKORO_EXTRACT/." /data/local/tmp/kokoro/
adb shell chmod -R 777 /data/local/tmp/kokoro

echo "🧹 Cleaning up temporary files..."
rm -rf "$TEMP_DIR"

echo "✅ Kokoro-82M TTS setup complete! Model assets are live at /data/local/tmp/kokoro."
