# Contributing to Intervity 🤝

First off, thank you for taking the time to contribute! 🎉

**Intervity** is built on the belief that high-quality, AI-driven learning and interview coaching should be **100% free, private, and accessible to everyone in the world without subscriptions or cloud dependencies.** 

We welcome contributions of all kinds—from edge ML optimizations and native audio engineering to UI polish, curriculum design, bug reports, and documentation improvements.

---

## 📋 Table of Contents
1. [Code of Conduct](#code-of-conduct)
2. [How to Contribute](#how-to-contribute)
   - [Reporting Bugs](#reporting-bugs)
   - [Suggesting Features & Enhancements](#suggesting-features--enhancements)
   - [Contributing Code](#contributing-code)
   - [Contributing Interview Curriculums & Question Banks](#contributing-interview-curriculums--question-banks)
3. [Development Setup](#development-setup)
4. [Coding Standards & Conventions](#coding-standards--conventions)
5. [Testing & Verification](#testing--verification)
6. [Submitting a Pull Request](#submitting-a-pull-request)
7. [Recognition & Community](#recognition--community)

---

## 📜 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please treat all contributors with respect and kindness.

---

## 💡 How to Contribute

### Reporting Bugs
If you encounter a bug:
1. Search existing [GitHub Issues](https://github.com/rahullahoria/Intervity/issues) to verify it hasn't already been reported.
2. If not, open a new issue using our **Bug Report Template**.
3. Include device specifications (Android OS version, phone model, RAM), reproduction steps, and relevant `adb logcat` output.

### Suggesting Features & Enhancements
Feature ideas are warmly welcomed! When suggesting a feature:
- Explain the user problem it solves.
- Consider edge performance and memory constraints (remember: Intervity must run 100% on-device on mid-tier hardware).
- Open a feature request in GitHub Discussions or Issues.

### Contributing Code
Areas where help is immediately needed:
- **ML / NPU Acceleration:** Accelerating GGUF execution with NPU backends (QNN, MediaTek APU, Metal).
- **DSP & Audio:** Enhancing Acoustic Echo Cancellation (AEC), voice activity detection (VAD), and low-latency buffer management.
- **Multilingual Support:** Adding support for non-English speech models and multilingual Kokoro phoneme sets.
- **iOS Parity:** Building the equivalent high-performance JSI audio track engine for iOS.
- **UI/UX Polish:** Adding fluid 120 FPS Reanimated 3 transitions and interactive system design whiteboarding.

---

## 💻 Development Setup

### 1. Fork & Clone
```bash
git clone https://github.com/<your-username>/Intervity.git
cd Intervity
```

### 2. Install Dependencies
```bash
bun install
# or: npm install
```

### 3. Setup Android Audio Assets
Run the automated Kokoro asset installer with a connected device or emulator:
```bash
chmod +x scripts/setup_kokoro_device.sh
./scripts/setup_kokoro_device.sh
```

### 4. Run the Dev Server & App
```bash
# Terminal 1: Metro bundler
npx react-native start

# Terminal 2: Run on Android
npx react-native run-android
```

---

## 🎨 Coding Standards & Conventions

- **TypeScript:** Use strict typing. Avoid `any` wherever possible.
- **Functional Components:** Use React functional components with hooks.
- **Conventional Commits:** Write clean commit messages following the [Conventional Commits](https://www.conventionalcommits.org/) specification:
  - `feat: add multilingual phoneme loader for Kokoro`
  - `fix: prevent AudioTrack buffer underflow during barge-in`
  - `perf: reduce radar chart re-renders with React.memo`
  - `docs: update setup instructions for M-series Macs`
  - `test: add unit tests for STAR method result parser`

---

## 🧪 Testing & Verification

Before submitting code, ensure all automated tests and typechecks pass:

```bash
# 1. Run full test suite
bun test

# 2. Run TypeScript strict typecheck
bun run typecheck

# 3. Run ESLint
bun run lint
```

When introducing new functionality or fixing bugs, **always include accompanying unit or integration tests** in the `tests/` directory.

---

## 🚀 Submitting a Pull Request

1. Create a descriptive branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Commit your changes with clear messages.
3. Push to your fork:
   ```bash
   git push origin feat/your-feature-name
   ```
4. Open a Pull Request against `Intervity/main`.
5. Fill out the PR template describing your changes, motivation, and test steps.
6. A maintainer will review your PR and provide feedback promptly!

---

## 🌟 Recognition & Community

Every contributor who helps make learning free and accessible deserves recognition. Contributors will be featured in our README and release notes. 

Thank you for helping democratize AI career preparation for millions of candidates worldwide! 🚀
