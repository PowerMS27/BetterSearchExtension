<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import {
  startAutoSearchUpdates,
  stopAutoSearchUpdates,
} from "@/utils/update-search-results.js";
import { getSiteSetting, setSiteSetting } from "@/utils/chrome-storage.js";
import { debounce } from "@/utils/debounce-throttle.js";
import HighlightsScroll from "@/components/HighlightsScroll.vue";
import SvgButtonClose from "@/assets/icons/button-close.svg";
import SvgButtonUpdate from "@/assets/icons/button-update.svg";
import SvgButtonUpdateCanceled from "@/assets/icons/button-update-canceled.svg";

const searchText = ref("");
const isAutoSearchUpdates = ref(false);

// Focus on search input and load saved auto-update setting
onMounted(async () => {
  const input = document.querySelector(
    ".better-search-extension__search-input"
  );
  input?.focus();

  const savedValue = await getSiteSetting("isAutoSearchUpdates");
  if (savedValue !== null) {
    isAutoSearchUpdates.value = savedValue;
  }
});

onBeforeUnmount(() => {
  stopAutoSearchUpdates();
});

const sendHighlightMessage = (text) => {
  chrome.runtime.sendMessage({ action: "highlight", value: text }, () => {
    if (chrome.runtime.lastError) {
      console.warn("Message error:", chrome.runtime.lastError.message);
    }
  });
};

const debouncedInputChange = debounce(() => {
  sendHighlightMessage(searchText.value);
}, 300);

watch(searchText, debouncedInputChange);

watch(isAutoSearchUpdates, (newVal) => {
  setSiteSetting("isAutoSearchUpdates", newVal);
  newVal ? startAutoSearchUpdates() : stopAutoSearchUpdates();
});

const closeSearch = () => {
  const container = document.querySelector("#better-search-extension");
  if (!container) return;

  sendHighlightMessage("");
  container.remove();
};

const autoSearchUpdatesToggle = () => {
  isAutoSearchUpdates.value = !isAutoSearchUpdates.value;
};
</script>

<template>
  <div class="better-search-extension__search-overlay">
    <input
      class="better-search-extension__search-input"
      type="text"
      v-model="searchText"
      @keydown.escape="closeSearch"
    />
    <HighlightsScroll />
    <button
      class="better-search-extension__navigation-button better-search-extension__close-button"
      @click="closeSearch"
    >
      <SvgButtonClose />
    </button>
    <div class="better-search-extension__submenu">
      <div class="better-search-extension__update-results">
        <button
          @click="autoSearchUpdatesToggle"
          class="better-search-extension__navigation-button"
        >
          <SvgButtonUpdateCanceled
            class="update-results--canceled"
            v-if="!isAutoSearchUpdates"
          />
          <SvgButtonUpdate class="update-results" v-else />
        </button>
      </div>
    </div>
  </div>
</template>
