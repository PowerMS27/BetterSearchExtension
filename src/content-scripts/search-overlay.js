import { createApp } from "vue";
import SearchOverlay from "@/components/SearchOverlay.vue";

export function initSearchOverlay() {
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey && event.shiftKey && event.code === "KeyF") {
      event.preventDefault();

      if (!document.querySelector("#better-search-extension")) {
        const container = document.createElement("div");
        container.id = "better-search-extension";
        document.body.appendChild(container);
        const app = createApp(SearchOverlay);
        app.mount(container);
      }
    }
  });
}
