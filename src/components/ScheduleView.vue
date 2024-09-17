<template>
    <div>
      <h3>Agendamentos</h3>
      
      <!-- Verifica se há agendamentos -->
      <div v-if="appointments.length > 0" class="row mt-4">
        <div class="col-md-4 mb-3" v-for="appointment in appointments" :key="appointment.id">
          <div class="card">
            <div class="card-body">
              <h5 class="card-title">{{ appointment.name }}</h5>
              <p class="card-text">Telefone: {{ appointment.phone }}</p>
              <p class="card-text">Horário: {{ appointment.time }}</p>
              <div class="d-flex justify-content-end">
                <button class="btn btn-secondary btn-sm me-2" @click="toggleDropdown(appointment.id)">
                  <span class="material-symbols-rounded">more_vert</span>
                </button>
                <div v-if="dropdownAppointmentId === appointment.id" class="dropdown-menu show">
                  <button class="dropdown-item d-flex align-items-center gap-1" @click="deferAppointment(appointment)">
                    <span class="material-symbols-rounded">schedule</span> Adiar
                  </button>
                  <button class="dropdown-item text-danger d-flex align-items-center gap-1" @click="cancelAppointment(appointment.id)">
                    <span class="material-symbols-rounded">cancel</span> Despachar
                  </button>
                  <button class="dropdown-item d-flex align-items-center gap-1" @click="editAppointment(appointment.id)">
                    <span class="material-symbols-rounded">edit</span> Editar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Exibe componente NothingHere quando não houver agendamentos -->
      <NothingHere v-else />
  
      <!-- Modal de Edição -->
      <div v-if="isEditModalOpen" class="modal fade show d-block" tabindex="-1" style="background: rgba(0, 0, 0, 0.5);">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header d-flex justify-content-between">
              <h5 class="modal-title">Editar Agendamento</h5>
              <span class="material-symbols-rounded" @click="closeEditModal">cancel</span>
            </div>
            <div class="modal-body">
              <form @submit.prevent="updateAppointment">
                <div class="mb-3">
                  <label class="form-label" for="editTime">Novo Horário</label>
                  <input v-model="editAppointmentData.time" class="form-control" id="editTime" type="text" required />
                </div>
                <button type="submit" class="btn btn-primary d-flex align-items-center gap-1">
                  <span class="material-symbols-rounded">save</span> Salvar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
  import { db } from '@/firebaseConfig.js';
  import { useAlert } from '@/stores/alert';
  import NothingHere from '@/components/NothingHere.vue'; // Importa o componente NothingHere
  
  const appointments = ref([]);
  const dropdownAppointmentId = ref(null);
  const isEditModalOpen = ref(false);
  const editAppointmentData = ref({
      id: '',
      time: ''
  });
  const alert = useAlert();
  
  const loadAppointments = async () => {
      try {
          const querySnapshot = await getDocs(collection(db, 'bookings'));
          appointments.value = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
          }));
      } catch (error) {
          alert.show('Erro ao carregar agendamentos.', 500);
          console.error('Erro ao carregar agendamentos:', error);
      }
  };
  
  const toggleDropdown = (appointmentId) => {
      dropdownAppointmentId.value = dropdownAppointmentId.value === appointmentId ? null : appointmentId;
  };
  
  const deferAppointment = async (appointment) => {
      try {
          const docRef = doc(db, 'bookings', appointment.id);
          await updateDoc(docRef, {
              status: 'adiado'
          });
  
          appointments.value = appointments.value.map(app =>
              app.id === appointment.id ? { ...app, status: 'adiado' } : app
          );
  
          alert.show('Agendamento adiado com sucesso!', 200);
      } catch (error) {
          alert.show('Erro ao adiar agendamento.', 500);
          console.error('Erro ao adiar agendamento:', error);
      }
  };
  
  const cancelAppointment = async (id) => {
      try {
          await deleteDoc(doc(db, 'bookings', id));
          appointments.value = appointments.value.filter(app => app.id !== id);
          alert.show('Agendamento despachado com sucesso!', 200);
      } catch (error) {
          alert.show('Erro ao despachar agendamento.', 500);
          console.error('Erro ao despachar agendamento:', error);
      }
  };
  
  const editAppointment = (id) => {
      const appointment = appointments.value.find(app => app.id === id);
      if (appointment) {
          editAppointmentData.value = { id: appointment.id, time: appointment.time };
          isEditModalOpen.value = true;
      }
  };
  
  const closeEditModal = () => {
      isEditModalOpen.value = false;
  };
  
  const updateAppointment = async () => {
      try {
          await updateDoc(doc(db, 'bookings', editAppointmentData.value.id), {
              time: editAppointmentData.value.time
          });
          closeEditModal();
          loadAppointments();
      } catch (error) {
          alert.show('Erro ao atualizar o agendamento.', 500);
          console.error('Erro ao atualizar o agendamento:', error);
      }
  };
  
  onMounted(() => {
      loadAppointments();
  });
  </script>
  

<style scoped>
.card {
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-title {
    font-size: 1.25rem;
    font-weight: bold;
}

.card-text {
    margin: 0.5rem 0;
}

.position-relative {
    position: relative;
}

.dropdown-menu {
    position: absolute;
    background-color: white;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    z-index: 1000;
    min-width: 150px;
    display: none;
}

.dropdown-menu.show {
    display: block;
}

.dropdown-item {
    cursor: pointer;
}

.dropdown-item:hover {
    background-color: #f8f9fa;
}

.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
}

.modal-dialog {
    margin: 1.75rem auto;
}

.modal-content {
    position: relative;
    background-color: #fff;
    border: 1px solid #dee2e6;
    border-radius: 0.3rem;
    outline: 0;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
}

.modal-body {
    padding: 1rem;
}

.material-symbols-rounded {
    font-size: 1.2rem;
    cursor: pointer;
}

@media (max-width: 768px) {
    .card {
        font-size: 14px;
    }
}

@media (max-width: 576px) {
    .card {
        font-size: 12px;
    }
}
</style>
