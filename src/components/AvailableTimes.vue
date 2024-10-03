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

      <label for="serviceSelect" class="form-label mt-3">Selecione um serviço:</label>
      <select id="serviceSelect" class="form-select" v-model="selectedService" @change="updateServiceDuration">
        <option value="" disabled>Escolha um serviço</option>
        <option v-for="(duration, service) in services" :key="service" :value="service">{{ service }} ({{ duration }}
          min)</option>
      </select>

      <div v-if="selectedService">
        <p>Tempo estimado: {{ serviceDuration }} min</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { db, auth } from '@/firebaseConfig';
import { doc, onSnapshot, getDoc, updateDoc } from 'firebase/firestore';
import { useAlert } from '@/stores/alert';

const props = defineProps({
  reset: Boolean
});

const emit = defineEmits(['select', 'selectDay', 'populateUserData']);
const daysWithDate = ref([]);
const availableTimes = ref([]);
const selectedDay = ref(null);
const selectedTime = ref(null);
const selectedService = ref(null);
const serviceDuration = ref(0);
const alert = useAlert();
let unsubscribe = null;

// Duração dos serviços em minutos
const services = {
  'Corte': 40,
  'Barba': 20,
  'Sobrancelha': 10,
  'Luzes': 120,
  'Alisamento': 120,
};

// Função para formatar data
const formatDayWithDate = (day, date) => {
  const parsedDate = new Date(date + 'T00:00:00');
  return `${day}, ${parsedDate.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' })}`;
};

// Função para buscar dias
const fetchDays = async () => {
  const docRef = doc(db, 'barbershop', 'dailySchedule');
  const docSnapshot = await getDoc(docRef);
  if (docSnapshot.exists()) {
    daysWithDate.value = docSnapshot.data().schedule || [];
  } else {
    alert.show('Documento de horários não encontrado!', 'error');
  }
};

// Computed para buscar horários disponíveis
const fetchAvailableTimes = async () => {
  if (!selectedDay.value) return;

  const docRef = doc(db, 'barbershop', 'dailySchedule');
  if (unsubscribe) unsubscribe();

  unsubscribe = onSnapshot(docRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const daySchedule = docSnapshot.data().schedule?.find(day => day.day === selectedDay.value.day);
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
};

const updateServiceDuration = () => {
  serviceDuration.value = services[selectedService.value] || 0;
};

const selectTime = async () => {
  const user = auth.currentUser;

  // Atualizar os horários ocupados no Firestore
  if (user) {
    await bookTimeSlots(selectedTime.value, serviceDuration.value);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      emit('populateUserData', userDoc.data());
    }
  }

  emit('select', { day: selectedDay.value.day, time: selectedTime.value, service: selectedService.value });
};

// Função para reservar horários
const bookTimeSlots = async (startTime, duration) => {
  const totalMinutes = duration;
  const intervals = totalMinutes / 40; // considerando intervalos de 40 minutos

  const docRef = doc(db, 'barbershop', 'dailySchedule');
  const docSnapshot = await getDoc(docRef);
  if (!docSnapshot.exists()) {
    alert.show('Documento de horários não encontrado!', 'error');
    return;
  }

  const schedule = docSnapshot.data().schedule;
  const daySchedule = schedule.find(day => day.day === selectedDay.value.day);

  if (daySchedule) {
    const availableTimes = daySchedule.availableTimes;

    // Calcular os horários que precisam ser marcados como ocupados
    const startTimeDate = new Date(`1970-01-01T${startTime}:00`);

    for (let i = 0; i < intervals; i++) {
      const currentSlot = new Date(startTimeDate.getTime() + (i * 40 * 60 * 1000)); // Incrementa 40 minutos
      const currentSlotTime = currentSlot.toTimeString().slice(0, 5); // Formata para HH:mm

      if (availableTimes[currentSlotTime]) {
        availableTimes[currentSlotTime].isBooked = true; // Marca como ocupado
      }
    }

    // Atualiza os horários no Firestore
    await updateDoc(docRef, {
      schedule: schedule
    });
    alert.show('Horários reservados com sucesso!', 'success');
  }
};

const handleDayChange = () => {
  emit('selectDay', selectedDay.value);
  fetchAvailableTimes();
};

watch(() => props.reset, (newVal) => {
  if (newVal) {
    selectedDay.value = null;
    selectedTime.value = null;
    selectedService.value = null;
    serviceDuration.value = 0;
    availableTimes.value = [];
  }
});

onMounted(fetchDays);
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
