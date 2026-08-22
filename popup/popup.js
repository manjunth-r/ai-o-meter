/**
 * AI-o-Meter Popup Controller
 * Renders the Icon Spectrum UI and manages active tab communication and manual testing.
 */

// Sample texts for instant demo testing
const SAMPLE_TEXTS = {
  human: `Hey everyone! So yesterday I was debugging this weird memory leak in our WebSocket service and honestly, it took me like 4 hours to realize I had simply forgotten to unsubscribe from the heartbeat listener. Classic rookie mistake, right? Anyway, after drinking two cups of cold coffee and swearing at my terminal, everything clicked into place. The fix was literally two lines of code in the cleanup hook. I'm writing this quick post so nobody else loses their entire afternoon over something this silly! Don't repeat my mistakes.`,

  mixed: `When we redesigned our core dashboard last quarter, our biggest headache was keeping complex state synchronized across tabs. I've spent the better part of three weeks profiling re-renders, and honestly, raw Redux wasn't cutting it anymore. We decided to try hierarchical statecharts instead.

First and foremost, let us delve into the architectural foundations of statecharts. It is important to note that state synchronization plays a pivotal role in ensuring deterministic user flows. By eliminating impossible states, developers can harness the power of explicit transitions.

Furthermore, integrating state machines with reactive streams offers a structured mechanism for handling asynchronous side effects. The approach allows engineering teams to unlock new possibilities when orchestrating multi-step authentication workflows.

So if your app is drowning in boolean flags like isLoading and isError, give statecharts a shot. It took us a few days to get used to the syntax, but it completely eliminated our stale UI bugs.`,

  robot: `In today's fast-paced digital landscape, artificial intelligence plays a pivotal role in reshaping traditional enterprise workflows. It is important to note that machine learning stands as a testament to technological innovation, offering a plethora of multifaceted solutions across diverse sectors.
Furthermore, forward-thinking organizations must delve into cutting-edge paradigms to foster sustainable innovation and operational excellence. Harnessing the power of automated intelligence unlocks unprecedented opportunities — creating a rich tapestry of data-driven capabilities.
Additionally, modern enterprises are poised to revolutionize customer engagement by adopting holistic generative frameworks. Firstly, accelerating deployment cycles through automated pipelines; secondly, enhancing predictive telemetry; thirdly, fostering cross-functional synergy.
In conclusion, navigating the complexities of the modern technological era requires an unwavering commitment to continuous advancement. Embracing this revolutionary journey is of paramount importance for long-term strategic success.`
};

let currentLiveData = null;

// DOM Elements
const popupShell = document.getElementById('popupShell');
const domainText = document.getElementById('domainText');
const wordsText = document.getElementById('wordsText');
const btnRescan = document.getElementById('btnRescan');
const btnToggleManual = document.getElementById('btnToggleManual');
const manualDrawer = document.getElementById('manualDrawer');
const customTextInput = document.getElementById('customTextInput');
const btnAnalyzeCustom = document.getElementById('btnAnalyzeCustom');
const btnRestoreLive = document.getElementById('btnRestoreLive');

const slotHuman = document.getElementById('slotHuman');
const slotMixed = document.getElementById('slotMixed');
const slotRobot = document.getElementById('slotRobot');
const trackFill = document.getElementById('trackFill');
const trackDot = document.getElementById('trackDot');

const verdictText = document.getElementById('verdictText');
const verdictHighlight = document.getElementById('verdictHighlight');
const scorePill = document.getElementById('scorePill');
const subverdictText = document.getElementById('subverdictText');

const barBurstiness = document.getElementById('barBurstiness');
const valBurstiness = document.getElementById('valBurstiness');
const barCliches = document.getElementById('barCliches');
const valCliches = document.getElementById('valCliches');
const barLexical = document.getElementById('barLexical');
const valLexical = document.getElementById('valLexical');
const barFormality = document.getElementById('barFormality');
const valFormality = document.getElementById('valFormality');
const barStructure = document.getElementById('barStructure');
const valStructure = document.getElementById('valStructure');

/**
 * Updates all visual elements with the analysis result.
 */
function renderAnalysis(data) {
  if (!data) return;

  const score = Math.max(0, Math.min(100, data.score || 0));
  const category = data.category || 'human';

  // Update theme colors
  const accent = data.accentColor || (category === 'human' ? '#2E9E5B' : category === 'mixed' ? '#D89A2C' : '#C2482C');
  const accentBg = data.accentBg || (category === 'human' ? '#E4F5EA' : category === 'mixed' ? '#FBF0DB' : '#FBE6E0');

  popupShell.style.setProperty('--accent', accent);
  popupShell.style.setProperty('--accent-bg', accentBg);

  // Update Header
  domainText.textContent = data.domain || 'Current Page';
  domainText.title = data.domain || '';
  wordsText.textContent = `${(data.wordCount || 0).toLocaleString()} words`;

  // Update Active Icon Slot
  slotHuman.classList.toggle('active', category === 'human');
  slotMixed.classList.toggle('active', category === 'mixed');
  slotRobot.classList.toggle('active', category === 'robot');

  // Update Slider & Dot
  trackFill.style.width = `${score}%`;
  trackDot.style.left = `${score}%`;

  // Update Verdict
  if (category === 'human') {
    verdictText.innerHTML = `Likely <span class="pct" id="verdictHighlight">human-written</span> <span class="score-pill" id="scorePill">${score}%</span>`;
  } else if (category === 'mixed') {
    verdictText.innerHTML = `Looks <span class="pct" id="verdictHighlight">human-edited AI</span> <span class="score-pill" id="scorePill">${score}%</span>`;
  } else {
    verdictText.innerHTML = `Likely <span class="pct" id="verdictHighlight">AI-generated</span> <span class="score-pill" id="scorePill">${score}%</span>`;
  }

  subverdictText.textContent = data.subverdict || '';

  // Update Breakdown Bars
  const breakdown = data.breakdown || { burstiness: 0, cliches: 0, lexical: 0, formality: 0, structure: 0 };

  barBurstiness.style.width = `${breakdown.burstiness}%`;
  valBurstiness.textContent = `${breakdown.burstiness}%`;

  barCliches.style.width = `${breakdown.cliches}%`;
  valCliches.textContent = `${breakdown.cliches}%`;

  barLexical.style.width = `${breakdown.lexical}%`;
  valLexical.textContent = `${breakdown.lexical}%`;

  barFormality.style.width = `${breakdown.formality}%`;
  valFormality.textContent = `${breakdown.formality}%`;

  barStructure.style.width = `${breakdown.structure}%`;
  valStructure.textContent = `${breakdown.structure}%`;
}

/**
 * Fetches page analysis from current active tab.
 */
async function loadActiveTabAnalysis() {
  domainText.textContent = 'Scanning...';
  wordsText.textContent = '...';

  try {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      // Fallback for standalone preview
      const demoResult = analyzeText(SAMPLE_TEXTS.human, 'journal.samwrites.dev');
      currentLiveData = demoResult;
      renderAnalysis(demoResult);
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab || !tab.id) {
      fallbackToSample('No active tab detected');
      return;
    }

    let urlDomain = '';
    try {
      if (tab.url) {
        const u = new URL(tab.url);
        urlDomain = u.hostname;
      }
    } catch (e) {
      urlDomain = 'tab';
    }

    // Check if this is a chrome:// or edge:// internal page
    if (tab.url && (tab.url.startsWith('chrome://') || tab.url.startsWith('edge://') || tab.url.startsWith('chrome-extension://'))) {
      domainText.textContent = urlDomain || 'Browser Internal';
      wordsText.textContent = 'N/A';
      subverdictText.textContent = 'Browser internal pages cannot be analyzed. Open an article or try manual text analysis.';
      manualDrawer.classList.add('open');
      return;
    }

    // Try messaging the content script
    try {
      const response = await chrome.tabs.sendMessage(tab.id, { type: 'GET_PAGE_ANALYSIS' });
      if (response && response.result) {
        currentLiveData = response.result;
        renderAnalysis(response.result);
        return;
      }
    } catch (msgErr) {
      // Content script may not be injected yet, attempt programmatic evaluation
    }

    // Programmatic script injection fallback
    try {
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          const ignore = 'script, style, noscript, nav, footer, header, svg';
          const clone = document.body ? document.body.cloneNode(true) : null;
          if (!clone) return '';
          clone.querySelectorAll(ignore).forEach(el => el.remove());
          return clone.innerText || '';
        }
      });

      if (results && results[0] && results[0].result) {
        const pageText = results[0].result;
        const analysis = analyzeText(pageText, urlDomain);
        currentLiveData = analysis;
        renderAnalysis(analysis);
        return;
      }
    } catch (scriptErr) {
      console.warn('Script injection failed:', scriptErr);
    }

    // If still no result, render empty guidance
    domainText.textContent = urlDomain || 'Webpage';
    wordsText.textContent = '0 words';
    subverdictText.textContent = 'Could not extract article text from this page. Try clicking Rescan or evaluate custom text.';
  } catch (err) {
    console.error('Error in loadActiveTabAnalysis:', err);
    fallbackToSample('Error loading tab');
  }
}

function fallbackToSample(reason) {
  domainText.textContent = 'sample-demo';
  const defaultSample = analyzeText(SAMPLE_TEXTS.human, 'journal.samwrites.dev');
  renderAnalysis(defaultSample);
}

// Event Listeners
btnRescan.addEventListener('click', async () => {
  btnRescan.style.transform = 'rotate(180deg)';
  setTimeout(() => { btnRescan.style.transform = 'none'; }, 300);

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      await chrome.tabs.sendMessage(tab.id, { type: 'RESCAN_PAGE' });
    }
  } catch (e) {
    // Ignore error
  }
  await loadActiveTabAnalysis();
});

btnToggleManual.addEventListener('click', () => {
  manualDrawer.classList.toggle('open');
});

// Preset sample buttons
document.querySelectorAll('.preset-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const sampleKey = btn.getAttribute('data-sample');
    const text = SAMPLE_TEXTS[sampleKey];
    if (text) {
      customTextInput.value = text;
      const domains = {
        human: 'journal.samwrites.dev',
        mixed: 'producthub.io/blog',
        robot: 'techinsights-daily.com'
      };
      const result = analyzeText(text, domains[sampleKey] || 'sample.dev');
      renderAnalysis(result);
    }
  });
});

btnAnalyzeCustom.addEventListener('click', () => {
  const text = customTextInput.value.trim();
  if (text.length > 0) {
    const result = analyzeText(text, 'custom-input');
    renderAnalysis(result);
  }
});

btnRestoreLive.addEventListener('click', () => {
  if (currentLiveData) {
    renderAnalysis(currentLiveData);
    manualDrawer.classList.remove('open');
  } else {
    loadActiveTabAnalysis();
    manualDrawer.classList.remove('open');
  }
});

// Slot interactive preview
[slotHuman, slotMixed, slotRobot].forEach(slot => {
  slot.addEventListener('click', () => {
    const slotType = slot.getAttribute('data-slot');
    const sample = SAMPLE_TEXTS[slotType];
    if (sample) {
      const domains = {
        human: 'journal.samwrites.dev',
        mixed: 'producthub.io/blog',
        robot: 'techinsights-daily.com'
      };
      const result = analyzeText(sample, domains[slotType]);
      renderAnalysis(result);
    }
  });
});

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadActiveTabAnalysis();
});
