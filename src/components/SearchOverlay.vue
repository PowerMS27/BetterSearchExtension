<script setup>
import { ref, watch, onMounted } from "vue";
import HighlightsScroll from "@/components/HighlightsScroll.vue";
import SvgButtonClose from "@/assets/icons/button-close.svg";
import { debounce } from "@/utils/debounce-throttle.js";

const searchText = ref("");

onMounted(() => {
  const input = document.querySelector(
    ".better-search-extension__search-input"
  );
  if (input) {
    input.focus();
  }
});

const onInputChange = () => {
  chrome.runtime.sendMessage({
    action: "highlight",
    value: searchText.value,
  });
};

const debouncedInputChange = debounce(onInputChange, 300);

watch(searchText, () => {
  debouncedInputChange();
});

const closeSearch = () => {
  const container = document.querySelector("#better-search-extension");
  if (container) {
    chrome.runtime.sendMessage({
      action: "highlight",
      value: "",
    });
    container.remove();
  }
};
</script>

<template>
  <div class="better-search-extension__search-overlay">
    <input
      class="better-search-extension__search-input"
      type="text"
      placeholder="Search..."
      v-model="searchText"
      @keydown.escape="closeSearch"
    />
    <HighlightsScroll />
    <button class="better-search-extension__close-button" @click="closeSearch">
      <SvgButtonClose />
    </button>
  </div>
</template>
