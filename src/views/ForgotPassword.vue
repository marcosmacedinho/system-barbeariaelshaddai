<script setup>
import { ref } from 'vue';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { useAlert } from '@/stores/alert'; // Assumindo que você tenha um store para alertas

const email = ref('');
const isLoading = ref(false);
const alert = useAlert();

const resetPassword = async () => {
  if (!email.value) {
    alert.show('Por favor, insira um e-mail válido.', 400);
    return;
  }

  isLoading.value = true;
  const auth = getAuth();

  try {
    await sendPasswordResetEmail(auth, email.value);
    alert.show('E-mail de recuperação enviado com sucesso!', 200);
  } catch (error) {
    alert.show('Erro ao enviar o e-mail de recuperação.', 500);
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
    <div class="auth-container d-flex align-items-center justify-content-center">
        <div class="auth-card p-4">

            <h3 class="text-center mb-4">Recuperar Senha</h3>
            <p class="text-center">Insira seu e-mail para receber um link de redefinição de senha.</p>

            <form @submit.prevent="resetPassword">
                <div class="mb-3">
                    <label for="email" class="form-label">E-mail</label>
                    <input type="email" id="email" v-model="email" class="form-control" required>
                </div>

                <button type="submit" class="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                    :disabled="isLoading">
                    <span v-if="isLoading" class="spinner-border spinner-border-sm" role="status"></span>
                    <span v-if="!isLoading" class="material-symbols-rounded fs-4 me-2">send</span>
                    <span v-if="!isLoading">Enviar e-mail de recuperação</span>
                </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.auth-container {
    width: 100vw;
    height: 100vh;
}

.auth-card {
    border-radius: 12px;
    max-width: 400px;
    width: 100%;
}
</style>
