# Intervity 🎙️⚡

> **Free Learning by AI — 100% On-Device, Offline, Private AI Mock Interviews for Everyone.**

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![React Native](https://img.shields.io/badge/React%20Native-0.76%20(New%20Architecture)-61DAFB?logo=react&logoColor=black)](https://reactnative.dev/)
[![Offline First](https://img.shields.io/badge/Offline-100%25%20On--Device-success)](#)
[![Privacy First](https://img.shields.io/badge/Privacy-Zero%20Data%20Egress-green)](#)
[![Kokoro TTS](https://img.shields.io/badge/TTS-Kokoro--82M%20(INT8)-orange)](#)
[![Whisper STT](https://img.shields.io/badge/STT-Whisper.rn-blueviolet)](#)
[![Rive](https://img.shields.io/badge/Mascot-Rive%20State%20Machine-ff5c8a?logo=rive&logoColor=white)](#)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## 🌍 The Vision: Free Learning by AI

High-quality interview preparation shouldn't be a privilege reserved for candidates who can afford expensive subscriptions, human coaches, or proprietary cloud platforms. 

**Intervity** is a free, completely open-source, 100% on-device AI technical and behavioral interview platform. It turns your smartphone into an expert interviewer that listens to you, challenges your architecture decisions in real time, respects conversational interruptions, and coaches you to technical mastery—**with zero internet connection, zero API keys, and zero data leaving your device.**

### 🛡️ Why 100% On-Device & Offline?
1. **Absolute Privacy:** Your resume, voice samples, interview answers, and performance evaluations never touch a third-party cloud server or train corporate models.
2. **True Equity & Accessibility:** Works on commuter trains, in low-bandwidth regions, and on consumer mobile hardware without recurring cloud API fees.
3. **Sub-Second Conversational Fluidity:** Local C++ / JSI pipelines eliminate network hops, providing instant acoustic echo cancellation (AEC) and conversational barge-in.

---

## 🚀 Key Features

- **🧠 Autonomous Agent Coaching Harness & Evolving Mascot:** The Mascot (Nova) has an adaptive personality that levels up (from *Curious Explorer* to *Distinguished Fellow*) as it learns from you. It maintains persistent long-term SQLite memory of your career aspirations, company targets, and technical blind spots, dynamically alternating between discovering your background, probing deep architecture trade-offs, and teaching brand-new skills with the Feynman technique.
- **🎨 Interactive Rive AI Mascot with Lip-Sync & Avatar Switcher:** Expressive on-device vector mascot driven by Rive State Machines (`rive-react-native`). Synchronizes mouth animation (`Talking`) directly with on-device Kokoro TTS PCM audio playback, reacts with attentive listening eye tracking, and features a one-tap dynamic avatar toggle between Coach Nova and Teddy Bear.
- **🎙️ Zero-Friction Hands-Free Voice Experience:** Clean, distraction-free interface where the Mascot talks out loud via Kokoro-82M on the loudspeaker, listens attentively, and loops back-and-forth hands-free with energy VAD silence detection. Includes a secondary backup text drawer when speech or audio is inconvenient.
- **✨ Unified Vector Icon Design System & Modern UI:** Replaced raw platform emojis with a cohesive, high-performance vector icon suite in `src/components/icons/AppIcons.tsx` built with `react-native-svg`. Styled with a modern cyan (`#38BDF8`), indigo (`#818CF8`), and slate palette, featuring real-time audio waveform activity visualizers (`SoundWaveBars`) in the live teleprompter, safe-area notch and status-bar clearance via `SafeAreaProvider`, and responsive HUD layout.
- **📱 Modern Android Launcher & Adaptive Icon Suite:** Modern branded Intervity crest featuring cyber neural soundwave bars and a 4-point AI intelligence star spark. Fully configured across all Android mipmap densities (`mdpi` to `xxxhdpi`) and API 26+ adaptive icon suite (`mipmap-anydpi-v26/ic_launcher.xml` and `ic_launcher_round.xml`).
- **🎙️ Kokoro-82M Neural TTS:** Studio-grade on-device text-to-speech powered by `sherpa-onnx` and ONNX Runtime. Generates rich, human-like cadence across 103 voices, including Indian English (`en-IN`) technical interviewer personas (`hf_alpha` Bengaluru Tech Lead, `hm_omega` VP of Engineering).
- **⚡ Ultra-Fast Full-Duplex Audio & Barge-In:** Built-in hardware Acoustic Echo Cancellation (AEC) and instant (<100ms) audio track flush when the candidate interrupts the AI, mirroring real human conversational dynamics.
- **🧠 Local LLM Reasoning:** Runs quantized SLMs (`MiniCPM-2.5-Q4_K_M`, `Llama-3.2-1B/3B`) via `llama.rn` directly on mobile NPU/GPU/CPU.
- **🎧 High-Fidelity Speech Recognition:** Seamless streaming transcription via `whisper.rn` with energy-based Voice Activity Detection (VAD).
- **📊 Bayesian Exponential Moving Average (EMA) Mastery Tracking:** Relational SQLite tracking across core engineering competencies (React Native, System Design, Concurrency, Concurrency Hazards, Data Modeling, Communication).
- **🎯 4-Tier Mistake Taxonomy & Autopsy:** Automatically classifies stumbling points into **Conceptual**, **Structural**, **Communication**, and **Vague Hand-waving**, generating deliberate practice drills.
- **⚡ STAR Method Scoring:** Real-time extraction and verification of **S**ituation, **T**ask, **A**ction, and **R**esult narratives with quantified ownership metrics.
- **🧘 Zero-Filler Biofeedback Drills:** Real-time cadence and filler-word detection (`um`, `uh`, `like`, `you know`, `actually`, `basically`) with visual pacing biofeedback.

---

## 🏗️ Architecture

```
                  ┌────────────────────────────────────────────────────────┐
                  │                 CANDIDATE AUDIO INPUT                 │
                  └───────────────────────────┬────────────────────────────┘
                                              │
                                              ▼
                             ┌─────────────────────────────────┐
                             │ Hardware Acoustic Echo Canceler │ (AEC JSI)
                             └────────────────┬────────────────┘
                                              │
                       ┌──────────────────────┴──────────────────────┐
                       │                                             │
                       ▼                                             ▼
       ┌──────────────────────────────┐              ┌──────────────────────────────┐
       │   Energy VAD & Barge-In     │              │     Streaming Audio Queue    │
       │   Detector (<100ms Abort)    │              └──────────────┬───────────────┘
       └──────────────┬───────────────┘                             │
                      │ (Interrupt Signal)                          ▼
                      ▼                              ┌──────────────────────────────┐
       ┌──────────────────────────────┐              │    whisper.rn (STT Engine)   │
       │ Instant Kokoro Buffer Flush  │              └──────────────┬───────────────┘
       └──────────────────────────────┘                             │
                                                                    ▼
                                                     ┌──────────────────────────────┐
                                                     │ Local Resume & Context Engine│
                                                     └──────────────┬───────────────┘
                                                                    │
                                                                    ▼
                                                     ┌──────────────────────────────┐
                                                     │   llama.rn / MiniCPM-2.5     │
                                                     │ (On-Device Interview Driver) │
                                                     └──────────────┬───────────────┘
                                                                    │
                                                                    ▼
                                                     ┌──────────────────────────────┐
                                                     │  sherpa-onnx (Kokoro-82M)    │
                                                     └──────────────┬───────────────┘
                                                                    │ (PCM 24kHz)
                                                                    ▼
                                                     ┌──────────────────────────────┐
                                                     │   AudioTrack Native Output   │
                                                     └──────────────────────────────┘
```

---

## 📱 Hardware & On-Device Model Specifications

| Component | Model / Engine | Quantization / Format | Memory Footprint | Runtime / Latency |
| :--- | :--- | :--- | :--- | :--- |
| **Neural TTS** | Kokoro-82M (`sherpa-onnx`) | INT8 ONNX (88 MB) | ~110 MB RAM | ~1.1s for 10s audio |
| **Speech-to-Text** | Whisper-Base / Small | GGML Q5_1 / FP16 | ~140 MB RAM | ~180ms chunk decode |
| **Reasoning / LLM** | MiniCPM-2.5 / Llama-3.2 | Q4_K_M GGUF | ~1.4 GB RAM | 18–32 tok/s on NPU |
| **Relational DB** | SQLite (`@op-engineering`) | Embedded Local DB | <5 MB RAM | Sub-millisecond |

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- **Node.js** >= 18 or **Bun** >= 1.1
- **Android Studio** (for Android builds) with NDK 26+ and CMake
- **Xcode** 15+ (for iOS builds) with CocoaPods
- An Android device or emulator (Android 8.0+, API 26+)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/rahullahoria/Intervity.git
cd Intervity

# Install JavaScript dependencies
bun install   # or npm install
```

### 2. Set Up Kokoro TTS on Android
We provide an automated setup script that pulls the Kokoro-82M INT8 bundle and pushes it to your connected device:

```bash
chmod +x scripts/setup_kokoro_device.sh
./scripts/setup_kokoro_device.sh
```

*(Note: The Android build process automatically fetches `sherpa-onnx.aar` during Gradle configuration, so no manual AAR downloads are needed.)*

### 3. Run the App

#### Android
```bash
# Start Metro bundler
npx react-native start

# In a separate terminal, install and launch on connected device
npx react-native run-android
```

#### iOS
```bash
cd ios && pod install && cd ..
npx react-native run-ios
```

### 4. Running Tests
Intervity includes an extensive unit and end-to-end test suite covering the conversational state machine, resume parsing, Bayesian EMA mastery math, and STAR scoring:

```bash
bun test
# or
npm test
```

---

## 🤝 Open Invitation for Collaborators!

**We are actively inviting engineers, researchers, and designers to build Intervity together.** If you believe education and career empowerment should be universally accessible and free, here are areas where your contributions will make a massive impact:

### 🌟 High-Priority Contribution Areas
1. **⚡ ML & Edge Acceleration:**
   - Optimize GGUF inference kernels (Qualcomm QNN, MediaTek NeuroPilot, Apple Metal / CoreML).
   - Fine-tune ultra-lightweight (1B–2B) interview specialist models for conversational dialogue.
2. **🎙️ Voice & DSP Audio Engineering:**
   - Enhance the C++ WebRTC AEC / VAD pipeline for noisy environments.
   - Add multilingual phoneme sets (Hindi, Spanish, Mandarin, German, etc.) to Kokoro.
3. **📱 React Native & Native Modules:**
   - Port the iOS native audio unit pipeline to full parity with Android's `AudioTrack` engine.
   - Refactor UI animations with Reanimated 3 worklets for zero-jank 120Hz rendering.
4. **🧠 Interview Content & Curriculum Engineering:**
   - Author engineering rubrics, behavioral STAR evaluation heuristics, and domain question trees (Frontend, Backend, DevOps, Data Engineering, ML).
   - Design dynamic coding whiteboard drills and system design canvas components.

Read our [**Contributing Guide (CONTRIBUTING.md)**](CONTRIBUTING.md) to get started, and join the discussions!

---

## 📂 Project Structure

```
Intervity/
├── android/                   # Native Android host & Sherpa-ONNX VoiceAudioEngine
│   └── app/src/main/
│       ├── AndroidManifest.xml # Configured with modern launcher & round adaptive icons
│       ├── java/com/
│       │   ├── goairm/intervity/  # MainApplication & MainActivity
│       │   └── offlineinterview/audio/ # JSI AudioTrack & Kokoro C++ bridge
│       └── res/               # Mipmap launcher icons & adaptive XML suite
├── ios/                       # Native iOS host & CoreAudio engine
├── src/
│   ├── analytics/             # STAR method, mistake taxonomy & prosody analysis
│   ├── components/            # RiveMascot, VoiceOrb, SubtitleBar, RadarChart, PacingMeter
│   │   └── icons/             # AppIcons.tsx (unified SVG vector icon design system)
│   ├── core/
│   │   ├── agent/             # Autonomous Coaching Harness & SQLite memory
│   │   ├── audio/             # Full-duplex audio state machine & AEC logic
│   │   ├── llm/               # Local Llama / MiniCPM prompt & generation orchestrator
│   │   ├── resume/            # Fast on-device regex & heuristic resume parser
│   │   ├── stt/               # Whisper speech-to-text service
│   │   └── tts/               # Kokoro TTS service interface
│   ├── database/              # SQLite schema, migrations & Bayesian EMA skill store
│   ├── hooks/                 # Custom React hooks (interview engine, agent coaching, mastery, drills)
│   ├── navigation/            # React Navigation stack with SafeAreaProvider
│   ├── screens/               # AgentCoaching, ModelManager, Dashboard, Drills
│   └── theme/                 # Dark aesthetic design system & color tokens
├── tests/                     # 23+ unit & E2E integration test suites
└── scripts/                   # Model downloaders, device provisioning & icon generators
```

---

## 📜 Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment. Please review our [Code of Conduct](CODE_OF_CONDUCT.md) before participating.

---

## ⚖️ License

Intervity is released under the **[Apache 2.0 License](LICENSE)**. 

Free to use, modify, distribute, and contribute. Build it, learn with it, share it.

---

*Made with ❤️ for developers and job seekers everywhere. Learning should belong to everyone.*
