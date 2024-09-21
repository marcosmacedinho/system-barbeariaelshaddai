<template>
  <div>
    <h3 class="mb-4">Definir Horários Diários</h3>
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
          <h5>Horários Disponíveis:</h5>
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
import { ref, watch, computed } from 'vue';
import { doc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebaseConfig.js';
import { useAlert } from '@/stores/alert';

// Função para gerar horários entre início e fim com intervalos de 40 minutos
const generateTimes = (start, end) => {
  const times = [];
  const startDate = new Date(`1970-01-01T${start}:00`);
  const endDate = new Date(`1970-01-01T${end}:00`);
  const interval = 40 * 60 * 1000; // 40 minutos em milissegundos

  let current = new Date(startDate);

  while (current < endDate) {
    const hours = current.getHours().toString().padStart(2, '0');
    const minutes = current.getMinutes().toString().padStart(2, '0');
    times.push(`${hours}:${minutes}`);
    current = new Date(current.getTime() + interval);
  }

  return times;
};

// Função para gerar todas as opções de horários entre 05:00 e 23:00
const generateAllTimes = () => {
  const times = [];
  const startDate = new Date('1970-01-01T05:00:00');
  const endDate = new Date('1970-01-01T23:00:00');
  const interval = 40 * 60 * 1000;

  let current = new Date(startDate);

  while (current < endDate) {
    const hours = current.getHours().toString().padStart(2, '0');
    const minutes = current.getMinutes().toString().padStart(2, '0');
    times.push(`${hours}:${minutes}`);
    current = new Date(current.getTime() + interval);
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

  // Se for o mesmo dia, avance para a próxima ocorrência
  if (daysUntilNext === 0) {
    daysUntilNext = 7; // Pula para o próximo
  }

  const dayDate = new Date(currentDate);
  dayDate.setDate(currentDate.getDate() + daysUntilNext);

  return dayDate.toISOString().split('T')[0]; // Retorna a data no formato YYYY-MM-DD
};


// Função para formatar o dia com a data correspondente
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
  { day: 'Domingo', startTime: '', endTime: '' },
  { day: 'Segunda-feira', startTime: '', endTime: '' },
  { day: 'Terça-feira', startTime: '', endTime: '' },
  { day: 'Quarta-feira', startTime: '', endTime: '' },
  { day: 'Quinta-feira', startTime: '', endTime: '' },
  { day: 'Sexta-feira', startTime: '', endTime: '' },
  { day: 'Sábado', startTime: '', endTime: '' },
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
    dayDate: getDayDate(day.day), // Adiciona a data correspondente
    startTime: day.startTime,
    endTime: day.endTime,
    availableTimes: availableTimes.value[index]?.reduce((acc, time) => {
      acc[time] = { isBooked: false }; // Inicia todos os horários como não ocupados
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

// Escuta em tempo real para mudanças no Firestore
onSnapshot(doc(db, 'barbershop', 'dailySchedule'), (docSnapshot) => {
  if (docSnapshot.exists()) {
    const scheduleData = docSnapshot.data().schedule;
    dailySchedule.value = scheduleData.map((day) => ({
      day: day.day,
      startTime: day.startTime,
      endTime: day.endTime,
    }));
  }
});

watch(dailySchedule, (newSchedule) => {
  newSchedule.forEach((day, index) => {
    if (day.startTime && day.endTime) {
      availableTimes.value[index] = generateTimes(day.startTime, day.endTime);
    }
  });
}, { deep: true });

</script>

<style scoped>
.form-select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 20px;
}
</style>
