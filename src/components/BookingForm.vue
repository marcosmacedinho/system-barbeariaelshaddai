<template>
    <form @submit.prevent="submitForm">
        <div class="mb-3">
            <label for="name" class="form-label">Nome</label>
            <input v-model="formData.name" type="text" class="form-control" id="name" required />
        </div>
        <div class="mb-3">
            <label for="phone" class="form-label">Telefone</label>
            <input v-model="formData.phone" type="text" class="form-control" id="phone" required />
        </div>
        <div class="mb-3">
            <label for="selectedTime" class="form-label">Horário Selecionado</label>
            <!-- Remova o :value -->
            <input v-model="selectedTime" type="text" class="form-control" id="selectedTime" disabled />
        </div>
        <button type="submit" class="btn btn-primary">Confirmar Agendamento</button>
    </form>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps(['selectedTime']);
const emit = defineEmits(['submit']);

const formData = ref({
    name: '',
    phone: ''
});

const selectedTime = ref(props.selectedTime);

watch(() => props.selectedTime, (newValue) => {
    selectedTime.value = newValue;
});

const submitForm = () => {
    if (selectedTime.value) {
        emit('submit', { ...formData.value, time: selectedTime.value });
    } else {
        alert('Por favor, selecione um horário.');
    }
};
</script>

<style scoped>
form {
    margin-top: 20px;
}
</style>