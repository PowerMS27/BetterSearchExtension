<script setup>
import { ref } from "vue";

const searchInputValue = ref("");

const onSearch = (value) => {
  executeSearch(value);
}

const executeSearch = async (searchInputValue) => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.tabs.sendMessage(tab.id, {
    action: "highlight",
    value: searchInputValue,
  });
};

</script>

<template>
  <div>
    <input
      v-model="searchInputValue"
      type="text"
      @input="(event) => onSearch(event.target.value)"
      placeholder="Enter your text"
      class="better-search-searchbar"
    />
  </div>
</template>

<style></style>
