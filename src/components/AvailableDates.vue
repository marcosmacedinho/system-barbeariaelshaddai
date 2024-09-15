<template>
    <div>
        <h3>Datas Disponíveis</h3>

        <!-- Formulário para adicionar nova data -->
        <div class="mb-3">
            <input type="date" v-model="newDate" class="form-control" placeholder="Selecione uma nova data" />
            <button class="btn btn-primary mt-2" @click="addDate">Adicionar Data</button>
        </div>

        <!-- Lista de datas disponíveis -->
        <ul class="list-group">
            <li v-for="(date, index) in availableDates" :key="index"
                class="list-group-item d-flex justify-content-between align-items-center">
                {{ date }}
                <button class="btn btn-danger btn-sm" @click="removeDate(index)">Remover</button>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// Estado para armazenar a lista de datas disponíveis e a nova data a ser adicionada
const availableDates = ref([
    '2024-09-15', // Datas iniciais para fins de demonstração
    '2024-09-16'
]);
const newDate = ref('');

// Função para adicionar uma nova data à lista
const addDate = () => {
    if (newDate.value && !availableDates.value.includes(newDate.value)) {
        availableDates.value.push(newDate.value);
        newDate.value = ''; // Limpar o campo de entrada após adicionar
    } else {
        alert('Data inválida ou já existente.');
    }
};

// Função para remover uma data da lista
const removeDate = (index) => {
    availableDates.value.splice(index, 1);
};
</script>

<style scoped>
/* Customizações de estilo podem ser adicionadas aqui */
</style>