<template>
  <div class="card">
    <div class="card-body">
      <label for="daySelect" class="form-label">Selecione um dia:</label>
      <select id="daySelect" class="form-select" v-model="selectedDay" @change="handleDayChange">
        <option value="" disabled>Escolha um dia</option>
        <option v-for="day in daysWithDate" :key="day.day" :value="day">
          {{ formatDayWithDate(day.day, day.dayDate) }}
        </option>
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
import { db, auth } from '@/firebaseConfig';
import { doc, onSnapshot, getDoc } from 'firebase/firestore';
import { useAlert } from '@/stores/alert';

const props = defineProps({
  reset: Boolean
});

const emit = defineEmits(['select', 'selectDay', 'populateUserData']);
const daysWithDate = ref([]);
const availableTimes = ref([]);
const selectedDay = ref(null);
const selectedTime = ref(null);
const alert = useAlert();
let unsubscribe = null;

const formatDayWithDate = (day, date) => {
  const parsedDate = new Date(date + 'T00:00:00');
  const options = { day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' };
  return `${day}, ${parsedDate.toLocaleDateString('pt-BR', options)}`;
};

const fetchDays = async () => {
  try {
    const docRef = doc(db, 'barbershop', 'dailySchedule');
    const docSnapshot = await getDoc(docRef);
    if (docSnapshot.exists()) {
      const schedule = docSnapshot.data().schedule || [];
      daysWithDate.value = schedule.map(day => ({
        day: day.day,
        dayDate: day.dayDate
      }));
    } else {
      alert.show('Documento de horários não encontrado!', 'error');
    }
  } catch (error) {
    alert.show('Erro ao buscar dias disponíveis.', 'error');
  }
};

const fetchAvailableTimes = async () => {
  if (!selectedDay.value) return;

  try {
    const docRef = doc(db, 'barbershop', 'dailySchedule');
    if (unsubscribe) unsubscribe();

    unsubscribe = onSnapshot(docRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const schedule = docSnapshot.data().schedule || [];
        const daySchedule = schedule.find(day => day.day === selectedDay.value.day);
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

const selectTime = async () => {
  emit('select', { day: selectedDay.value.day, time: selectedTime.value });
  
  // Buscar dados do usuário autenticado
  const user = auth.currentUser;
  if (user) {
    const userDocRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      emit('populateUserData', userDoc.data());
    }
  }
};

const emitSelectDay = () => {
  emit('selectDay', selectedDay.value);
};

const handleDayChange = () => {
  emitSelectDay();
  fetchAvailableTimes();
};

watch(() => props.reset, (newVal) => {
  if (newVal) {
    selectedDay.value = null;
    selectedTime.value = null;
    availableTimes.value = [];
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
