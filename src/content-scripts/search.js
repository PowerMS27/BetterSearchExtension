import { highlightText } from "@/utils/search-logic";

if (!window.betterSearchInjected) {
  window.betterSearchInjected = true;

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "highlight") {
      highlightText(message.value);
    }
  });
}
