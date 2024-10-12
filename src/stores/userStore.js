import { defineStore } from 'pinia';
import { auth, db } from '@/firebaseConfig';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { useAlert } from '@/stores/alert';
import { onAuthStateChanged } from 'firebase/auth';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    lastLogin: null,
    loading: true,
    isAuthenticated: false,
  }),
  
  actions: {
    async fetchUserInfo() {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, 'clients', user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          this.user = { id: user.uid, ...userDoc.data() }; // Armazena o ID e outros dados
          this.lastLogin = user.metadata.lastSignInTime;

          // Atualiza o último login no Firestore
          await setDoc(
            userDocRef,
            {
              lastLogin: this.lastLogin,
              isLoggedIn: true,
            },
            { merge: true }
          );
          this.isAuthenticated = true;
          return true;
        }
      }
      this.isAuthenticated = false;
      return false;
    },

    async login(email, password) {
      try {
        this.loading = true;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login bem-sucedido:", userCredential);

        await this.fetchUserInfo(); // Atualiza as informações do usuário

        const role = this.user?.role || 'user';
        console.log("Role do usuário:", role);

        return role; // Retorna a role para o redirecionamento
      } catch (error) {
        console.error("Erro no login:", error);
        useAlert().show('Deu algum erro no seu login, tente novamente!', 'error');
        throw error; // Lança o erro para tratamento externo, se necessário
      } finally {
        this.loading = false;
      }
    },

    async register(name, email, password, phone) {
      try {
        this.loading = true;
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, 'clients', user.uid), {
          name: name,
          email: email,
          phone: phone,
          createdAt: new Date(),
        });

        useAlert().show("Cadastro realizado com sucesso", 200);
        return true; // Retorna sucesso
      } catch (error) {
        console.error("Erro no registro:", error);
        useAlert().show("Erro no registro, tente novamente! Caso persista, contate o administrador", 300);
        throw error; // Lança o erro para tratamento externo
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'clients', user.uid);
          await updateDoc(userDocRef, { isLoggedIn: false });
          await auth.signOut();

          // Limpa o estado do usuário
          this.user = null;
          this.lastLogin = null;
          this.isAuthenticated = false;
          useAlert().show('Você saiu da sua conta com segurança!', 'success');
        }
      } catch (error) {
        useAlert().show('Erro ao tentar sair com segurança!', 'error');
      }
    },

    initAuthListener(router) {
      onAuthStateChanged(auth, async (user) => {
        this.loading = true;
        if (user) {
          const isLoggedIn = await this.fetchUserInfo();
          if (isLoggedIn) {
            const role = this.user?.role;
            const redirectPath = role === 'admin' ? '/barber/appointments' : '/';
            if (router.currentRoute.value.path !== redirectPath) {
              router.replace(redirectPath);
            }
          } else {
            router.replace('/login');
          }
        } else {
          // Resetando os dados do usuário ao deslogar
          this.user = null;
          this.lastLogin = null;
          this.isAuthenticated = false;
          if (router.currentRoute.value.path !== '/register') {
            router.replace('/login');
          }
        }
        this.loading = false;
      });
    },
  },
});
