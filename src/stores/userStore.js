// stores/userStore.js
import { defineStore } from 'pinia';
import { auth, db } from '@/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAlert } from '@/stores/alert';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    lastLogin: null
  }),
  actions: {
    async fetchUserInfo() {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'clients', user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          this.user = userDoc.data();
          this.lastLogin = user.metadata.lastSignInTime;
          
          await setDoc(userDocRef, {
            ...userDoc.data(),
            lastLogin: this.lastLogin
          }, { merge: true });
        }
      }
    },
    async logout() {
      const confirmed = window.confirm('Você tem certeza que deseja sair?');
      if (confirmed) {
        try {
          await auth.signOut();
          this.user = null;
          this.lastLogin = null;
          useAlert().show('Você saiu da sua conta com segurança!', 200);
        } catch (error) {
          useAlert().show('Erro ao tentar sair', 500);
        }
      }
    }
  }
});
