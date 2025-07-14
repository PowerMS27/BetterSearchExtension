import { highlightText } from "@/utils/search-logic";

if (!window.betterSearchInjected) {
  window.betterSearchInjected = true;

  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === "highlight") {
      const noScroll = !!message.noScroll
      highlightText(message.value, noScroll);
    }
  });
}
