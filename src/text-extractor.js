/**
 * Clean text extractor for web pages.
 * Extracts meaningful article/content text while ignoring navigation, ads, headers, and footers.
 */

function extractPageContent(doc = document) {
  if (!doc || !doc.body) {
    return { text: '', domain: '', title: '' };
  }

  const domain = (doc.location && doc.location.hostname) ? doc.location.hostname : '';
  const title = doc.title || '';

  // Tags and selectors to ignore
  const ignoreSelectors = [
    'script', 'style', 'noscript', 'nav', 'footer', 'header', 'aside',
    'svg', 'canvas', 'form', 'button', 'input', 'textarea', 'select',
    '.sidebar', '.comments', '.comment-section', '.nav', '.navigation',
    '.menu', '.ad', '.advertisement', '.social-share', '.cookie-banner',
    '#cookie-notice', '#comments', '[role="navigation"]', '[role="banner"]',
    '[role="contentinfo"]', '[aria-hidden="true"]'
  ];

  // Try finding primary content container first
  const contentSelectors = [
    'article',
    '[itemprop="articleBody"]',
    '.article-content',
    '.post-content',
    '.entry-content',
    '.markdown-body',
    'main',
    '#main-content',
    '#content',
    '.content'
  ];

  let mainContainer = null;
  for (const selector of contentSelectors) {
    const el = doc.querySelector(selector);
    if (el && el.innerText && el.innerText.trim().length > 100) {
      mainContainer = el;
      break;
    }
  }

  const targetRoot = mainContainer || doc.body;

  // Clone node so we can sanitize without altering live DOM
  const clone = targetRoot.cloneNode(true);

  // Remove ignore selectors from clone
  ignoreSelectors.forEach(sel => {
    try {
      const elements = clone.querySelectorAll(sel);
      elements.forEach(el => el.remove());
    } catch (e) {
      // ignore invalid selector error
    }
  });

  // Extract text from paragraphs, headings, and list items if possible
  const textBlocks = [];
  const contentNodes = clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, blockquote');

  if (contentNodes.length > 0) {
    contentNodes.forEach(node => {
      const text = node.innerText || node.textContent || '';
      const clean = text.trim().replace(/\s+/g, ' ');
      if (clean.length > 15) {
        textBlocks.push(clean);
      }
    });
  }

  let finalContent = textBlocks.join('\n\n');

  // Fallback to clone.innerText if block extraction is too small
  if (finalContent.length < 100) {
    const raw = clone.innerText || clone.textContent || '';
    finalContent = raw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 20)
      .join('\n\n');
  }

  return {
    text: finalContent,
    domain,
    title
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { extractPageContent };
}
