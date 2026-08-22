# PRD — AI Content Meter (browser extension)

**Status:** Draft v1
**Owner:** MJ
**Last updated:** 2026-08-22

---

## 1. Problem

Readers have no fast, in-context way to gauge how much of a webpage's text is likely AI-generated. Existing tools (GPTZero, Winston, Originality.ai) require copy-pasting text into a separate site, break the reading flow, and are opaque about *why* a score was given.

## 2. Goal

A browser extension that scores the current page's text for AI-likelihood, entirely client-side, in real time, with a transparent per-signal breakdown — not just a black-box percentage.

## 3. Non-goals (v1)

- Not a definitive "AI vs human" verdict — framed as a likelihood estimate throughout, per Section 7.
- No backend classifier / transformer model / API calls. Fully local for v1.
- No watermark detection (not practically enforceable across providers yet).
- No image/video AI detection — text only.
- No editing history / cross-page tracking of a given piece of content.

## 4. Target user

Developers, researchers, and general readers who want a lightweight, always-on signal while browsing — not a forensic tool. Primary persona: someone evaluating a blog post, article, or docs page before trusting or citing it.

## 5. Detection engine (local, heuristic-based)

### 5.1 Why heuristics-only for v1

No model weights to ship or download, no inference latency, no privacy concern (text never leaves the device), and every signal is inspectable — the score can show its work, which is also a differentiator against existing tools that don't explain their output.

### 5.2 Signals

| # | Signal | What it measures | Method |
|---|--------|-------------------|--------|
| 1 | Burstiness | Sentence-length variance | Split text on `. ! ?`, compute stdev of sentence token counts. Low variance → AI-leaning. |
| 2 | Cliché / AI-phrase density | Frequency of known GPT-isms ("delve into," "it's important to note," "boasts," "tapestry," "in today's fast-paced world," etc.) | Match against curated ~150–200 term dictionary (shipped as local JSON), normalized per 100 words. |
| 3 | Lexical diversity | Vocabulary repetition | Type-token ratio (unique words ÷ total words) over rolling 100-word windows. Low diversity → AI-leaning. |
| 4 | Structural tells | Formatting patterns | Regex counts: em-dash frequency, heading/bullet density, "Firstly / Secondly / Finally" list patterns, bolded-phrase overuse. |
| 5 | Punctuation / contraction ratio | Formality of tone | Ratio of contractions ("it's," "don't") and informal punctuation (ellipses, exclamation) to total sentences. Low ratio → AI-leaning. |
| 6 | Paragraph-opener repetition | Transitional-word tics | Frequency of paragraphs starting with the same transition word/phrase across the page. |

### 5.3 Scoring

Transparent weighted sum, not a trained model:

```
score = clamp(
  w1*burstinessScore +
  w2*clichéPhraseDensity +
  w3*(1 - lexicalDiversity) +
  w4*structuralTellScore +
  w5*(1 - contractionRatio) +
  w6*paragraphOpenerRepetition,
  0, 100
)
```

- Each sub-signal normalized to 0–1 before weighting.
- Initial weights roughly equal; tuned by hand against a labeled sample (Section 5.4).
- Score, plus each raw sub-signal value, is retained so the UI can render a per-signal breakdown (already scoped in the popup concepts).

### 5.4 Calibration

- Collect 50–100 labeled samples: human-written blog/article text vs. AI-generated text on comparable topics/length.
- Run the scoring function against the set, manually inspect ranking quality, adjust weights — no training pipeline required for v1.
- Re-calibrate periodically as new AI-writing "tells" emerge or models change output style.

### 5.5 Explicitly out of scope for v1

- Perplexity via a real language model (needs an LM running client-side — too heavy for "simple and local").
- Transformer-based classifier (transformers.js) — reserved for a possible future "escalate to backend" tier for ambiguous scores (30–70% range), not v1.
- Non-English content — dictionary and heuristics are English-only at launch.

### 5.6 Performance requirements

- Full-page scan completes in < 200ms for a typical 1,500-word article on content script execution.
- No network calls — everything computed in-page, in a content script.
- Re-scan triggered only on significant DOM text changes (e.g. infinite scroll, SPA navigation), debounced.

## 6. UI / UX

### 6.1 Popup

- Fixed-width popup (~340px), single dominant visual, one line of plain-language verdict, optional signal breakdown below a divider.
- **Leading concept:** icon spectrum — three anchor icons (Human / Mixed / Robot), the applicable one highlighted and scaled up, a dot indicator sliding along a track to the precise score. Final visual direction still open; see linked concept files.
- Verdict copy always framed as likelihood, not fact (e.g. "Likely AI-generated," not "This is AI-generated") to avoid overclaiming given heuristic-only detection.
- Sub-line gives a one-sentence *why* (top contributing signal(s)), not just the score.

### 6.2 Toolbar icon

- Badge or icon tint reflects current page's score at a glance without opening the popup (color scale: green → amber → red).

### 6.3 In-page (stretch, not v1)

- Optional per-paragraph highlighting for high-confidence sections, deferred until core scoring is validated.

## 7. Framing & trust principles

- Always "AI likelihood," never a definitive claim — heuristic scoring has real false-positive/negative risk (e.g. flags formal non-native English writing, or misses heavily-edited AI text).
- Every score must be explainable via its sub-signals; no opaque single number without a "why" available on demand.
- No data leaves the device in v1 — this is both a privacy feature and a trust/positioning point vs. competitors.

## 8. Success metrics (v1)

- Scan completes within performance budget (Section 5.6) on 95% of tested pages.
- Manual accuracy check against calibration set: directionally correct ranking (human < mixed < AI) on ≥80% of samples — not a precision/recall target, since v1 is heuristic-only.
- Dogfood usability: can MJ tell *why* a page scored the way it did within 5 seconds of opening the popup, without reading documentation.

## 9. Open questions

- Final popup visual direction (icon spectrum vs. other explored concepts).
- Exact cliché-phrase dictionary contents and how it's kept current over time.
- Threshold boundaries for Human / Mixed / Robot icon categories (e.g. 0–33 / 34–66 / 67–100, or calibrated cutoffs).
- Whether toolbar badge shows a number or just a color, given limited badge space.

## 10. Milestones

1. **Detection core** — implement six signals + scoring function as a standalone JS module, testable outside the extension shell.
2. **Calibration** — build labeled sample set, hand-tune weights.
3. **Extension shell** — manifest v3, content script wiring, popup UI (chosen concept), toolbar badge.
4. **Dogfood pass** — MJ uses daily for a week, log misses/false positives, adjust dictionary and weights.
5. **v1 ship** — Chrome Web Store listing.
