
import { createApp } from 'vue'
import App from './App.vue'
import router from '@/routes/index'
import './assets/base.css';
const app = createApp(App)
import VueApexCharts from 'vue3-apexcharts'
app.use(VueApexCharts)
app.use(router)
app.mount('#app')