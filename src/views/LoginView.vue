// src/views/LoginView.vue
<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAlert } from '@/stores/alert'; // Se você estiver usando um sistema de alerta
import { auth } from '@/firebaseConfig'; // Importe a instância do Firebase Authentication
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useUserStore } from '@/stores/userStore';

const router = useRouter();
const data = ref({
    email: '',
    password: ''
});

const userStore = useUserStore();

async function login() {
    try {
        await signInWithEmailAndPassword(auth, data.value.email, data.value.password);
        await userStore.fetchUserInfo(); 
        useAlert().show('Login realizado com sucesso', 200);
        router.replace('/');
    } catch (error) {
        useAlert().show('Deu algum erro no seu login, tente novamente!', 300);
    }
}
</script>

<template>
    <div class="container login">
        <div class="flex-grow-1">
            <div class="text-center">
                <h1 class="text-center fs-5 fw-bolder mb-0">Clínica Riso</h1>
                <p class="fs-6 text-muted">Gerenciamento de atendimentos clínicos</p>
            </div>
            <form @submit.prevent="login">
                <div class="mb-3">
                    <label class="form-label" for="email">Email</label>
                    <input class="form-control" id="email" v-model="data.email" type="email" placeholder="Email"
                        required />
                </div>
                <div class="mb-4">
                    <label class="form-label d-flex align-items-center" for="password">
                        <span>Senha</span>
                        <a href="javascript:void(0)" class="fw-bold fs-6 ms-auto text-decoration-none text-primary">
                            Esqueceu sua senha?
                        </a>
                    </label>
                    <input class="form-control" v-model="data.password" type="password" id="password"
                        placeholder="Senha" required />
                </div>
                <button type="submit"
                    class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-1">
                    Partiu
                    <span class="material-symbols-rounded fs-5">login</span>
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login {
    max-width: 320px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100dvh;
    /* Corrigido de 100dvh para 100vh */
}
</style>
