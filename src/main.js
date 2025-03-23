import { createApp } from 'vue'
import App from './App.vue'
import { initSearchOverlay } from './content-scripts/search-overlay';
import './content-scripts/search'

createApp(App).mount('#app');

// Инициализируем функционал поиска
console.log('initSearchOverlay()');

initSearchOverlay();
