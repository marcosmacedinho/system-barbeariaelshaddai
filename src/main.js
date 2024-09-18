// src/main.js
import { createApp } from 'vue'
import App from '@/App.vue'
import { createPinia } from 'pinia'
import router from './router'
import { initializeAuth } from '@/authGuard'


const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

initializeAuth()
  .then(() => {
    try {
      app.mount('#app')
    } catch (error) {
      console.error('Erro ao montar aplicação:', error)
    }
  })
  .catch((error) => {
    console.error('Erro ao inicializar autenticação:', error)
  })