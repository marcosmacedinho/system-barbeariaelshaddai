<template>
  <div class="card mb-5">
    <div class="card-body">
      <form v-if="localSelectedTime" @submit.prevent="submitForm">
        <div class="mb-4">
          <label for="name" class="form-label">Nome</label>
          <input v-model="formData.name" type="text" class="form-control" id="name" required />
        </div>
        <div class="mb-3">
          <label for="phone" class="form-label">Telefone</label>
          <input v-model="formData.phone" type="text" class="form-control" id="phone" required
            v-mask="['(##) ####-####', '(##) #####-####']" />
        </div>
        <div class="mb-3">
          <label for="selectedDay" class="form-label">Dia Selecionado</label>
          <input type="text" class="form-control" id="selectedDay" disabled
            :value="localSelectedDay ? formatDayWithDate(localSelectedDay.day, localSelectedDay.dayDate) : 'Dia inválido'" />
        </div>
        <div class="mb-3">
          <label for="selectedTime" class="form-label">Horário Selecionado</label>
          <input v-model="localSelectedTime" type="text" class="form-control" id="selectedTime" disabled />
        </div>
        <button type="submit" class="btn btn-primary d-flex align-items-center gap-1 mt-4">Confirmar Agendamento <span
            class="material-symbols-rounded fs-5">check</span></button>
      </form>
      <p v-else>Selecione um horário para agendar.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { db } from '@/firebaseConfig';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { useAlert } from '@/stores/alert';
import { useUserStore } from '@/stores/userStore';

const props = defineProps(['selectedDay', 'selectedTime']);
const emit = defineEmits(['clearSelection']);
const alert = useAlert();
const userStore = useUserStore();

const formData = ref({
  name: '',
  phone: ''
});

const localSelectedDay = ref(props.selectedDay);
const localSelectedTime = ref(props.selectedTime?.time || null);

watch(() => props.selectedDay, (newValue) => {
  localSelectedDay.value = newValue;
});

watch(() => props.selectedTime, (newValue) => {
  localSelectedTime.value = newValue?.time || null;
});

const fetchUserData = async () => {
  const userId = userStore.user?.id;
  if (userId) {
    try {
      const userDocRef = doc(db, 'clients', userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        const userData = userDoc.data();
        formData.value.name = userData.name || '';
        formData.value.phone = userData.phone || '';
      } else {
        alert.show('Usuário não encontrado no Firestore.', 'error');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      alert.show('Erro ao buscar dados do usuário.', 'error');
    }
  } else {
    alert.show('Nenhum usuário autenticado.', 'error');
  }
};

onMounted(() => {
  fetchUserData();
});

const formatDayWithDate = (day, date) => {
  const parsedDate = new Date(date + 'T00:00:00');
  const options = { day: 'numeric', month: 'long', timeZone: 'America/Sao_Paulo' };
  return `${day}, ${parsedDate.toLocaleDateString('pt-BR', options)}`;
};

const submitForm = async () => {
  if (localSelectedTime.value) {
    try {
      const userId = userStore.user?.id; 
      if (userId) {
        await setDoc(doc(db, 'bookings', userId), {
          ...formData.value,
          day: localSelectedDay.value.day,
          dayDate: localSelectedDay.value.dayDate,
          time: localSelectedTime.value,
          userId: userId
        });

        const docRef = doc(db, 'barbershop', 'dailySchedule');
        const docSnapshot = await getDoc(docRef);
        const schedule = docSnapshot.data().schedule || [];
        const updatedSchedule = schedule.map(day => {
          if (day.day === localSelectedDay.value.day && day.availableTimes[localSelectedTime.value]) {
            day.availableTimes[localSelectedTime.value].isBooked = true;
          }
          return day;
        });
        await updateDoc(docRef, { schedule: updatedSchedule });

        alert.show('Agendamento confirmado!', 200);
        formData.value = { name: '', phone: '' };
        localSelectedTime.value = null;
        
        // Emitir um evento para limpar a seleção do dia também
        emit('clearSelection');

      } else {
        alert.show('Usuário não autenticado.', 300);
      }
    } catch (error) {
      alert.show('Erro ao confirmar agendamento.', 500);
    }
  } else {
    alert.show('Por favor, selecione um horário.', 300);
  }
};
</script>

<style scoped>
.card {
  margin-top: 20px;
}
</style>
