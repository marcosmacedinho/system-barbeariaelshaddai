<template>
  <div>
    <label for="daySelect" class="form-label">Selecione um dia:</label>
    <select id="daySelect" class="form-select" v-model="selectedDay" @change="fetchAvailableTimes">
      <option value="" disabled>Escolha um dia</option>
      <option v-for="day in days" :key="day" :value="day">
        {{ day }}
      </option>
    </select>

    <label for="timeSelect" class="form-label mt-3">Selecione um horário:</label>
    <select id="timeSelect" class="form-select" v-model="selectedTime" @change="selectTime">
      <option value="" disabled>Escolha um horário</option>
      <option v-for="time in availableTimes" :key="time" :value="time">
        {{ time }}
      </option>
    </select>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { db } from '@/firebaseConfig';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { useAlert } from '@/stores/alert';

const emit = defineEmits(['select']);
const days = ref([]);
const availableTimes = ref([]);
const selectedDay = ref(null);
const selectedTime = ref(null);
const alert = useAlert();
let unsubscribe = null; // Variable to hold the unsubscribe function

const fetchDays = async () => {
  try {
    const docRef = doc(db, 'barbershop', 'dailySchedule');
    const docSnapshot = await getDoc(docRef);

    if (docSnapshot.exists()) {
      const schedule = docSnapshot.data().schedule || [];
      const uniqueDays = [...new Set(schedule.map(day => day.day))];
      days.value = uniqueDays;
    } else {
      console.error('Documento não encontrado!');
    }
  } catch (error) {
    alert.show('Erro ao buscar dias disponíveis.', 500);
    console.error('Erro ao buscar dias disponíveis:', error);
  }
};

const fetchAvailableTimes = async () => {
  if (!selectedDay.value) return;

  try {
    const docRef = doc(db, 'barbershop', 'dailySchedule');
    // Clear previous listener
    if (unsubscribe) {
      unsubscribe();
    }
    unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const schedule = docSnapshot.data().schedule || [];
        const daySchedule = schedule.find(day => day.day === selectedDay.value);
        if (daySchedule && daySchedule.startTime && daySchedule.endTime) {
          availableTimes.value = generateTimes(daySchedule.startTime, daySchedule.endTime);
        } else {
          availableTimes.value = [];
        }
      } else {
        console.error('Documento não encontrado!');
      }
    });
  } catch (error) {
    alert.show('Erro ao buscar horários disponíveis.', 500);
    console.error('Erro ao buscar horários disponíveis:', error);
  }
};

const generateTimes = (start, end) => {
  const times = [];
  const startDate = new Date(`1970-01-01T${start}:00`);
  const endDate = new Date(`1970-01-01T${end}:00`);
  const interval = 40 * 60 * 1000; // 40 minutos em milissegundos

  if (startDate >= endDate) return times;

  let current = new Date(startDate);

  while (current < endDate) {
    const hours = current.getHours().toString().padStart(2, '0');
    const minutes = current.getMinutes().toString().padStart(2, '0');
    times.push(`${hours}:${minutes}`);
    current = new Date(current.getTime() + interval);
  }

  // Verificar se o horário final deve ser incluído
  if (current.getTime() === endDate.getTime()) {
    const hours = endDate.getHours().toString().padStart(2, '0');
    const minutes = endDate.getMinutes().toString().padStart(2, '0');
    times.push(`${hours}:${minutes}`);
  }

  return times;
};

const selectTime = () => {
  emit('select', selectedTime.value);
};

onMounted(() => {
  fetchDays();
});

watch(selectedDay, () => {
  selectedTime.value = null; // Reset time selection when day changes
  fetchAvailableTimes();
});

// Clean up the snapshot listener when the component is unmounted
onUnmounted(() => {
  if (unsubscribe) {
    unsubscribe();
  }
});
</script>

<style lang="scss" scoped>
.form-select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 20px;
  background-color: #f8f9fa;
}
</style>
