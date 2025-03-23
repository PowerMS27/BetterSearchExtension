import { createApp } from "vue";
import SearchOverlay from "../components/SearchOverlay.vue";

console.log('content-scripts/search-overlay.js');

export function initSearchOverlay() {
  console.log('initSearchOverlay()');
  document.addEventListener("keydown", (event) => {
    console.log('keydown event:', event);
    if (event.ctrlKey && event.shiftKey && event.code === "KeyF") {
      event.preventDefault();
      console.log('ctrl + shift + f');

      if (!document.querySelector("#better-search-extension")) {
        console.log('container not exist yet, creating...');
        const container = document.createElement("div");
        container.id = "better-search-extension";
        document.body.appendChild(container);

        console.log('createApp...');
        const app = createApp(SearchOverlay);
        app.mount(container);
      } else {
        console.log('container already exist');
      }
    }
  });
}
