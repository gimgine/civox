import { createApp } from 'vue';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import ToastService from 'primevue/toastservice';
import Tooltip from 'primevue/tooltip';
import App from './App.vue';
import router from './router';

import './styles.css';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(PrimeVue);
app.use(ToastService);
app.directive('tooltip', Tooltip);
app.mount('#app');
