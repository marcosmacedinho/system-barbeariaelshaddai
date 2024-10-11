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
import dayjs from 'dayjs';

const props = defineProps(['selectedDay', 'selectedTime', 'selectedService']);
const emit = defineEmits(['clearSelection']);
const alert = useAlert();
const userStore = useUserStore();

const formData = ref({
  name: '',
  phone: ''
});

const localSelectedDay = ref(props.selectedDay);
const localSelectedTime = ref(props.selectedTime?.time || null);
const localSelectedService = ref(props.selectedService || null);

watch(() => props.selectedDay, (newValue) => {
  localSelectedDay.value = newValue;
});

watch(() => props.selectedTime, (newValue) => {
  localSelectedTime.value = newValue?.time || null;
});

watch(() => props.selectedService, (newValue) => {
  localSelectedService.value = newValue || null;
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
          service: localSelectedService.value.id,
          userId: userId
        });

        // Atualiza os horários no Firestore somente após a confirmação
        const docRef = doc(db, 'barbershop', 'dailySchedule');
        const docSnapshot = await getDoc(docRef);
        const schedule = docSnapshot.data().schedule || [];

        const dayIndex = schedule.findIndex(o => {
          return o.day === localSelectedDay.value.day
            && o.availableTimes[localSelectedTime.value]
        });

        if (dayIndex === -1) {
          alert.show('Agendamento não encontrado.', 'error');
          return;
        }

        const day = schedule[dayIndex];
        const serviceDuration = localSelectedService.value.duration;

        if (serviceDuration < 40) {
          const newDate = dayjs(dayjs().format('YYYY-MM-DD ') + localSelectedTime.value)
            .add(serviceDuration, 'minute').format('HH:mm');

          day.availableTimes[newDate] = { isBooked: false };
          day.availableTimes[localSelectedTime.value].isBooked = true;

        } else {
          const places = Math.ceil(serviceDuration / 40);
          for (let i = 0; i < places; i++) {
            const nextTime = dayjs(dayjs().format('YYYY-MM-DD ') + localSelectedTime.value)
              .add(i * 40, 'minute').format('HH:mm');

            if (day.availableTimes[nextTime]?.isBooked) {
              alert.show('Horários subsequentes j  estão marcados.', 'error');
              return;
            }
          }

          for (let i = 0; i < places; i++) {
            const nextTime = dayjs(dayjs().format('YYYY-MM-DD ') + localSelectedTime.value)
              .add(i * 40, 'minute').format('HH:mm');
            day.availableTimes[nextTime].isBooked = true;
          }
        }

        schedule[dayIndex] = day;
        await updateDoc(docRef, { schedule });

        alert.show('Agendamento confirmado!', 'success');
        formData.value = { name: '', phone: '' };
        localSelectedTime.value = null;
        emit('clearSelection');

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        alert.show('Usu rio não autenticado.', 'error');
      }
    } catch (error) {
      alert.show('Erro ao confirmar agendamento.', 'error');
    }
  } else {
    alert.show('Por favor, selecione um hor rio.', 'error');
  }
};

</script>

<style scoped>
.card {
  margin-top: 20px;
}
</style>
