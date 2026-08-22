/**
 * AI-o-Meter Heuristic Content Analyzer
 * Computes transparent, client-side AI likelihood scores across 6 key signals.
 */

// Support both Node.js (for testing) and browser contexts
let clichesModule;
if (typeof require !== 'undefined') {
  try {
    clichesModule = require('./cliches.js');
  } catch (e) {
    // browser or bundle fallback
  }
}

const CLICHES = (typeof AI_CLICHES !== 'undefined' ? AI_CLICHES : (clichesModule ? clichesModule.AI_CLICHES : [])).sort((a, b) => b.length - a.length);
const BUZZWORDS = (typeof AI_BUZZWORDS !== 'undefined' ? AI_BUZZWORDS : (clichesModule ? clichesModule.AI_BUZZWORDS : []));

const CONTRACTION_WORDS = new Set([
  "i'm", "i've", "i'll", "i'd", "you're", "you've", "you'll", "you'd",
  "he's", "he'd", "he'll", "she's", "she'd", "she'll", "it's", "we're",
  "we've", "we'll", "we'd", "they're", "they've", "they'll", "they'd",
  "that's", "who's", "what's", "where's", "when's", "why's", "how's",
  "can't", "cannot", "won't", "don't", "doesn't", "didn't", "isn't",
  "aren't", "wasn't", "weren't", "haven't", "hasn't", "hadn't", "wouldn't",
  "shouldn't", "couldn't", "mustn't", "let's", "there's", "here's", "ain't", "gonna", "wanna"
]);

const COMMON_TRANSITIONS = [
  "furthermore", "moreover", "additionally", "in addition", "consequently",
  "subsequently", "in conclusion", "to summarize", "in summary", "ultimately",
  "first and foremost", "notably", "importantly", "crucially", "essentially",
  "in essence", "overall", "as a result", "on the other hand", "lastly"
];

/**
 * Standardizes text: normalizes smart quotes and whitespace.
 */
function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '—');
}

/**
 * Tokenizes text into sentences and words.
 */
function tokenize(rawText) {
  const text = normalizeText(rawText);
  if (!text) {
    return { sentences: [], words: [], paragraphs: [], rawLength: 0, text: '' };
  }

  const rawLength = text.length;
  // Paragraphs
  const paragraphs = text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 20);

  // Sentences split on . ! ? or newline
  const sentenceMatches = text.match(/[^.!?\n]+(?:[.!?\n]+(?:\s+|$)|$)/g) || [];
  const sentences = sentenceMatches
    .map(s => s.trim())
    .filter(s => s.length > 5);

  // Words (retains internal apostrophes for contractions)
  const words = text
    .toLowerCase()
    .replace(/[^\w\s'-]/g, ' ')
    .split(/\s+/)
    .map(w => w.replace(/^[-']+|[-']+$/g, ''))
    .filter(w => w.length > 0);

  return { sentences, words, paragraphs, rawLength, text };
}

/**
 * Signal 1: Burstiness (Sentence length variance)
 * Measures standard deviation of token counts per sentence.
 */
function computeBurstiness(sentences) {
  if (sentences.length < 3) return { score: 0.35, variance: 0, stdev: 0, avgLen: 0 };

  const lengths = sentences.map(s => {
    const w = s.split(/\s+/).filter(x => x.length > 0);
    return w.length;
  });

  const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((acc, len) => acc + Math.pow(len - mean, 2), 0) / lengths.length;
  const stdev = Math.sqrt(variance);

  // Calibration:
  // High variance (stdev >= 10) -> Human (0.05 to 0.22)
  // Moderate variance (stdev 6 to 9.9) -> Mixed (0.25 to 0.55)
  // Low variance (stdev < 5) -> AI (0.70 to 0.95)
  let score;
  if (stdev >= 10.5) {
    score = 0.08;
  } else if (stdev >= 7.5) {
    score = 0.08 + (10.5 - stdev) * (0.32 / 3.0);
  } else if (stdev >= 4.5) {
    score = 0.40 + (7.5 - stdev) * (0.38 / 3.0);
  } else {
    score = Math.min(0.96, 0.78 + (4.5 - stdev) * 0.05);
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    stdev: Math.round(stdev * 10) / 10,
    mean: Math.round(mean * 10) / 10
  };
}

/**
 * Signal 2: Cliché & AI-phrase density
 * Non-overlapping phrase matching against curated dictionary.
 */
function computeClicheDensity(text, wordCount) {
  if (wordCount < 20) return { score: 0.1, matchCount: 0, density: 0, topMatches: [] };

  const lowerText = text.toLowerCase();
  let matchCount = 0;
  const matchedPhrases = [];
  let workingText = lowerText;

  CLICHES.forEach(cliche => {
    const pattern = new RegExp('\\b' + cliche.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'g');
    const matches = workingText.match(pattern);
    if (matches && matches.length > 0) {
      matchCount += matches.length;
      matchedPhrases.push({ phrase: cliche, count: matches.length });
      workingText = workingText.replace(pattern, ' _______ ');
    }
  });

  BUZZWORDS.forEach(buzz => {
    const pattern = new RegExp('\\b' + buzz + '\\b', 'g');
    const matches = workingText.match(pattern);
    if (matches && matches.length > 0) {
      matchCount += matches.length * 0.8;
    }
  });

  const densityPer100 = (matchCount / wordCount) * 100;

  // Calibration:
  // 0 to 0.3 / 100w -> 0.0 to 0.15 (Human)
  // 0.3 to 1.6 / 100w -> 0.15 to 0.60 (Mixed)
  // 1.6 to 4.0+ / 100w -> 0.60 to 0.98 (Robot AI)
  let score;
  if (densityPer100 <= 0.3) {
    score = densityPer100 * (0.15 / 0.3);
  } else if (densityPer100 <= 1.6) {
    score = 0.15 + (densityPer100 - 0.3) * (0.45 / 1.3);
  } else {
    score = Math.min(1.0, 0.60 + (densityPer100 - 1.6) * (0.40 / 2.0));
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    density: Math.round(densityPer100 * 10) / 10,
    matchCount: Math.round(matchCount),
    topMatches: matchedPhrases.slice(0, 4)
  };
}

/**
 * Signal 3: Lexical Diversity (Type-Token Ratio)
 */
function computeLexicalDiversity(words) {
  if (words.length < 30) return { score: 0.25, ttr: 0.7 };

  const windowSize = Math.min(70, words.length);
  const step = 25;
  let ttrSum = 0;
  let windows = 0;

  for (let i = 0; i <= words.length - windowSize; i += step) {
    const slice = words.slice(i, i + windowSize);
    const unique = new Set(slice).size;
    ttrSum += unique / windowSize;
    windows++;
  }

  const avgTTR = windows > 0 ? ttrSum / windows : new Set(words).size / words.length;

  let score;
  if (avgTTR >= 0.80) {
    score = 0.10;
  } else if (avgTTR >= 0.68) {
    score = 0.10 + (0.80 - avgTTR) * (0.40 / 0.12);
  } else {
    score = Math.min(0.95, 0.50 + (0.68 - avgTTR) * 3.0);
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    ttr: Math.round(avgTTR * 100) / 100
  };
}

/**
 * Signal 4: Structural tells
 */
function computeStructuralTells(text, wordCount) {
  if (wordCount < 30) return { score: 0.15, emDashCount: 0, listMarkers: 0 };

  const emDashMatches = text.match(/—|--/g) || [];
  const emDashDensity = (emDashMatches.length / wordCount) * 100;

  const listMatches = text.match(/\b(firstly|secondly|thirdly|finally)\b/gi) || [];
  const bulletMatches = text.match(/(?:^|\n)\s*(?:[\u2022\u25E6-]|(?:\d+\.))\s+/g) || [];

  const rawStructure = (emDashDensity * 0.4) + ((listMatches.length * 1.5 + bulletMatches.length * 0.5) / Math.max(1, wordCount / 100));

  let score;
  if (rawStructure <= 0.4) {
    score = rawStructure * (0.20 / 0.4);
  } else if (rawStructure <= 1.6) {
    score = 0.20 + (rawStructure - 0.4) * (0.50 / 1.2);
  } else {
    score = Math.min(0.95, 0.70 + (rawStructure - 1.6) * 0.2);
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    emDashCount: emDashMatches.length,
    listMarkers: listMatches.length + bulletMatches.length
  };
}

/**
 * Signal 5: Formality / Contraction ratio
 */
function computeFormality(text, words, wordCount) {
  if (wordCount < 20) return { score: 0.35, contractionRate: 0 };

  let contractionCount = 0;
  words.forEach(w => {
    if (CONTRACTION_WORDS.has(w)) {
      contractionCount++;
    }
  });

  const informalMarks = text.match(/[!?;]/g) || [];
  const totalConversationalMarkers = contractionCount + (informalMarks.length * 0.35);
  const ratePer100Words = (totalConversationalMarkers / wordCount) * 100;

  let score;
  if (ratePer100Words >= 1.8) {
    score = 0.08;
  } else if (ratePer100Words >= 0.7) {
    score = 0.08 + (1.8 - ratePer100Words) * (0.42 / 1.1);
  } else {
    score = Math.min(0.96, 0.50 + (0.7 - ratePer100Words) * 0.65);
  }

  return {
    score: Math.max(0, Math.min(1, score)),
    contractionCount,
    ratePer100Words: Math.round(ratePer100Words * 10) / 10
  };
}

/**
 * Signal 6: Paragraph-Opener repetition
 */
function computeParagraphOpeners(paragraphs) {
  if (paragraphs.length < 2) return { score: 0.2, transitionCount: 0 };

  let transitionOpenerCount = 0;
  paragraphs.forEach(p => {
    const firstFewWords = p.toLowerCase().split(/\s+/).slice(0, 3).join(' ');
    const hasTransition = COMMON_TRANSITIONS.some(t => firstFewWords.startsWith(t));
    if (hasTransition) {
      transitionOpenerCount++;
    }
  });

  const ratio = transitionOpenerCount / paragraphs.length;
  // If ratio >= 0.5 (e.g. half of paragraphs start with "Furthermore", "In conclusion")
  const score = Math.min(0.96, ratio * 1.5);

  return {
    score: Math.max(0, Math.min(1, score)),
    transitionCount: transitionOpenerCount,
    paragraphCount: paragraphs.length
  };
}

/**
 * Generates dynamic explanatory subverdict based on leading signals.
 */
function generateSubverdict(score, signals) {
  const { burstiness, cliches, lexical, structure, formality } = signals;

  if (score <= 35) {
    const reasons = [];
    if (burstiness.score < 0.35) reasons.push("uneven sentence rhythm");
    if (formality.score < 0.35) reasons.push("natural contractions");
    if (cliches.score < 0.25) reasons.push("organic vocabulary");
    if (structure.score < 0.35) reasons.push("conversational flow");

    if (reasons.length >= 2) {
      return `Uneven rhythm, first-person asides, ${reasons.slice(0, 2).join(', ')}.`;
    }
    return "Uneven rhythm, first-person asides, one typo left uncorrected.";
  }

  if (score <= 65) {
    const highSignals = [];
    if (cliches.score > 0.35) highSignals.push("transitional AI phrasing");
    if (burstiness.score > 0.4) highSignals.push("moderate rhythm");
    if (formality.score > 0.4) highSignals.push("formal tone");

    if (highSignals.length > 0) {
      return `Intro and outro read as drafted; sections show ${highSignals.join(' and ')}.`;
    }
    return "Intro and outro read as drafted; the middle section is likely AI-assisted.";
  }

  // Robot (score > 65)
  const robotTells = [];
  if (burstiness.score > 0.6) robotTells.push("uniform sentence length");
  if (cliches.score > 0.6) robotTells.push("dense AI clichés & buzzwords");
  if (formality.score > 0.6) robotTells.push("no contractions with formal tone");
  if (structure.score > 0.5) robotTells.push("formulaic transition patterns");

  if (robotTells.length >= 2) {
    return `${robotTells.slice(0, 2).join(', ').replace(/^\w/, c => c.toUpperCase())}, flat vocabulary throughout.`;
  }
  return "Uniform sentence length, no contractions, flat vocabulary throughout.";
}

/**
 * Main analysis function
 */
function analyzeText(rawText, domain = '') {
  const tokenData = tokenize(rawText);
  const { sentences, words, paragraphs, text } = tokenData;
  const wordCount = words.length;

  if (!text || wordCount < 20) {
    return {
      score: 0,
      category: 'human',
      categoryLabel: 'Mostly Human',
      verdictTitle: 'Insufficient text to analyze',
      subverdict: 'Page does not contain enough text for reliable scoring.',
      wordCount,
      domain: domain || 'unknown',
      accentColor: '#2E9E5B',
      accentBg: '#E4F5EA',
      breakdown: {
        burstiness: 0,
        cliches: 0,
        lexical: 0,
        structure: 0,
        formality: 0
      }
    };
  }

  // Compute 6 signals
  const burstiness = computeBurstiness(sentences);
  const cliches = computeClicheDensity(text, wordCount);
  const lexical = computeLexicalDiversity(words);
  const structure = computeStructuralTells(text, wordCount);
  const formality = computeFormality(text, words, wordCount);
  const openers = computeParagraphOpeners(paragraphs);

  // Weights (sum = 1.0)
  const W_BURSTINESS = 0.26;
  const W_CLICHES = 0.36;
  const W_LEXICAL = 0.10;
  const W_FORMALITY = 0.12;
  const W_OPENERS = 0.10;
  const W_STRUCTURE = 0.06;

  const rawScore = (
    burstiness.score * W_BURSTINESS +
    cliches.score * W_CLICHES +
    lexical.score * W_LEXICAL +
    structure.score * W_STRUCTURE +
    formality.score * W_FORMALITY +
    openers.score * W_OPENERS
  ) * 100;

  const score = Math.max(0, Math.min(100, Math.round(rawScore)));

  // Categorize
  let category, categoryLabel, verdictTitle, accentColor, accentBg;
  if (score <= 35) {
    category = 'human';
    categoryLabel = 'Mostly Human';
    verdictTitle = 'Likely human-written';
    accentColor = '#2E9E5B';
    accentBg = '#E4F5EA';
  } else if (score <= 65) {
    category = 'mixed';
    categoryLabel = 'Mixed';
    verdictTitle = 'Looks human-edited AI';
    accentColor = '#D89A2C';
    accentBg = '#FBF0DB';
  } else {
    category = 'robot';
    categoryLabel = 'Mostly Robot';
    verdictTitle = 'Likely AI-generated';
    accentColor = '#C2482C';
    accentBg = '#FBE6E0';
  }

  const subverdict = generateSubverdict(score, {
    burstiness,
    cliches,
    lexical,
    structure,
    formality,
    openers
  });

  return {
    score,
    category,
    categoryLabel,
    verdictTitle,
    subverdict,
    wordCount,
    domain: domain || 'current-page',
    accentColor,
    accentBg,
    breakdown: {
      burstiness: Math.round(burstiness.score * 100),
      cliches: Math.round(cliches.score * 100),
      lexical: Math.round(lexical.score * 100),
      structure: Math.round(structure.score * 100),
      formality: Math.round(formality.score * 100)
    },
    details: {
      burstinessStdev: burstiness.stdev,
      clicheMatches: cliches.matchCount,
      topCliches: cliches.topMatches,
      contractionRate: formality.ratePer100Words
    }
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { analyzeText, tokenize };
}
