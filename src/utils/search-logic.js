export function highlightText(searchTerm) {
  const start = Date.now();

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

export function getTextNodes(node) {
  const textNodes = [];

  function isHidden(element) {
    if (!(element instanceof Element)) return false; // if not DOM el
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
        if (isHidden(parent)) return NodeFilter.FILTER_REJECT; // reject hidden parents

        // unwanted tags
        const excludedTags = [
          "SCRIPT",
          "STYLE",
          "NOSCRIPT",
          "SVG",
          "META",
          "LINK",
          "IFRAME",
          "EMBED",
          "OBJECT",
          "BUTTON",
          "SELECT",
          "OPTION",
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

export function getBlockParent(node) {
  let el = node.parentElement;
  while (el && window.getComputedStyle(el).display === "inline") {
    el = el.parentElement;
  }
  return el;
}

export function getHighlightRanges(textNodes, searchTerm) {
  const ranges = [];
  let fullText = "";
  const nodesInfo = [];

  // getting text string from text nodes
  textNodes.forEach((node, index) => {
    let text = node.textContent;
  
    // remove spaces at inline items
    if (index > 0 && fullText[fullText.length - 1] === ' ' && text[0] === ' ') {
      text = text.slice(1); // remove space
    }
    nodesInfo.push({
      node: node,
      start: fullText.length,
    });
    fullText += text;
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
      const startBlock = getBlockParent(startNodeInfo.node);
      const endBlock = getBlockParent(endNodeInfo.node);
    
      // range in different blocks - skip
      if (startBlock !== endBlock) {
        index = endIndex;
        continue;
      }
    
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

export function wrapRangeInHighlight(range) {
  const highlightSpan = document.createElement("span");
  highlightSpan.className = "better-search-highlight";

  // DocumentFragment working with DOM
  const fragment = range.extractContents();
  highlightSpan.appendChild(fragment);
  range.insertNode(highlightSpan);

  // delete empty node element if there is some
  if (
    highlightSpan.nextSibling?.nodeType === Node.ELEMENT_NODE &&
    highlightSpan.nextSibling.textContent === ""
  ) {
    highlightSpan.nextSibling.remove();
  }
}

export function removeHighlights() {
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

// ! alternative function, fixing spliting <span> into symbols but needs time to improve
// export function removeHighlights() {
//   const highlights = document.querySelectorAll("span.better-search-highlight");
//   highlights.forEach((span) => {
//     const parent = span.parentNode;
//     const textContent = span.textContent;
//     const textNode = document.createTextNode(textContent);
//     parent.replaceChild(textNode, span);
//     parent.normalize();
//   });
// }
