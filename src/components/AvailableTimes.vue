<template>
  <div class="card">
    <div class="card-body">
      <label for="serviceSelect" class="form-label mt-3">Selecione um serviço:</label>
      <select id="serviceSelect" class="form-select" v-model="selectedService" @change="selectService">
        <option value="" disabled>Escolha um serviço</option>
        <option v-for="item in services" :key="item.id" :value="item.id">
          {{ item.title }} ({{ item.duration }} min)</option>
      </select>

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

      <div v-if="selectedService">
        <p>Tempo estimado: {{ serviceDuration }} min</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { db } from '@/firebaseConfig';
import { doc, onSnapshot, getDoc, collection, query, getDocs, orderBy } from 'firebase/firestore';
import { useAlert } from '@/stores/alert';

const props = defineProps({
  reset: Boolean
});

const emit = defineEmits(['select', 'selectDay', 'populateUserData', 'selectService']);
const daysWithDate = ref([]);
const availableTimes = ref([]);
const services = ref([]);
const selectedDay = ref(null);
const selectedTime = ref(null);
const selectedService = ref(null);
const serviceDuration = ref(0);
const alert = useAlert();
let unsubscribe = null;

// Função para buscar serviços
const fetchServices = async () => {
  const q = query(collection(db, 'services'), orderBy("duration", "asc"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    services.value.push({ id: doc.id, ...doc.data() })
  });
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

// Função para verificar se o horário do serviço não se sobrepõe a outro agendamento
const checkAvailabilityForService = (time, availableTimes, duration) => {
  const timeInfo = availableTimes[time];
  if (!timeInfo || timeInfo.isBooked) return false;

  const startTime = new Date(`1970-01-01T${time}:00`);
  const endTime = new Date(startTime.getTime() + duration * 60000);

  // Verifica se o horário do serviço não se sobrepõe a outro agendamento
  for (const t in availableTimes) {
    if (availableTimes[t].isBooked) continue; // Ignora horários já reservados
    const bookedStart = new Date(`1970-01-01T${t}:00`);
    const bookedEnd = new Date(bookedStart.getTime() + availableTimes[t].duration * 60000);

    // Verifica se há sobreposição
    if ((startTime < bookedEnd) && (endTime > bookedStart)) {
      return false; // O horário não está disponível
    }
  }
  return true; // O horário está disponível
};

// Computed para buscar horários disponíveis
const fetchAvailableTimes = async () => {
  if (!selectedDay.value) return;

  const docRef = doc(db, 'barbershop', 'dailySchedule');
  if (unsubscribe) unsubscribe();

  unsubscribe = onSnapshot(docRef, (docSnapshot) => {
    if (docSnapshot.exists()) {
      const daySchedule = docSnapshot.data().schedule?.find(day => day.day === selectedDay.value.day);

      // Filtrando horários disponíveis
      let times = daySchedule?.availableTimes ? Object.entries(daySchedule.availableTimes)
        .filter(([, info]) => !info.isBooked)
        .map(([time]) => time)
        .sort()
        : [];

      // Se um serviço estiver selecionado, aplicar lógica de duração
      if (selectedService.value) {
        const selectedServiceDuration = services.value.find(o => o.id === selectedService.value)?.duration || 0;
        times = times.filter(time => checkAvailabilityForService(time, daySchedule.availableTimes, selectedServiceDuration));
      }

      availableTimes.value = times;
    } else {
      alert.show('Documento de horários não encontrado!', 'error');
    }
  });
};

const selectService = () => {
  const service = services.value.find(o => o.id === selectedService.value);

  if (service) {
    emit('selectService', service);
    serviceDuration.value = service?.duration || 0;
  }
};

const selectTime = async () => {
  if (!selectedTime.value || !selectedService.value) {
    alert.show('Por favor, selecione um horário e um serviço!', 'warning');
    return;
  }
  emit('select', { day: selectedDay.value.day, time: selectedTime.value, service: selectedService.value });
};

const handleDayChange = () => {
  emit('selectDay', selectedDay.value);
  availableTimes.value = []; // Limpe os horários disponíveis ao mudar o dia
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

onMounted(() => {
  fetchDays();
  fetchServices();
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
