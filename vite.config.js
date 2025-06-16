import { defineConfig } from "vite";
import { fileURLToPath, URL } from 'node:url'
import vue from "@vitejs/plugin-vue";
import svgLoader from "vite-svg-loader";

export default defineConfig({
  plugins: [
    vue(),
    svgLoader({
      svgo: false
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)) // src folder alias
    }
  },
  test: {
    environment: "jsdom", // jsdom for emulating DOM
    globals: true, // describe, it etc
    setupFiles: ["./tests/setup.js"],
  },
  build: {
    rollupOptions: {
      input: {
        main: "@/main.js",
      },
      output: {
        entryFileNames: "content-bundle.js",
        format: "iife",
      },
    },
  },
});
