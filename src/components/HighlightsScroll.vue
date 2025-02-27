<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";

const currentIndex = ref(0);
const highlights = ref([]);

// Функция для обновления списка элементов
const updateHighlights = () => {
  highlights.value = Array.from(
    document.querySelectorAll("span.better-search-highlight")
  );
};

// Функция для прокрутки к элементу с заданным индексом
const scrollToElement = (index) => {
  if (highlights.value[index]) {
    highlights.value[index].scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
};

// Функция для добавления класса active текущему элементу
const setActiveClass = (index) => {
  highlights.value.forEach((highlight, i) => {
    if (i === index) {
      highlight.classList.add("active");
    } else {
      highlight.classList.remove("active");
    }
  });
};

// Функция для прокрутки к следующему элементу
const scrollToNext = () => {
  if (highlights.value.length === 0) return;

  if (currentIndex.value < highlights.value.length - 1) {
    currentIndex.value++;
  } else {
    currentIndex.value = 0; // Возвращаемся к первому элементу
  }
  scrollToElement(currentIndex.value);
  setActiveClass(currentIndex.value);
};

// Функция для прокрутки к предыдущему элементу
const scrollToPrevious = () => {
  if (highlights.value.length === 0) return;

  if (currentIndex.value > 0) {
    currentIndex.value--;
  } else {
    currentIndex.value = highlights.value.length - 1; // Переходим к последнему элементу
  }
  scrollToElement(currentIndex.value);
  setActiveClass(currentIndex.value);
};

// Следим за изменениями DOM
const observer = new MutationObserver(() => {
  updateHighlights();
  setActiveClass(currentIndex.value);
});

onMounted(() => {
  updateHighlights();

  setActiveClass(currentIndex.value);

  // Наблюдаем за изменениями в DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
});

onBeforeUnmount(() => {
  // Останавливаем наблюдатель при размонтировании компонента
  observer.disconnect();
});
</script>
<template>
  <div class="better-search-extension__navigation">
    <button
      class="better-search-extension__navigation-previous"
      :class="{'disabled': !highlights.length}"
      @click="scrollToPrevious"
    >
      ⬆
    </button>
    <button
      class="better-search-extension__navigation-next"
      :class="{'disabled': !highlights.length}"
      @click="scrollToNext"
    >
      ⬇
    </button>
    <div
      class="better-search-extension__navigation-numbers"
      v-if="highlights.length"
    >
      {{ currentIndex + 1 }} / {{ highlights.length }}
    </div>
  </div>
</template>
