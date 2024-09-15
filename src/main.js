import { createApp } from 'vue'
import App from '@/App.vue'
import { createPinia } from 'pinia' // Se você optou por usar Pinia
import router from './router'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.mount('#app')
