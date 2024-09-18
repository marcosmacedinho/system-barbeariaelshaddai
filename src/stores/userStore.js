// src/stores/userStore.js
import { defineStore } from 'pinia'
import { auth, db } from '@/firebaseConfig'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { useAlert } from '@/stores/alert'
import { onAuthStateChanged } from 'firebase/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    lastLogin: null,
    loading: true
  }),
  actions: {
    async fetchUserInfo() {
      const user = auth.currentUser
      if (user) {
        const userDocRef = doc(db, 'clients', user.uid)
        const userDoc = await getDoc(userDocRef)
        if (userDoc.exists()) {
          this.user = userDoc.data()
          this.lastLogin = user.metadata.lastSignInTime

          await setDoc(
            userDocRef,
            {
              ...userDoc.data(),
              lastLogin: this.lastLogin
            },
            { merge: true }
          )
        }
      }
    },
    async logout() {
      try {
        await auth.signOut()
        this.user = null
        this.lastLogin = null
        useAlert().show('Você saiu da sua conta com segurança!', 200)
      } catch (error) {
        useAlert().show('Erro ao tentar sair', 500)
      }
    },
    initAuthListener(router) {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          await this.fetchUserInfo() // Carrega as informações do usuário logado

          const role = this.user?.role
          const redirectPath = role === 'admin' ? '/barber/appointments' : '/'
          router.replace(redirectPath)
        } else {
          this.user = null
          this.lastLogin = null
          router.replace('/login') // Redireciona para a página de login se não estiver autenticado
        }
        this.loading = false // Atualiza o estado de carregamento
      })
    }
  }
})
