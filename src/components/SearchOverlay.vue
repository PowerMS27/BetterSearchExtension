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

    <button
      class="better-search-extension__close-input-button"
      @click="closeSearch"
    >
      ✖
    </button>
  </div>
</template>

<script setup>
import { ref } from "vue";

const searchText = ref("");

function onInputChange() {
  chrome.runtime.sendMessage({
    action: "highlight",
    value: searchText.value,
  });
}

function closeSearch() {
  const container = document.querySelector("#better-search-extension");
  if (container) {
    container.remove();
  }
}
</script>
