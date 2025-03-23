import { highlightText } from "../utils/search-logic";

console.log("this is search.js from src/content-scripts");

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
