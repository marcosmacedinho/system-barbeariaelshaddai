<template>
  <div class="container">
    <h1 class="text-center primary mb-5">Agendar Corte</h1>

    <div class="availability-section mb-5">
      <h2 class="mb-3">Escolha um dia e horário</h2>
      <AvailableTime @select="selectTime" @selectDay="selectDay" :reset="resetSelection" />
    </div>

    <div v-if="selectedTime && selectedDay" class="booking-form-section">
      <h2 class="text-secondary mb-3">Complete seu agendamento</h2>
      <BookingForm :selectedDay="selectedDay" :selectedTime="selectedTime" @submit="bookAppointment"
        @close="handleClose" />
    </div>

    <div v-else class="alert alert-info text-center d-flex align-items-center justify-content-center gap-1">
      <span class="material-symbols-rounded">info</span>
      Selecione um horário antes de preencher o formulário.
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import AvailableTime from '@/components/AvailableTimes.vue';
import BookingForm from '@/components/BookingForm.vue';
import { useAlert } from '@/stores/alert';

const selectedTime = ref(null);
const selectedDay = ref(null);
const resetSelection = ref(false); // Controla o reset dos selects

// Atualiza o selectedDay quando um dia é selecionado
const selectDay = (day) => {
  selectedDay.value = day;
};

// Atualiza o selectedTime quando um horário é selecionado
const selectTime = (time) => {
  selectedTime.value = time;
};

// Lida com o fechamento do BookingForm e limpa as seleções
const handleClose = (payload) => {
  if (payload.clearSelection) {
    selectedDay.value = null;
    selectedTime.value = null;
    resetSelection.value = true;  // Ativa o reset
  }
};

const bookAppointment = (appointmentDetails) => {
  useAlert().show('Agendamento enviado com sucesso!', 200, appointmentDetails);
};

// Observa o resetSelection e redefine após a alteração
watch(resetSelection, (newVal) => {
  if (newVal) {
    resetSelection.value = false; // Reseta a flag para futuras limpezas
  }
});
</script>

<style scoped>
.container {
  margin-top: 20px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.alert {
  font-size: 0.8rem
}
</style>
