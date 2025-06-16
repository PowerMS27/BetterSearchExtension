import { createApp } from 'vue'
import App from '@/App.vue'
import { initSearchOverlay } from '@/content-scripts/search-overlay';
import '@/content-scripts/search'

createApp(App).mount('#better-search-extension-app');

// search init
initSearchOverlay();
