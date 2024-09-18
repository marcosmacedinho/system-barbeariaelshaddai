<script setup>
import { ref } from 'vue';
import Availability from '@/components/AvailableTimes.vue';
import BookingForm from '@/components/BookingForm.vue';
import { useAlert } from '@/stores/alert';

const selectedTime = ref(null);


const selectTime = (time) => {
  selectedTime.value = time;
};

const bookAppointment = (appointmentDetails) => {
  useAlert().show('Agendamento enviado com sucesso!', 200, appointmentDetails);
};
</script>

<template>
  <div class="container">
    <h1 class="text-center primary mb-4">Agendar Corte</h1>

    <div class="availability-section mb-5">
      <h2 class="text-secondary mb-3">Escolha um dia e horário</h2>
      <Availability @select="selectTime" />
    </div>

    <div v-if="selectedTime" class="booking-form-section">
      <h2 class="text-secondary mb-3">Complete seu agendamento</h2>
      <BookingForm :selectedTime="selectedTime" @submit="bookAppointment" />
    </div>

    <div v-else class="alert alert-info text-center d-flex align-items-center justify-content-center gap-1">
      <span class="material-symbols-rounded">
        info
      </span>Selecione um horário antes de preencher o formulário.
    </div>
  </div>
</template>

<style scoped>
.container {
  margin-top: 20px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

h1 {
  font-size: 1.75rem;
  font-weight: 600;
}

h2 {
  font-size: 1.5rem;
  font-weight: 500;
}

.availability-section,
.booking-form-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.alert {
  font-size: 1rem;
}


/* Responsividade */
@media (max-width: 768px) {
  .container {
    padding: 0 15px;
  }

  h1 {
    font-size: 1.5rem;
  }

  h2 {
    font-size: 1.25rem;
  }

  .alert {
    font-size: .8rem;
  }
}
</style>
