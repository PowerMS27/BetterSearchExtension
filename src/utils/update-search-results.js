import { throttle, debounce } from "@/utils/debounce-throttle.js";
import { eventBus } from "@/utils/event-bus.js";

let currentSearchTerm = "";
let observer = null;
let isUpdating = false;

eventBus.on("pause-observer", () => {
  isUpdating = true;
});

eventBus.on("resume-observer", () => {
  setTimeout(() => {
    isUpdating = false;
  }, 100);
});

eventBus.on("highlights-updated", (payload) => {
  if (payload?.searchTerm) {
    currentSearchTerm = payload.searchTerm;
  } else {
    currentSearchTerm = "";
  }
});

function runSearch() {
  if (!currentSearchTerm || isUpdating) return;

  isUpdating = true;

  chrome.runtime.sendMessage(
    {
      action: "highlight",
      value: currentSearchTerm,
      noScroll: true,
    },
    () => {
      setTimeout(() => {
        isUpdating = false;
      }, 100);
      if (chrome.runtime.lastError) {
        console.warn("Message error:", chrome.runtime.lastError.message);
      }
    }
  );
}

const debouncedRunSearch = debounce(runSearch, 1000);

const throttledMutationHandler = throttle((mutationsList) => {
  if (isUpdating) return;

  for (const mutation of mutationsList) {
    if (shouldTriggerSearch(mutation)) {
      debouncedRunSearch();
      break;
    }
  }
}, 1000);

function shouldTriggerSearch(mutation) {
  if (isInsideHighlight(mutation.target)) return false;

  if (mutation.addedNodes?.length) {
    const onlyHighlightSpans = Array.from(mutation.addedNodes).every(
      (node) =>
        node.nodeType === Node.ELEMENT_NODE &&
        node.classList.contains("better-search-highlight")
    );
    if (onlyHighlightSpans) return false;
  }

  return mutation.type === "childList" || mutation.type === "characterData";
}

function isInsideHighlight(node) {
  if (!node) return false;
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentElement;
  }
  return node?.closest(".better-search-highlight");
}

export function startAutoSearchUpdates() {
  if (observer) return;

  observer = new MutationObserver(throttledMutationHandler);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });

  console.log("BetterSearch DOM observer started");
}

export function stopAutoSearchUpdates() {
  if (observer) {
    observer.disconnect();
    observer = null;
    console.log("BetterSearch DOM observer stopped");
  }
}
