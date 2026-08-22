/**
 * AI-o-Meter Service Worker (Background Script)
 * Manages tab score caching and toolbar badge updates.
 */

// Colors for badges matching the design system
const BADGE_COLORS = {
  human: '#2E9E5B',  // Green
  mixed: '#D89A2C',  // Amber
  robot: '#C2482C'   // Coral/Red
};

// Listen for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PAGE_ANALYZED') {
    const tabId = sender.tab ? sender.tab.id : message.tabId;
    const { result } = message;

    if (tabId && result) {
      (async () => {
        try {
          // Store latest result for tab in session storage
          await chrome.storage.session.set({
            [`tab_${tabId}`]: result
          });

          // Update toolbar badge
          const badgeText = `${result.score}%`;
          const badgeColor = BADGE_COLORS[result.category] || '#777777';

          await chrome.action.setBadgeText({ tabId, text: badgeText });
          await chrome.action.setBadgeBackgroundColor({ tabId, color: badgeColor });
          await chrome.action.setBadgeTextColor({ tabId, color: '#FFFFFF' });
        } catch (err) {
          console.error('Error updating badge:', err);
        }
      })();
    }
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'GET_TAB_SCORE') {
    (async () => {
      try {
        const key = `tab_${message.tabId}`;
        const stored = await chrome.storage.session.get(key);
        sendResponse({ result: stored[key] || null });
      } catch (err) {
        sendResponse({ result: null, error: err.message });
      }
    })();
    return true;
  }
});

// Clean up stored tab data when tab is closed
chrome.tabs.onRemoved.addListener(async (tabId) => {
  try {
    await chrome.storage.session.remove(`tab_${tabId}`);
  } catch (e) {
    // Ignore cleanup errors
  }
});
