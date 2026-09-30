# 📚 Third-Party Assets, Models & Open-Source Attributions

Intervity is built with immense gratitude to the open-source community, artificial intelligence researchers, and creative artists who make 100% on-device, private AI accessible to everyone. 

This document provides formal attribution, licensing details, and upstream repository references for all third-party models, character assets, libraries, and hardware binaries utilized across the Intervity platform.

---

## 🤖 AI Models & Neural Weights

| Asset / Model | Creator / Maintainer | Upstream Repository / Source | License | Role in Intervity |
| :--- | :--- | :--- | :--- | :--- |
| **Kokoro-82M** | Hexgrad ([@hexgrad](https://huggingface.co/hexgrad)) | [hexgrad/Kokoro-82M (Hugging Face)](https://huggingface.co/hexgrad/Kokoro-82M) | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) | High-fidelity, sub-second on-device TTS voice generation with Indian English (`en-IN`) interviewer personas (`hf_alpha`, `hm_omega`). |
| **Kokoro INT8 ONNX Bundle** | k2-fsa / sherpa-onnx | [k2-fsa/sherpa-onnx releases](https://github.com/k2-fsa/sherpa-onnx/releases/tag/tts-models) | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) | Quantized INT8 ONNX weights (`kokoro-v0_19.onnx`), token vocabulary, and phonemizer data prepackaged for mobile deployment. |
| **Whisper Tiny / Base** | OpenAI ([openai/whisper](https://github.com/openai/whisper)) & Georgi Gerganov | [ggerganov/whisper.cpp (Hugging Face)](https://huggingface.co/ggerganov/whisper.cpp) | [MIT License](https://opensource.org/licenses/MIT) | Quantized GGML speech-to-text model (`ggml-tiny.en.bin`) enabling zero-latency candidate voice transcription on edge CPUs/NPUs. |
| **Whisper Large v3 Turbo** | OpenAI & Handy Computer | [handy-computer/whisper-large-v3-turbo-gguf](https://huggingface.co/handy-computer/whisper-large-v3-turbo-gguf) | [MIT License](https://opensource.org/licenses/MIT) | High-accuracy quantized speech recognition for complex technical terminology and diverse global accents. |
| **Qwen 2.5 0.5B Instruct** | Alibaba Cloud Qwen Team ([Alibaba-NLP](https://github.com/QwenLM/Qwen2.5)) | [Qwen/Qwen2.5-0.5B-Instruct-GGUF](https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct-GGUF) | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) | Lightweight on-device reasoning engine (`qwen2.5-0.5b-instruct-q4_k_m.gguf`) for sub-100ms conversational interview responses. |
| **MiniCPM5-2B (4-bit Q4_K_M)** | OpenBMB / ModelBest ([@openbmb](https://huggingface.co/openbmb)) | [openbmb/MiniCPM5-2B-GGUF](https://huggingface.co/openbmb/MiniCPM5-2B-GGUF) & [BunnyCDN Edge Pull Zone](https://zdina.b-cdn.net/models/MiniCPM5-2B-Q4_K_M.gguf) | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) | Primary on-device LLM (`MiniCPM5-2B-Q4_K_M.gguf`, 1.45 GB) executing via `llama.rn` for technical interview question synthesis, system architecture probing, and Feynman-technique coaching. |
| **Llama 3.2 1B / 3B** | Meta AI ([meta-llama](https://github.com/meta-llama)) | [meta-llama/Llama-3.2-1B-Instruct](https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct) | [Llama 3.2 Community License](https://github.com/meta-llama/llama-models/blob/main/models/llama3_2/LICENSE) | Alternative quantized on-device SLM option for multi-turn technical interviews. |

---

## 🎨 Mascots, Avatars & Visual Assets

| Asset | Creator / Origin | File Location | License | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Coach Nova (Robot Mascot)** | Intervity & Community | [`src/assets/rive/mascot.riv`](src/assets/rive/mascot.riv) | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) | Main interactive Rive state machine. Lip-syncs with Kokoro audio output (`Talking`), tracks candidate engagement, and displays coaching emotion states. |
| **Teddy Bear Avatar (Wave, Hear & Talk)** | japarj ([Wave, Hear and talk](https://rive.app/marketplace/5628-11215-wave-hear-and-talk/)) remixed from JcToon ([Login Character](https://rive.app/marketplace/3469-7899-login-screen-character/)) | [`src/assets/rive/teddy.riv`](src/assets/rive/teddy.riv) | [CC-BY 4.0](https://creativecommons.org/licenses/by/4.0/) | Interactive character state machine featuring animated mouth movement (`Talk`), listening posture (`Hear`), audio-reactive gaze tracking (`Look`), welcoming wave, and emotional feedback states. |
| **Mascot Face App Launcher Icons** | Intervity Design & Generative Pipeline | [`android/app/src/main/res/`](android/app/src/main/res/) & [`ios/OfflineInterviewApp/Images.xcassets/AppIcon.appiconset/`](ios/OfflineInterviewApp/Images.xcassets/AppIcon.appiconset/) | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) | High-resolution multi-density Android adaptive launcher icons and iOS App Store icon suite featuring Coach Nova's face. Generated via [`scripts/generate_mascot_icons.py`](scripts/generate_mascot_icons.py). |
| **Modern Vector App Icons** | Intervity Vector Design System | [`src/components/icons/AppIcons.tsx`](src/components/icons/AppIcons.tsx) | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) | Unified, dependency-light SVG icon system (mic, wave, mascot, trophy, settings, brain, chart) rendered via `react-native-svg`. |

---

## ⚙️ Native Runtimes & Inference Engines

| Library / Tool | Upstream Project | License | Purpose in Intervity |
| :--- | :--- | :--- | :--- |
| **sherpa-onnx** | [k2-fsa/sherpa-onnx](https://github.com/k2-fsa/sherpa-onnx) | [Apache 2.0](https://www.apache.org/licenses/LICENSE-2.0) | Offline speech processing engine that executes Kokoro-82M TTS models with ONNX Runtime on Android and iOS. |
| **whisper.rn** | [mybigday/whisper.rn](https://github.com/mybigday/whisper.rn) | [MIT](https://opensource.org/licenses/MIT) | React Native JSI bindings for `whisper.cpp`, enabling on-device streaming audio transcription and VAD. |
| **whisper.cpp** | [ggerganov/whisper.cpp](https://github.com/ggerganov/whisper.cpp) | [MIT](https://opensource.org/licenses/MIT) | High-performance C/C++ inference engine for OpenAI Whisper models, optimized for ARM NEON and Apple Metal. |
| **llama.rn** | [mybigday/llama.rn](https://github.com/mybigday/llama.rn) | [MIT](https://opensource.org/licenses/MIT) | React Native JSI wrapper for `llama.cpp` to execute quantized GGUF language models directly on device. |
| **llama.cpp** | [ggerganov/llama.cpp](https://github.com/ggerganov/llama.cpp) | [MIT](https://opensource.org/licenses/MIT) | State-of-the-art LLM inference engine in C/C++ with support for mobile NPUs, Adreno OpenCL, and Hexagon DSP. |
| **rive-react-native** | [rive-app/rive-react-native](https://github.com/rive-app/rive-react-native) | [MIT / Rive Runtime License](https://github.com/rive-app/rive-react-native/blob/main/LICENSE) | Runtime engine powering 60/120 FPS vector animations and state machines for Coach Nova and Teddy avatars. |
| **op-sqlite** | [OP-Engineering/op-sqlite](https://github.com/OP-Engineering/op-sqlite) | [MIT](https://opensource.org/licenses/MIT) | High-speed C++ SQLite JSI engine for local question stores, resume embeddings, and Bayesian EMA mastery records. |
| **react-native-svg** | [software-mansion/react-native-svg](https://github.com/software-mansion/react-native-svg) | [MIT](https://opensource.org/licenses/MIT) | SVG rendering engine for the UI icon set and real-time audio waveform activity visualizers. |

---

## ⚡ Hardware Acceleration Assets

| Asset / Library | Origin / Provider | Path | Description |
| :--- | :--- | :--- | :--- |
| **Qualcomm Hexagon HTP Binaries** | Qualcomm Technologies / GGML Hexagon Backend | [`android/app/src/main/assets/ggml-hexagon/`](android/app/src/main/assets/ggml-hexagon/) | Precompiled Hexagon Tensor Processor runtime libraries (`libggml-htp-v73.so`, `libggml-htp-v75.so`, `libggml-htp-v79.so`, `libggml-htp-v81.so`) for offloading INT8/FP16 matrix operations to Snapdragon NPUs. |

---

## 📜 How to Comply & License Notes

1. **Free & Open Distribution**: Intervity itself is licensed under **Apache 2.0**. You are free to fork, customize, distribute, and contribute to this repository.
2. **Model Terms**: When distributing or downloading pre-trained weights (`Kokoro-82M`, `Qwen 2.5`, `Llama 3.2`, `Whisper`), ensure compliance with the respective creators' model cards, licenses, and terms of use listed above.
3. **Mascot & Character Use**: The Teddy Bear character animation is credited to the Rive community under CC-BY 4.0. Coach Nova mascot and branding designs are released under the project's Apache 2.0 license.
4. **Third-Party Trademarks**: All product names, logos, brands, and registered trademarks mentioned belong to their respective owners. Their use in this documentation does not imply endorsement.
