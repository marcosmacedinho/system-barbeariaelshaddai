<template>
  <div>
    <h3 class="mb-4">Definir Horários Diários</h3>
    <form @submit.prevent="saveDailySchedule">
      <div v-for="(schedule, index) in dailySchedule" :key="index" class="mb-3">
        <label :for="'day-' + index">{{ schedule.day }}</label>
        <div class="d-flex gap-2">
          <select v-model="schedule.startTime" :id="'start-' + index" class="form-select"
            @change="updateAvailableTimes(index)">
            <option value="" disabled>Início</option>
            <option v-for="time in timeOptions" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
          <select v-model="schedule.endTime" :id="'end-' + index" class="form-select"
            @change="updateAvailableTimes(index)">
            <option value="" disabled>Fim</option>
            <option v-for="time in timeOptions" :key="time" :value="time">
              {{ time }}
            </option>
          </select>
        </div>
        <div v-if="availableTimes[index]?.length">
          <h5>Horários Disponíveis:</h5>
          <ul>
            <li v-for="time in availableTimes[index]" :key="time">{{ time }}</li>
          </ul>
        </div>
      </div>
      <button type="submit" class="btn btn-primary d-flex align-items-center gap-1" :disabled="isLoading">
        <span class="material-symbols-rounded">save</span>
        {{ isLoading ? 'Salvando...' : 'Salvar Horários' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig.js';
import { useAlert } from '@/stores/alert';

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

// Gerar horários possíveis para todo o dia
const generateAllTimes = () => {
  const times = [];
  const start = '05:00';
  const end = '23:00';
  const startDate = new Date(`1970-01-01T${start}:00`);
  const endDate = new Date(`1970-01-01T${end}:00`);
  const interval = 40 * 60 * 1000; // 40 minutes in milliseconds

  for (let current = startDate; current < endDate; current = new Date(current.getTime() + interval)) {
    const hours = current.getUTCHours().toString().padStart(2, '0');
    const minutes = current.getUTCMinutes().toString().padStart(2, '0');
    times.push(`${hours}:${minutes}`);
  }

  return times;
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

// Atualizar horários disponíveis com base no horário de início e fim
const updateAvailableTimes = (index) => {
  const startTime = dailySchedule.value[index].startTime;
  const endTime = dailySchedule.value[index].endTime;

  if (startTime && endTime) {
    availableTimes.value[index] = generateTimes(startTime, endTime);
  } else {
    availableTimes.value[index] = [];
  }
};

// Salvar horários diários no Firestore
const saveDailySchedule = async () => {
  isLoading.value = true;
  try {
    await setDoc(doc(db, 'barbershop', 'dailySchedule'), {
      schedule: dailySchedule.value
    });
    alert.show('Horários salvos com sucesso!', 200);
  } catch (error) {
    alert.show('Erro ao salvar horários.', 500);
  } finally {
    isLoading.value = false;
  }
};

// Observar alterações nos horários diários e atualizar a lista de horários disponíveis
watch(dailySchedule, (newSchedule) => {
  newSchedule.forEach((day, index) => {
    if (day.startTime && day.endTime) {
      availableTimes.value[index] = generateTimes(day.startTime, day.endTime);
    }
  });
}, { deep: true });
</script>

<style lang="scss" scoped>


.form-select {
  width: 100%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  margin-bottom: 20px;
  overflow: auto;
}
</style>
