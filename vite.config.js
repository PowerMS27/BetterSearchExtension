import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom', // jsdom for emulating DOM
    globals: true, // Позволяет использовать функции Vitest без их явного импорта (describe, it и т.д.)
    setupFiles: ['./tests/setup.js'], // Настройка окружения перед тестами
  },
  build: {
    rollupOptions: {
      input: {
        main: "src/main.js",
      },
      output: {
        entryFileNames: "content-bundle.js",
        format: "iife",
      },
    },
  },
});
