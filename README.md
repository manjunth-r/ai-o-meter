# ⚡ AI-o-Meter — Client-Side AI Content Likelihood Meter

<p align="center">
  <img src="icons/icon-128.png" alt="AI-o-Meter Logo" width="96" height="96" />
</p>

<p align="center">
  <strong>Instant, 100% client-side AI likelihood gauge for any webpage with a transparent per-signal breakdown.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-blue?style=flat-square" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Privacy-100%25%20Local-2E9E5B?style=flat-square" alt="100% Local" />
  <img src="https://img.shields.io/badge/No%20API%20Keys-Required-blueviolet?style=flat-square" alt="No API Keys" />
  <img src="https://img.shields.io/badge/License-MIT-black?style=flat-square" alt="License MIT" />
</p>

---

## 📖 Overview

Readers currently have no fast, in-context way to gauge how much of a webpage's text is likely AI-generated. Existing tools require copy-pasting text into third-party sites, break reading flow, send data to remote servers, and are opaque about *why* a score was given.

**AI-o-Meter** is a lightweight Manifest V3 Chrome extension that scores webpage text in real-time, **entirely client-side**, with an intuitive **Icon Spectrum** (Human · Mixed · Robot) and a transparent 6-signal breakdown.

---

## ✨ Features

- **🎯 Instant Icon Spectrum:** Three anchor states (**Human**, **Mixed**, **Robot**) that illuminate and scale dynamically with a smooth slider dot indicating the exact score.
- **🔍 6 Transparent Heuristic Signals:** No black-box single number — inspect the exact breakdown of what contributed to the score.
- **🏷️ Real-Time Toolbar Badge:** Dynamic score percentage and badge color (`#2E9E5B` Green, `#D89A2C` Amber, `#C2482C` Coral) right in your browser toolbar.
- **🔒 100% Client-Side & Private:** Zero network requests, zero telemetry, zero model downloads. Text never leaves your device.
- **⚡ Sub-50ms Execution:** Pure, optimized JavaScript heuristics that scan typical 1,500-word articles in milliseconds.
- **🧪 Interactive Playground:** Test custom text or benchmark presets directly in the popup or standalone test harness.

---

## 🔬 How It Works — The 6 Heuristic Signals

| # | Signal | What It Measures | Detection Logic |
|---|---|---|---|
| **1** | **Burstiness** | Sentence-length variance | Measures standard deviation of token counts per sentence. Low variance (uniform sentence length) indicates AI; high variance indicates natural human rhythm. |
| **2** | **Cliché Density** | AI-phrase frequency | Matches against a curated dictionary of 180+ GPT-isms (*"delve into", "rich tapestry", "testament to", "in today's fast-paced world"*, etc.) normalized per 100 words. |
| **3** | **Lexical Diversity** | Vocabulary repetition | Computes rolling Type-Token Ratio (unique words $\div$ total words) to detect flat repetition. |
| **4** | **Structural Tells** | Formatting patterns | Detects em-dash frequency (`—`), numbered list formulas (*"Firstly / Secondly / Finally"*), and structured bullet density. |
| **5** | **Formality & Contractions** | Conversational markers | Ratio of natural contractions (*"don't", "it's", "I've"*) and informal punctuation. Low ratio indicates stiff formal default LLM tone. |
| **6** | **Opener Repetition** | Transitional tics | Flags formulaic transitional connectors starting paragraphs (*"Furthermore,", "Moreover,", "In conclusion,"*). |

---

## 🚀 Quickstart & Installation

### Load Unpacked in Google Chrome

1. **Clone the repository:**
   ```bash
   git clone https://github.com/manjunth-r/ai-o-meter.git
   cd ai-o-meter
   ```

2. **Open Chrome Extensions:**
   - Navigate to `chrome://extensions` in your browser.
   - Toggle **Developer mode** on (top-right corner).

3. **Load the Extension:**
   - Click **Load unpacked** (top-left).
   - Select the `ai-o-meter` project directory.

4. **Pin & Browse:**
   - Pin the **AI-o-Meter** icon to your Chrome toolbar.
   - Open any article or blog post to see the live score badge!

---

## 🧪 Testing & Verification

### 1. Run Automated Unit Tests
```bash
node test/test-analyzer.js
```
*Validates monotonic score ordering across Human, Mixed, and AI benchmarks.*

### 2. Launch Local Test Harness
```bash
node scripts/serve.js
```
Open `http://localhost:3456/test/test-page.html` in your browser to test live DOM extraction and the popup simulator across 3 benchmark articles.

---

## 📁 Repository Structure

```
ai-o-meter/
├── manifest.json              # Manifest V3 configuration
├── icons/                     # 16px, 48px, 128px PNG extension icons
├── src/
│   ├── cliches.js             # Curated dictionary of 180+ LLM phrases & buzzwords
│   ├── analyzer.js            # Core heuristic detection engine & scoring formula
│   └── text-extractor.js      # Clean DOM text extraction (ignoring boilerplate)
├── content/
│   └── content.js             # Content script: auto-scans pages and syncs with badge
├── background/
│   └── background.js          # Service worker: manages toolbar badge text and colors
├── popup/
│   ├── popup.html             # Icon Spectrum popup UI (340px width)
│   ├── popup.css              # Custom styling with Space Grotesk & Inter typography
│   └── popup.js               # Popup controller & manual evaluation drawer
├── test/
│   ├── test-page.html         # Interactive test harness with 3 benchmark articles
│   └── test-analyzer.js       # Node.js automated verification suite
├── scripts/
│   ├── generate-icons.js      # Icon generator script
│   └── serve.js               # Static preview server
├── PRD-ai-content-meter.md    # Product Requirements Document
├── CHROMEWEBSTORE.md          # Chrome Web Store listing metadata & disclosures
└── README.md                  # Project documentation
```

---

## 📄 License

MIT License. Free for open-source and personal use.
