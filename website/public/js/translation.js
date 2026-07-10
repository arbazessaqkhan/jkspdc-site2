(function() {
  const targetLang = localStorage.getItem('preferredLanguage') || 'en';
  if (targetLang === 'en') return; // No translation needed for English

  const API_ENDPOINT = 'https://translation-plugin.bhashini.co.in/v2/translate-text';
  const CHUNK_SIZE = 25;
  const CACHE_KEY = 'jkspdc_translation_cache';
  
  // Load cache from localStorage
  let translationCache = {};
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (stored) {
      translationCache = JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load translation cache:', e);
  }

  if (!translationCache[targetLang]) {
    translationCache[targetLang] = {};
  }

  // To prevent multiple concurrent API requests for the same texts, keep track of pending text translations
  const pendingTranslations = new Set();

  // Helper to save cache
  function saveCache() {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(translationCache));
    } catch (e) {
      console.warn('Failed to save translation cache (likely quota exceeded):', e);
    }
  }

  // Helper to normalize and trim text
  function cleanText(text) {
    return text ? text.replace(/\s+/g, ' ').trim() : '';
  }

  // Helper to check if a node or its ancestors should be skipped
  function shouldSkipNode(node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const skipTags = ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME', 'PRE', 'CODE'];
      if (skipTags.includes(node.tagName)) return true;
      if (node.classList.contains('dont-translate') || node.classList.contains('bhashini-skip-translation')) return true;
    }
    
    // Check ancestors up to 5 levels
    let parent = node.parentElement;
    let level = 0;
    while (parent && level < 5) {
      if (parent.classList.contains('dont-translate') || 
          parent.classList.contains('bhashini-skip-translation') ||
          ['SCRIPT', 'STYLE', 'NOSCRIPT', 'IFRAME'].includes(parent.tagName)) {
        return true;
      }
      parent = parent.parentElement;
      level++;
    }
    return false;
  }

  // Check if text is mostly numbers, symbols, or emails
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,7}\b/;
  const numOrSymbolRegex = /^[\d\s\p{P}–—›»«•]+$/u; // numbers, spaces, punctuation, symbols

  function isIgnoredText(text) {
    if (!text || text.length <= 1) return true;
    if (emailRegex.test(text)) return true;
    if (numOrSymbolRegex.test(text)) return true;
    return false;
  }

  // Recursively collect translatable text nodes
  function collectTranslatableNodes(rootNode) {
    const list = [];
    
    function traverse(node) {
      if (!node) return;
      if (shouldSkipNode(node)) return;

      if (node.nodeType === Node.TEXT_NODE) {
        const text = cleanText(node.nodeValue);
        if (text && !isIgnoredText(text) && node._translatedTo !== targetLang) {
          list.push({ type: 'text', node: node, original: text });
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Placeholders
        if (node.hasAttribute('placeholder')) {
          const placeholder = cleanText(node.getAttribute('placeholder'));
          if (placeholder && !isIgnoredText(placeholder) && node._placeholderTranslatedTo !== targetLang) {
            list.push({ type: 'placeholder', node: node, original: placeholder });
          }
        }
        // Titles
        if (node.hasAttribute('title')) {
          const title = cleanText(node.getAttribute('title'));
          if (title && !isIgnoredText(title) && node._titleTranslatedTo !== targetLang) {
            list.push({ type: 'title', node: node, original: title });
          }
        }
        // Traverse children
        for (let i = 0; i < node.childNodes.length; i++) {
          traverse(node.childNodes[i]);
        }
      }
    }

    traverse(rootNode);
    return list;
  }

  // Translate a list of collected nodes
  async function translateNodes(nodes) {
    if (nodes.length === 0) return;

    const toFetch = [];
    const fetchNodes = [];

    // First pass: apply cache immediately and identify what needs fetching
    nodes.forEach(item => {
      const cached = translationCache[targetLang][item.original];
      if (cached) {
        applyTranslation(item, cached);
      } else {
        // Avoid duplicate active API calls for the same text
        if (!pendingTranslations.has(item.original)) {
          toFetch.push(item.original);
          pendingTranslations.add(item.original);
        }
        fetchNodes.push(item);
      }
    });

    if (toFetch.length === 0) return;

    // Fetch in chunks of CHUNK_SIZE
    const chunks = [];
    for (let i = 0; i < toFetch.length; i += CHUNK_SIZE) {
      chunks.push(toFetch.slice(i, i + CHUNK_SIZE));
    }

    // Process chunks
    await Promise.all(chunks.map(async (chunk) => {
      try {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetLanguage: targetLang,
            sourceLanguage: 'en',
            textData: chunk
          })
        });

        if (!response.ok) {
          throw new Error(`API returned status ${response.status}`);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          data.forEach(item => {
            if (item && item.source && item.target) {
              const srcClean = cleanText(item.source);
              const tgtClean = cleanText(item.target);
              translationCache[targetLang][srcClean] = tgtClean;
            }
          });
          saveCache();

          // Apply translations to the nodes waiting for this chunk
          fetchNodes.forEach(item => {
            const cached = translationCache[targetLang][item.original];
            if (cached) {
              applyTranslation(item, cached);
            }
          });
        }
      } catch (err) {
        console.error('Error translating chunk:', err, chunk);
      } finally {
        // Remove from pending list
        chunk.forEach(txt => pendingTranslations.delete(txt));
      }
    }));
  }

  // Apply the translation to the DOM node
  function applyTranslation(item, translatedText) {
    if (item.type === 'text') {
      item.node.nodeValue = translatedText;
      item.node._translatedTo = targetLang;
    } else if (item.type === 'placeholder') {
      item.node.setAttribute('placeholder', translatedText);
      item.node._placeholderTranslatedTo = targetLang;
    } else if (item.type === 'title') {
      item.node.setAttribute('title', translatedText);
      item.node._titleTranslatedTo = targetLang;
    }
  }

  // Run the full translation of the page body
  function translatePage() {
    const nodes = collectTranslatableNodes(document.body);
    translateNodes(nodes);
  }

  // Run initial translation when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', translatePage);
  } else {
    translatePage();
  }

  // MutationObserver for dynamic content
  const observer = new MutationObserver((mutations) => {
    let needsTranslation = false;
    const addedNodesList = [];
    
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
          addedNodesList.push(node);
          needsTranslation = true;
        }
      });
    });

    if (needsTranslation) {
      let allCollected = [];
      addedNodesList.forEach(node => {
        allCollected = allCollected.concat(collectTranslatableNodes(node));
      });
      if (allCollected.length > 0) {
        translateNodes(allCollected);
      }
    }
  });

  // Start observing body once it is available
  function initObserver() {
    if (document.body) {
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Translate any iframes
      translateSameOriginIframes();
    } else {
      setTimeout(initObserver, 50);
    }
  }
  initObserver();

  // Helper for same-origin iframes
  function translateSameOriginIframes() {
    const iframes = document.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      function process() {
        try {
          if (iframe.contentDocument && iframe.contentDocument.body) {
            const nodes = collectTranslatableNodes(iframe.contentDocument.body);
            translateNodes(nodes);
            
            // Set up MutationObserver inside iframe
            const iframeObserver = new MutationObserver((mutations) => {
              let iframeNodes = [];
              mutations.forEach(mut => {
                mut.addedNodes.forEach(n => {
                  iframeNodes = iframeNodes.concat(collectTranslatableNodes(n));
                });
              });
              if (iframeNodes.length > 0) {
                translateNodes(iframeNodes);
              }
            });
            iframeObserver.observe(iframe.contentDocument.body, { childList: true, subtree: true });
          }
        } catch (e) {
          // Cross-origin iframe, ignore
        }
      }

      if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
        process();
      } else {
        iframe.addEventListener('load', process);
      }
    });
  }

})();
