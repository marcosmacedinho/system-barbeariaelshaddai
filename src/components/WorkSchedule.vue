<template>
  <div>
    <h3 class="header mb-4">Definir Horários Diários</h3>
    <form @submit.prevent="saveDailySchedule">
      <div v-for="(schedule, index) in dailySchedule" :key="index" class="mb-3">
        <label :for="'day-' + index">{{ formatDayWithDate(schedule.day) }}</label>
        <div class="d-flex gap-2">
          <!-- Seleção de horário de início -->
          <select v-model="schedule.startTime" :id="'start-' + index" class="form-select"
            @change="updateAvailableTimes(index)">
            <option value="" disabled>Início</option>
            <option v-for="time in timeOptions" :key="time" :value="time">{{ time }}</option>
          </select>

          <!-- Seleção de horário de fim (somente horários válidos) -->
          <select v-model="schedule.endTime" :id="'end-' + index" class="form-select" :disabled="!schedule.startTime"
            @change="updateAvailableTimes(index)">
            <option value="" disabled>Fim</option>
            <option v-for="time in validEndTimeOptions(schedule.startTime)" :key="time" :value="time">{{ time }}
            </option>
          </select>
        </div>

        <!-- Exibir horários disponíveis -->
        <div v-if="availableTimes[index]?.length">
          <h5>Horários Disponíveis para os Clientes:</h5>
          <ul>
            <li v-for="time in availableTimes[index]" :key="time">{{ time }}</li>
          </ul>
        </div>
      </div>

      <!-- Botão de salvar -->
      <button type="submit" class="btn btn-primary d-flex align-items-center gap-1"
        :disabled="isLoading || !formIsValid">
        <span class="material-symbols-rounded">save</span>
        {{ isLoading ? 'Salvando...' : 'Salvar Horários' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig.js';
import { useAlert } from '@/stores/alert';
import { format, addMinutes, isBefore } from 'date-fns';

const generateTimes = (start, end) => {
  const times = [];
  const startDate = new Date(`1970-01-01T${start}:00`);
  const endDate = new Date(`1970-01-01T${end}:00`);
  const interval = 40;

  let current = startDate;
  while (isBefore(current, endDate)) {
    times.push(format(current, 'HH:mm'));
    current = addMinutes(current, interval);
  }

  return times;
};

const generateAllTimes = () => {
  const times = [];
  const startDate = new Date('1970-01-01T05:00:00');
  const endDate = new Date('1970-01-01T23:00:00');
  const interval = 40;

  let current = startDate;
  while (isBefore(current, endDate)) {
    times.push(format(current, 'HH:mm'));
    current = addMinutes(current, interval);
  }

  return times;
};

const getDayDate = (day) => {
  const currentDate = new Date();
  const daysOfWeek = {
    'Domingo': 0,
    'Segunda-feira': 1,
    'Terça-feira': 2,
    'Quarta-feira': 3,
    'Quinta-feira': 4,
    'Sexta-feira': 5,
    'Sábado': 6,
  };

  const dayIndex = daysOfWeek[day];
  const currentDayIndex = currentDate.getDay();
  let daysUntilNext = (dayIndex + 7 - currentDayIndex) % 7;

  if (daysUntilNext === 0) {
    daysUntilNext = 7;
  }

  const dayDate = new Date(currentDate);
  dayDate.setDate(currentDate.getDate() + daysUntilNext);

  return format(dayDate, 'yyyy-MM-dd');
};

const formatDayWithDate = (day) => {
  const currentDate = new Date();
  const daysOfWeek = {
    'Domingo': 0,
    'Segunda-feira': 1,
    'Terça-feira': 2,
    'Quarta-feira': 3,
    'Quinta-feira': 4,
    'Sexta-feira': 5,
    'Sábado': 6,
  };

  const dayIndex = daysOfWeek[day];
  const currentDayIndex = currentDate.getDay();
  const daysUntilNext = (dayIndex + 7 - currentDayIndex) % 7;

  const dayDate = new Date(currentDate);
  dayDate.setDate(currentDate.getDate() + daysUntilNext);

  const options = { day: 'numeric', month: 'long' };
  return `${day}, ${dayDate.toLocaleDateString('pt-BR', options)}`;
};

const timeOptions = ref(generateAllTimes());
const availableTimes = ref([]);
const dailySchedule = ref([
  { day: 'Segunda-feira', startTime: '', endTime: '' },
  { day: 'Terça-feira', startTime: '', endTime: '' },
  { day: 'Quarta-feira', startTime: '', endTime: '' },
  { day: 'Quinta-feira', startTime: '', endTime: '' },
  { day: 'Sexta-feira', startTime: '', endTime: '' },
  { day: 'Sábado', startTime: '', endTime: '' },
  { day: 'Domingo', startTime: '', endTime: '' },
]);

const isLoading = ref(false);
const alert = useAlert();

// Verifica se o formulário está válido
const formIsValid = computed(() => {
  return dailySchedule.value.every(day => day.startTime && day.endTime);
});

// Retorna horários de fim válidos com base no horário de início
const validEndTimeOptions = (startTime) => {
  if (!startTime) return [];
  return timeOptions.value.filter(time => time > startTime);
};

// Atualiza horários disponíveis para o dia selecionado
const updateAvailableTimes = (index) => {
  const startTime = dailySchedule.value[index].startTime;
  const endTime = dailySchedule.value[index].endTime;

  if (startTime && endTime) {
    availableTimes.value[index] = generateTimes(startTime, endTime);
  } else {
    availableTimes.value[index] = [];
  }
};

// Salva os horários diários no Firestore
const saveDailySchedule = async () => {
  isLoading.value = true;

  const scheduleToSave = dailySchedule.value.map((day, index) => ({
    day: day.day,
    dayDate: getDayDate(day.day),
    startTime: day.startTime,
    endTime: day.endTime,
    availableTimes: availableTimes.value[index]?.reduce((acc, time) => {
      acc[time] = { isBooked: false };
      return acc;
    }, {}) || {}
  }));

  try {
    await setDoc(doc(db, 'barbershop', 'dailySchedule'), {
      schedule: scheduleToSave
    });
    alert.show('Horários salvos com sucesso!', 200);
  } catch (error) {
    alert.show('Erro ao salvar horários.', 500);
  } finally {
    isLoading.value = false;
  }
};

// Carrega os horários diários salvos do Firestore
const loadDailySchedule = async () => {
  const docRef = doc(db, 'barbershop', 'dailySchedule');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const savedSchedule = docSnap.data().schedule;

    dailySchedule.value = savedSchedule.map(day => ({
      day: day.day,
      startTime: day.startTime,
      endTime: day.endTime
    }));

    // Atualiza os horários disponíveis para os horários carregados
    savedSchedule.forEach((day, index) => {
      if (day.startTime && day.endTime) {
        availableTimes.value[index] = generateTimes(day.startTime, day.endTime);
      }
    });
  } else {
    alert.show('Nenhum horário salvo encontrado.', 300);
  }
};

// Atualiza o cronograma semanal
const updateWeeklySchedule = () => {
  const currentDate = new Date();
  const currentDayIndex = currentDate.getDay();

  dailySchedule.value = dailySchedule.value.map((day, index) => {
    const newDay = new Date(currentDate);
    newDay.setDate(currentDate.getDate() + (index - currentDayIndex));
    return {
      ...day,
      dayDate: format(newDay, 'yyyy-MM-dd'),
      availableTimes: []
    };
  });
};

onMounted(() => {
  updateWeeklySchedule();
  loadDailySchedule(); // Carrega horários salvos ao montar o componente
});
</script>
