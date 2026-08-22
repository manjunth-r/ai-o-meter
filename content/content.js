/**
 * AI-o-Meter Content Script
 * Automatically analyzes webpage content on load and responds to popup queries.
 */

(() => {
  let cachedResult = null;
  let scanTimeout = null;

  function runAnalysis() {
    try {
      const pageData = extractPageContent(document);
      if (!pageData.text || pageData.text.length < 50) {
        return null;
      }

      const result = analyzeText(pageData.text, pageData.domain);
      result.pageTitle = pageData.title;
      cachedResult = result;

      // Notify background service worker to update badge
      chrome.runtime.sendMessage({
        type: 'PAGE_ANALYZED',
        result
      }).catch(() => {
        // Background worker might be inactive, ignore
      });

      return result;
    } catch (err) {
      console.error('AI-o-Meter scan error:', err);
      return null;
    }
  }

  // Initial scan after DOM is ready
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(runAnalysis, 300);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(runAnalysis, 300);
    });
  }

  // Listen for messages from popup or background
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'GET_PAGE_ANALYSIS') {
      const result = cachedResult || runAnalysis();
      sendResponse({ result });
      return false;
    }

    if (request.type === 'RESCAN_PAGE') {
      const result = runAnalysis();
      sendResponse({ result });
      return false;
    }
  });

  // Observe significant DOM changes with debounce for SPAs
  const observer = new MutationObserver(() => {
    if (scanTimeout) clearTimeout(scanTimeout);
    scanTimeout = setTimeout(() => {
      runAnalysis();
    }, 1500);
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  }
})();
