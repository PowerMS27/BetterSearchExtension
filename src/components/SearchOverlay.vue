<script setup>
import { ref, onMounted } from "vue";
import HighlightsScroll from "./HighlightsScroll.vue";

const searchText = ref("");

onMounted(() => {
  const input = document.querySelector(".better-search-extension__search-input");
  if (input) {
    input.focus();
  }
});

function onInputChange() {
  chrome.runtime.sendMessage({
    action: "highlight",
    value: searchText.value,
  });
}

function closeSearch() {
  const container = document.querySelector("#better-search-extension");
  if (container) {
    chrome.runtime.sendMessage({
      action: "highlight",
      value: "",
    });
    container.remove();
  }
}
</script>

<template>
  <div class="better-search-extension__search-overlay">
    <input
      class="better-search-extension__search-input"
      type="text"
      placeholder="Search..."
      v-model="searchText"
      @input="onInputChange"
      @keydown.escape="closeSearch"
    />
    <HighlightsScroll />
    <button class="better-search-extension__close-button" @click="closeSearch">
      ✖
    </button>
  </div>
</template>
