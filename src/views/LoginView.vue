<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useAlert } from '@/stores/alert';

const alert = useAlert();
const data = ref({
    email: '',
    password: ''
});

const router = useRouter();
const userStore = useUserStore();

async function login() {
    try {
        const role = await userStore.login(data.value.email, data.value.password); // Chama a função de login
        const redirectPath = role === 'admin' ? '/barber/appointments' : '/';
        alert.show('Login realizado com sucesso!', 'success');
        router.replace(redirectPath);
    } catch (error) {
        console.error("Erro no login:", error);
        alert.show('Login realizado com sucesso!', 500);

    }
}

function goToRegister() {
    router.replace('/register');
}

function goToForgotPass() {
    router.replace('/forgot-password');
}
</script>

<template>
    <div class="container login">
        <div class="flex-grow-1">
            <div class="text-center">
                <h1 class="text-center fs-5 fw-bolder mb-0">Barbearia El Shaddai</h1>
                <p class="fs-6 text-muted">Gerenciamento de atendimentos à Barbearia</p>
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
                        <a href="javascript:void(0)" @click="goToForgotPass"
                            class="fw-bold fs-6 ms-auto text-decoration-none text-primary">Esqueceu sua senha?</a>
                    </label>
                    <input class="form-control" v-model="data.password" type="password" id="password"
                        placeholder="Senha" required />
                </div>
                <button type="submit"
                    class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-1"
                    :disabled="userStore.loading">
                    <span v-if="userStore.loading" class="spinner-border spinner-border-sm" role="status"
                        aria-hidden="true"></span>
                    <span v-else>Partiu</span>
                    <span v-if="!userStore.loading" class="material-symbols-rounded fs-5">login</span>
                </button>
                <div class="mt-3 text-center">
                    <p class="fs-6 text-muted">Ainda não tem um cadastro? <a href="javascript:void(0)"
                            @click="goToRegister" class="text-primary">Cadastre-se</a></p>
                </div>
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
}
</style>
