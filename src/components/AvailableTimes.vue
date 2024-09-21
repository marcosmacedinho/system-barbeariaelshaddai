<template>
  <div class="card">
    <div class="card-body">
      <label for="daySelect" class="form-label">Selecione um dia:</label>
      <select id="daySelect" class="form-select" v-model="selectedDay" @change="handleDayChange">
        <option value="" disabled>Escolha um dia</option>
        <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
      </select>

      <label for="timeSelect" class="form-label mt-3">Selecione um horário:</label>
      <select id="timeSelect" class="form-select" v-model="selectedTime" @change="selectTime">
        <option value="" disabled>Escolha um horário</option>
        <option v-for="time in availableTimes" :key="time" :value="time">{{ time }}</option>
      </select>
      
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { db } from '@/firebaseConfig';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { useAlert } from '@/stores/alert';

const props = defineProps({
  reset: Boolean // Nova prop para resetar os selects
});

const emit = defineEmits(['select', 'selectDay']);
const days = ref([]);
const availableTimes = ref([]);
const selectedDay = ref(null);
const selectedTime = ref(null);
const alert = useAlert();
let unsubscribe = null;

// Função para buscar dias disponíveis
const fetchDays = async () => {
  try {
    const docRef = doc(db, 'barbershop', 'dailySchedule');
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const schedule = docSnapshot.data().schedule || [];
      const uniqueDays = [...new Set(schedule.map(day => day.day))];
      days.value = uniqueDays;
    } else {
      alert.show('Documento de horários não encontrado!', 'error');
    }
  } catch (error) {
    alert.show('Erro ao buscar dias disponíveis.', 'error');
  }
};

// Função para buscar horários disponíveis para o dia selecionado
const fetchAvailableTimes = async () => {
  if (!selectedDay.value) return;

  try {
    const docRef = doc(db, 'barbershop', 'dailySchedule');
    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const schedule = docSnapshot.data().schedule || [];
        const daySchedule = schedule.find(day => day.day === selectedDay.value);
        availableTimes.value = daySchedule?.availableTimes
          ? Object.entries(daySchedule.availableTimes)
            .filter(([, info]) => !info.isBooked)
            .map(([time]) => time)
            .sort()
          : [];
      } else {
        alert.show('Documento de horários não encontrado!', 'error');
      }
    });
  } catch (error) {
    alert.show('Erro ao buscar horários disponíveis.', 'error');
  }
};

// Função para emitir a seleção de horário
const selectTime = () => {
  emit('select', { day: selectedDay.value, time: selectedTime.value });
};

// Função para emitir a seleção de dia
const emitSelectDay = () => {
  emit('selectDay', selectedDay.value);
};

// Função para lidar com a mudança do dia selecionado
const handleDayChange = () => {
  emitSelectDay(); // Emite o dia selecionado
  fetchAvailableTimes(); // Busca os horários disponíveis para o dia selecionado
};

// Observa a prop `reset` para resetar os selects de dia e horário
watch(() => props.reset, (newVal) => {
  if (newVal) {
    selectedDay.value = "";  // Reseta o dia
    selectedTime.value = ""; // Reseta o horário
    availableTimes.value = []; // Limpa os horários disponíveis
  }
});

onMounted(() => {
  fetchDays();
});

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
});
</script>

<style scoped>
.form-select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 20px;
}
</style>
