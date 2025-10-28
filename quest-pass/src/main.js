import { createApp } from 'vue';
import { createPinia } from 'pinia'; // import pinia

import App from './App.vue';
import router from './route/routes.js';

// Import Bootstrap CSS (allows using Bootstrap classes site-wide)
import 'bootstrap/dist/css/bootstrap.min.css';

// imports your global styles
// Note: Your previous file used 'main.css', this one uses 'style.css'.
// Make sure you have a file named 'style.css' in your 'src/' folder.
import './style.css';

// Import Bootstrap JS to enable components that require JavaScript (dropdowns, modals, tooltips)
import 'bootstrap';

// create the pinia instance
const pinia = createPinia();

// create app
const app = createApp(App);

app.use(pinia);
app.use(router);

app.mount('#app');

