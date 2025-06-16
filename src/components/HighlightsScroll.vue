<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import SvgButtonPrevios from "@/assets/icons/button-previous.svg";
import SvgButtonNext from "@/assets/icons/button-next.svg";

const currentIndex = ref(0);
const highlights = ref([]);

const defaultTop = 10;
const adjustOverlayIfOverlapping = () => {
  const overlay = document.getElementById("better-search-extension");
  const current = highlights.value[currentIndex.value];
  if (!overlay || !current) return;

  const overlayHeight = overlay.offsetHeight;
  const targetRect = current.getBoundingClientRect();

  const overlayRectAtDefault = {
    top: defaultTop,
    bottom: defaultTop + overlayHeight,
    left: window.innerWidth - overlay.offsetWidth - 100,
    right: window.innerWidth - 100,
  };

  const wouldOverlap =
    targetRect.top < overlayRectAtDefault.bottom &&
    targetRect.bottom > overlayRectAtDefault.top &&
    targetRect.left < overlayRectAtDefault.right &&
    targetRect.right > overlayRectAtDefault.left;

  if (wouldOverlap) {
    const newTop = Math.min(
      window.innerHeight - overlay.offsetHeight - 10,
      targetRect.bottom + 10
    );
    overlay.style.top = `${newTop}px`;
  } else {
    overlay.style.top = `${defaultTop}px`;
  }
};

// highlights refresh
const updateHighlights = () => {
  console.log('@@@ updateHighlights !!!');
  
  highlights.value = Array.from(
    document.querySelectorAll("span.better-search-highlight")
  );
  adjustOverlayIfOverlapping();
};

// scroll to result by index
const scrollToElement = (index) => {
  if (highlights.value[index]) {
    highlights.value[index].scrollIntoView({
      behavior: "instant",
      block: "center",
    });
    adjustOverlayIfOverlapping();
  }
};

// add class 'active'
const setActiveClass = (index) => {
  highlights.value.forEach((highlight, i) => {
    if (i === index) {
      highlight.classList.add("active");
    } else {
      highlight.classList.remove("active");
    }
  });
};

// next result
const scrollToNext = () => {
  if (highlights.value.length === 0) return;

  if (currentIndex.value < highlights.value.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // first el
  }
  scrollToElement(currentIndex.value);
  setActiveClass(currentIndex.value);
};

// prev result
const scrollToPrevious = () => {
  if (highlights.value.length === 0) return;

  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = highlights.value.length - 1; // last el
  }
  scrollToElement(currentIndex.value);
  setActiveClass(currentIndex.value);
};

const observer = new MutationObserver(() => {
  updateHighlights();
  setActiveClass(currentIndex.value);
});

onMounted(() => {
  updateHighlights();

  setActiveClass(currentIndex.value);

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

onBeforeUnmount(() => {
  observer.disconnect();
});
</script>
<template>
  <div class="better-search-extension__navigation">
    <div
      v-if="highlights.length"
      class="better-search-extension__navigation-numbers"
    >
      {{ currentIndex + 1 }} / {{ highlights.length }}
    </div>
    <div
      v-else-if="!highlights.length"
      class="better-search-extension__navigation-numbers"
    ></div>
    <span class="better-search-extension__breaking-line"></span>
    <div class="better-search-extension__navigation-buttons">
      <button
        class="better-search-extension__navigation-previous"
        :class="{ disabled: !highlights.length }"
        @click="scrollToPrevious"
      >
        <SvgButtonPrevios />
      </button>
      <button
        class="better-search-extension__navigation-next"
        :class="{ disabled: !highlights.length }"
        @click="scrollToNext"
      >
        <SvgButtonNext />
      </button>
    </div>
  </div>
</template>
