<script setup>
import { ref } from "vue";

const searchInputValue = ref("");
let timeoutId = null;

const onSearch = (value) => {
  clearTimeout(timeoutId);

  timeoutId = setTimeout(() => {
    executeSearch(value);
  }, 0);
};

const executeSearch = async (searchInputValue) => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: (searchInputValue) => {
      function highlightText(searchTerm) {
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
      }

      highlightText(searchInputValue);

      function getTextNodes(node) {
        const textNodes = [];
        const walker = document.createTreeWalker(
          node,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: (node) => {
              if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT; // empty text
              const parent = node.parentNode;

              // skip hidden elements by style
              const style = window.getComputedStyle(parent);
              if (style.display === "none" || style.visibility === "hidden") {
                return NodeFilter.FILTER_REJECT;
              }

              // skip tags
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
                "TEXTAREA",
                "INPUT",
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
              info.start <= index &&
              index < info.start + info.node.textContent.length
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
        const highlightSpan = document.createElement("span");
        highlightSpan.className = "better-search-highlight";

        // Используем DocumentFragment для безопасной работы с DOM
        const fragment = range.extractContents();
        highlightSpan.appendChild(fragment);
        range.insertNode(highlightSpan);
      }

      function removeHighlights() {
        const highlights = document.querySelectorAll(
          "span.better-search-highlight"
        );

        highlights.forEach((span) => {
          const parent = span.parentNode;
          while (span.firstChild) {
            parent.insertBefore(span.firstChild, span);
          }
          parent.removeChild(span);
          parent.normalize();
        });
      }
    },
    args: [searchInputValue],
  });
};
</script>

<template>
  <div>
    <input
      v-model="searchInputValue"
      type="text"
      @input="(event) => onSearch(event.target.value)"
      placeholder="Enter your text"
      class="better-search-searchbar"
    />
  </div>
</template>

<style></style>
