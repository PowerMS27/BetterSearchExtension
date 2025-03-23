import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
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
