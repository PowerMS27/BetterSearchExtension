import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { initSearchOverlay } from './utils/search-overlay';

createApp(App).mount('#app');

// Инициализируем функционал поиска
console.log('initSearchOverlay()');

initSearchOverlay();
