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
          <input v-model="localSelectedDay" type="text" class="form-control" id="selectedDay" disabled />
        </div>
        <div class="mb-3">
          <label for="selectedTime" class="form-label">Horário Selecionado</label>
          <input v-model="localSelectedTime" type="text" class="form-control" id="selectedTime" disabled />
        </div>
        <button type="submit" class="btn btn-primary d-flex align-items-center gap-1 mt-4">Confirmar Agendamento <span
            class="material-symbols-rounded fs-5">
            check
          </span></button>
      </form>
      <p v-else>Selecione um horário para agendar.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { auth, db } from '@/firebaseConfig';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';
import { useAlert } from '@/stores/alert';

const props = defineProps(['selectedDay', 'selectedTime']);
const alert = useAlert();

const formData = ref({
  name: '',
  phone: ''
});

const localSelectedDay = ref(props.selectedDay);
const localSelectedTime = ref(props.selectedTime?.time || null); // Alterado aqui

watch(() => props.selectedDay, (newValue) => {
  localSelectedDay.value = newValue;
});

watch(() => props.selectedTime, (newValue) => {
  localSelectedTime.value = newValue?.time || null; // Alterado aqui
});

const fetchUserData = async (userId) => {
  try {
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      formData.value.name = userData.name || '';
      formData.value.phone = userData.phone || '';
    }
  } catch (error) {
    alert.show('Erro ao buscar dados do usuário.', 500);
  }
};

const submitForm = async () => {
  if (localSelectedTime.value) {
    try {
      const user = auth.currentUser;
      if (user) {
        await setDoc(doc(db, 'bookings', user.uid), {
          ...formData.value,
          day: localSelectedDay.value,
          time: localSelectedTime.value,
          userId: user.uid
        });

        const docRef = doc(db, 'barbershop', 'dailySchedule');
        const docSnapshot = await getDoc(docRef);
        const schedule = docSnapshot.data().schedule || [];

        const updatedSchedule = schedule.map(day => {
          if (day.day === localSelectedDay.value && day.availableTimes[localSelectedTime.value]) {
            day.availableTimes[localSelectedTime.value].isBooked = true;
          }
          return day;
        });

        await updateDoc(docRef, { schedule: updatedSchedule });

        alert.show('Agendamento confirmado!', 200);
        formData.value = { name: '', phone: '' };
        localSelectedTime.value = null;
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

onMounted(() => {
  const user = auth.currentUser;
  if (user) {
    fetchUserData(user.uid);
  }
});
</script>

<style scoped>
form {
  margin-top: 20px;
}
</style>
