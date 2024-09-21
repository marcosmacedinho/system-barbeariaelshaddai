import { defineStore } from 'pinia'
import { auth, db } from '@/firebaseConfig'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
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
              lastLogin: this.lastLogin
            },
            { merge: true }
          )
          return true // Login bem-sucedido
        }
      }
      return false // Documento do usuário não encontrado
    },

    async logout() {
      try {
        const user = auth.currentUser
        if (user) {
          const userDocRef = doc(db, 'clients', user.uid)

          await updateDoc(userDocRef, { isLoggedIn: false })
          await auth.signOut()

          this.user = null
          this.lastLogin = null
          useAlert().show('Você saiu da sua conta com segurança!', 'success')
        }
      } catch (error) {
        useAlert().show('Erro ao tentar sair com segurança!', 'error')
      }
    },

    initAuthListener(router) {
      onAuthStateChanged(auth, async (user) => {
        this.loading = true
        if (user) {
          const isLoggedIn = await this.fetchUserInfo()

          if (isLoggedIn) {
            const role = this.user?.role
            const redirectPath = role === 'admin' ? '/barber/appointments' : '/'
            if (router.currentRoute.value.path !== redirectPath) {
              router.replace(redirectPath)
            }
          } else {
            router.replace('/login') // Redireciona para login se não estiver logado
          }
        } else {
          this.user = null
          this.lastLogin = null
          if (router.currentRoute.value.path !== '/register') {
            router.replace('/login')
          }
        }
        this.loading = false
      })
    }
  }
})
