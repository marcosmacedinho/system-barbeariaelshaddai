<script setup>
import { ref, onMounted } from 'vue';
import IMask from 'imask';
import { useRouter } from 'vue-router';
import { useAlert } from '@/stores/alert';
import { auth, db } from '@/firebaseConfig'; // Importe as instâncias do Firebase
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Importar a função para criar usuário
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'; // Importar funções do Firestore

const router = useRouter();
const data = ref({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
});

const phoneInput = ref(null);

const register = async () => {
    if (data.value.password === data.value.confirmPassword) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, data.value.email, data.value.password);
            const user = userCredential.user;

            await setDoc(doc(db, 'clients', user.uid), {
                name: data.value.name,
                email: data.value.email,
                phone: data.value.phone,
                createdAt: serverTimestamp()
            });

            useAlert().show("Cadastro realizado com sucesso", 200);
            router.replace('/login');
        } catch (error) {
            useAlert().show("Deu algum erro no seu registro! Caso persista, entre em contato com o administrador", 300);
        }
    } else {
        useAlert().show("As senhas não coincidem.", 300);
    }
};

onMounted(() => {
    if (phoneInput.value) {
        IMask(phoneInput.value, {
            mask: '(00) 00000-0000'
        });
    }
});
</script>
<template>
    <div class="container register">
        <div class="flex-grow-1">
            <div class="text-center">
                <h1 class="text-center fs-5 fw-bolder mb-0">
                    Barbearia El Shaddai
                </h1>
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
                        placeholder="Número de Telefone" required ref="phoneInput" />
                </div>
                <div class="mb-4">
                    <label class="form-label" for="password">
                        <span>Senha</span>
                    </label>
                    <input v-model="data.password" type="password" id="password" placeholder="Senha"
                        class="form-control" required minlength="4" />
                </div>
                <div class="mb-4">
                    <label class="form-label" for="confirmPassword">
                        <span>Confirme a Senha</span>
                    </label>
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
