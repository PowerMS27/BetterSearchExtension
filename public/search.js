console.log("this is search.js");

function highlightText(searchTerm) {
  const start = Date.now();
  console.log("highlightText");

  removeHighlights();

  if (!searchTerm) {
    return;
  }

  const lowerSearchTerm = searchTerm.toLowerCase();
  const textNodes = getTextNodes(document.body);
  const ranges = getHighlightRanges(textNodes, lowerSearchTerm);

  ranges.forEach((range) => {
    try {
      wrapRangeInHighlight(range);
    } catch (e) {
      console.error("Failed to create valid range:", e);
    }
  });
  console.log(`Time elapsed: ${Date.now() - start} ms`);
}

function getTextNodes(node) {
  console.log("getTextNodes");
  const textNodes = [];

  function isHidden(element) {
    if (!(element instanceof Element)) return false; // if DOM el
    const style = window.getComputedStyle(element);
    if (style.display === "none" || style.visibility === "hidden") {
      return true;
    }
    return isHidden(element.parentNode); // check parents recursively
  }  

  const walker = document.createTreeWalker(
    node,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node) => {
        const parent = node.parentNode;
        if (isHidden(parent)) return NodeFilter.FILTER_REJECT; // hidden parents

        // unwanted tags
        const excludedTags = [
          "SCRIPT", "STYLE", "NOSCRIPT", "SVG", "META", "LINK",
          "IFRAME", "EMBED", "OBJECT", "BUTTON", "SELECT",
          "OPTION"
        ];
        if (excludedTags.includes(parent.tagName)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      },
    },
    false
  );

  let currentNode;
  while ((currentNode = walker.nextNode())) {
    textNodes.push(currentNode);
  }

  return textNodes;
}

function getHighlightRanges(textNodes, searchTerm) {
  console.log("getHighlightRanges");
  const ranges = [];
  let fullText = "";
  const nodesInfo = [];

  // getting text string from text nodes
  textNodes.forEach((node) => {
    nodesInfo.push({
      node: node,
      start: fullText.length,
    });
    fullText += node.textContent;
  });

  const lowerFullText = fullText.toLowerCase();
  let index = 0;

  // search in full text
  while ((index = lowerFullText.indexOf(searchTerm, index)) !== -1) {
    const endIndex = index + searchTerm.length;
    const startNodeInfo = nodesInfo.find(
      (info) =>
        info.start <= index && index < info.start + info.node.textContent.length
    );
    const endNodeInfo = nodesInfo.find(
      (info) =>
        info.start < endIndex &&
        endIndex <= info.start + info.node.textContent.length
    );

    if (startNodeInfo && endNodeInfo) {
      const range = document.createRange();
      const startOffset = index - startNodeInfo.start;
      const endOffset = endIndex - endNodeInfo.start;

      try {
        range.setStart(startNodeInfo.node, startOffset);
        range.setEnd(endNodeInfo.node, endOffset);
        ranges.push(range);
      } catch (e) {
        console.error("Failed to create valid range:", e);
      }
    }
    index = endIndex;
  }

  return ranges;
}

function wrapRangeInHighlight(range) {
  console.log("wrapRangeInHighlight");
  const highlightSpan = document.createElement("span");
  highlightSpan.className = "better-search-highlight";

  // DocumentFragment working with DOM
  const fragment = range.extractContents();
  highlightSpan.appendChild(fragment);
  range.insertNode(highlightSpan);
}

function removeHighlights() {
  console.log("removeHighlights");
  const highlights = document.querySelectorAll("span.better-search-highlight");

  highlights.forEach((span) => {
    const parent = span.parentNode;
    while (span.firstChild) {
      parent.insertBefore(span.firstChild, span);
    }
    parent.removeChild(span);
    parent.normalize();
  });
}

if (!window.betterSearchInjected) {
  window.betterSearchInjected = true;

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "highlight") {
      console.log("Message received in search.js:", message.value);
      highlightText(message.value);
    }
  });

  console.log("Better Search injected!");
}
