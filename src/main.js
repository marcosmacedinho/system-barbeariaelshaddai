// src/main.js
import { createApp } from 'vue'
import App from '@/App.vue'
import { createPinia } from 'pinia'
import router from './router'
import { initializeAuth } from '@/authGuard'

// Importa a diretiva de máscara
import maskDirective from '@/plugins/mask'

const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(router)

app.directive('mask', maskDirective)

initializeAuth()
  .then(() => {
    try {
      app.mount('#app') // Monta o aplicativo Vue
    } catch (error) {
      console.error('Erro ao montar aplicação:', error) // Captura erro ao montar
    }
  })
  .catch((error) => {
    console.error('Erro ao inicializar autenticação:', error) // Captura erro de autenticação
  })
