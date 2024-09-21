import { defineStore } from 'pinia'
import { auth, db } from '@/firebaseConfig'
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore'
import { useAlert } from '@/stores/alert'
import { onAuthStateChanged } from 'firebase/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    lastLogin: null,
    loading: true,
    isAuthenticated: false // Adiciona a propriedade isAuthenticated
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
          this.isAuthenticated = true // Atualiza isAuthenticated para true
          return true // Login bem-sucedido
        }
      }
      this.isAuthenticated = false // Atualiza isAuthenticated para false
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
          this.isAuthenticated = false // Atualiza isAuthenticated para false
          useAlert().show('Você saiu da sua conta com segurança!', 'success')
        }
      } catch (error) {
        useAlert().show('Erro ao tentar sair com segurança!', 'error')
      }
    },

    initAuthListener(router) {
      onAuthStateChanged(auth, async (user) => {
        this.loading = true;
        console.log('User state changed:', user); // Adicione este log
        if (user) {
          const isLoggedIn = await this.fetchUserInfo();
          console.log('Is logged in:', isLoggedIn); // Adicione este log
    
          if (isLoggedIn) {
            this.isAuthenticated = true; // Certifique-se de que isso está sendo executado
            const role = this.user?.role;
            const redirectPath = role === 'admin' ? '/barber/appointments' : '/';
            if (router.currentRoute.value.path !== redirectPath) {
              router.replace(redirectPath);
            }
          } else {
            this.isAuthenticated = false; // Certifique-se de que isso está sendo executado
            router.replace('/login');
          }
        } else {
          this.user = null;
          this.lastLogin = null;
          this.isAuthenticated = false; // Certifique-se de que isso está sendo executado
          if (router.currentRoute.value.path !== '/register') {
            router.replace('/login');
          }
        }
        this.loading = false;
      });
    }
    
  }
})
