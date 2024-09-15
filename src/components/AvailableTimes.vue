<script setup>
import { ref, onMounted } from 'vue';
import { db } from '@/firebaseConfig'; // Importa a configuração do Firebase
import { collection, getDocs } from 'firebase/firestore'

const emit = defineEmits(['select']); // Definindo o evento que será emitido

const availableTimes = ref([]); // Lista de horários disponíveis
const selectedTime = ref(null); // Horário selecionado

// Função para buscar horários do Firestore
const fetchAvailableTimes = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'availableTimes'));
    availableTimes.value = querySnapshot.docs.map(doc => doc.data().time);
  } catch (error) {
    console.error('Error fetching available times:', error);
  }
};

onMounted(() => {
  fetchAvailableTimes();
});

const selectTime = () => {
  emit('select', selectedTime.value); // Emitindo o evento para o componente pai
};
</script>

<template>
  <div>
    <label for="timeSelect" class="form-label">Selecione um horário:</label>
    <select id="timeSelect" class="form-select" v-model="selectedTime" @change="selectTime">
      <option value="" disabled>Escolha um horário</option>
      <option v-for="time in availableTimes" :key="time" :value="time">
        {{ time }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.form-select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 20px;
}
</style>
