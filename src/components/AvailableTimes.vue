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
import { db, auth } from '@/firebaseConfig';
import { doc, onSnapshot, getDoc, updateDoc, collection, query, getDocs, orderBy } from 'firebase/firestore';
import { useAlert } from '@/stores/alert';

const props = defineProps({
  reset: Boolean
});

const emit = defineEmits(['select', 'selectDay', 'populateUserData', 'selectService']);
const daysWithDate = ref([]);
const availableTimes = ref([]);
const services = ref([])
const selectedDay = ref(null);
const selectedTime = ref(null);
const selectedService = ref(null);
const serviceDuration = ref(0);
const alert = useAlert();
let unsubscribe = null;

// Duração dos serviços em minutos
// const services = {
//   'Corte': 40,
//   'Barba': 20,
//   'Sobrancelha': 10,
//   'Luzes': 120,
//   'Alisamento': 120,
// };


const fetchServices = async () => {
  const q = query(collection(db, 'services'), orderBy("duration", "asc"));
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc) => {
    services.value.push({ id: doc.id, ...doc.data() })
  })
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

// {}

const selectService = () => {
  const service = services.value
    .find(o => o.id === selectedService.value);

  if (service) {
    emit('selectService', service);
    serviceDuration.value = service?.duration || 0
  }
};

const selectTime = async () => {
  emit('select', { day: selectedDay.value.day, time: selectedTime.value, service: selectedService.value });
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

onMounted(() => {
  fetchDays()
  fetchServices()
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
