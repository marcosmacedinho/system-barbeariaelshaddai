<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { useAlert } from '@/stores/alert';


const alert = useAlert();
const data = ref({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
});

const router = useRouter();
const userStore = useUserStore();

const register = async () => {
    if (data.value.password === data.value.confirmPassword) {
        try {
            await userStore.register(data.value.name, data.value.email, data.value.password, data.value.phone); // Chama a função de registro
            router.replace('/appointments');
        } catch (error) {
            console.error("Erro no registro:", error);
        }
    } else {
        alert.show("As senhas não coincidem.", 300);
    }
};
</script>

<template>
    <div class="container register">
        <div class="flex-grow-1">
            <div class="text-center">
                <h1 class="text-center fs-5 fw-bolder mb-0">Barbearia El Shaddai</h1>
                <p class="fs-6 text-muted">Gerenciamento de atendimentos à Barbearia</p>
            </div>
            <form @submit.prevent="register">
                <div class="mb-3">
                    <label class="form-label" for="name">Nome</label>
                    <input class="form-control" id="name" v-model="data.name" type="text" placeholder="Nome" required />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="email">Email</label>
                    <input class="form-control" id="email" v-model="data.email" type="email" placeholder="Email"
                        required />
                </div>
                <div class="mb-3">
                    <label class="form-label" for="phone">Número de Telefone</label>
                    <input class="form-control" id="phone" v-model="data.phone" type="text"
                        placeholder="Número de Telefone" v-mask="['(##) ####-####', '(##) #####-####']" />
                </div>
                <div class="mb-4">
                    <label class="form-label" for="password">Senha</label>
                    <input v-model="data.password" type="password" id="password" placeholder="Senha"
                        class="form-control" required minlength="4" />
                </div>
                <div class="mb-4">
                    <label class="form-label" for="confirmPassword">Confirme a Senha</label>
                    <input v-model="data.confirmPassword" type="password" id="confirmPassword"
                        placeholder="Confirmar Senha" class="form-control" required minlength="4" />
                </div>
                <button type="submit"
                    class="btn btn-primary w-100 d-flex align-items-center justify-content-center gap-1">
                    Registrar
                    <span class="material-symbols-rounded fs-5">person_add</span>
                </button>
                <div class="mt-3 text-center">
                    <p class="fs-6 text-muted">Já tem uma conta? <a href="/login" class="text-primary">Faça login</a>
                    </p>
                </div>
            </form>
        </div>
    </div>
</template>

<style scoped>
.register {
    max-width: 320px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100dvh;
}
</style>
