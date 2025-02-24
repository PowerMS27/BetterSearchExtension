import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        searchOverlay: 'src/utils/search-overlay.js'
      },
      output: {
        entryFileNames: '[name].js'
      }
    }
  }
});
