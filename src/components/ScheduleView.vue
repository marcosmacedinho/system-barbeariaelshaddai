<template>
    <div>
        <h3 class="d-md-block">Agendamentos</h3> <!-- Título escondido em mobile -->

        <!-- Botão de Ações para Mobile -->
        <div class="d-flex justify-content-end mb-3">
            <button class="btn btn-sm btn-light d-flex align-items-center gap-1" @click="toggleActionsMenu">
                <span class="material-symbols-rounded">delete</span> Limpeza
            </button>
        </div>

        <!-- Menu de Ações para Mobile -->
        <div v-if="showActionsMenu"
            class="actions-menu d-flex flex-md-row align-items-end mb-3 justify-content-around gap-3">
            <button class="btn btn-sm btn-light d-flex align-items-center gap-1" @click="clearAppointments('hour')">
                <span class="material-symbols-rounded">watch_later</span> Última Hora
            </button>
            <button class="btn btn-sm btn-light d-flex align-items-center gap-1" @click="clearAppointments('month')">
                <span class="material-symbols-rounded">calendar_view_month</span> Último Mês
            </button>
            <button class="btn btn-sm btn-light d-flex align-items-center gap-1 text-danger"
                @click="clearAppointments('all')">
                <span class="material-symbols-rounded">delete_forever</span> Todo Período
            </button>
        </div>

        <!-- Verifica se há agendamentos -->
        <div v-if="appointments.length > 0" class="row mt-2">
            <div class="col-12 mb-2" v-for="appointment in appointments" :key="appointment.id">
                <div class="card">
                    <div class="card-body d-flex align-items-center">
                        <div class="d-flex flex-column flex-grow-1">
                            <h5 class="card-title mb-1">{{ appointment.name }}</h5>
                            <p class="text-muted mb-1">{{ appointment.phone }}</p>
                            <p class="text-muted mb-1">Horário: {{ appointment.time }}</p>
                        </div>
                        <button class="btn btn-sm btn-link text-muted" @click="toggleDropdown(appointment.id)">
                            <span class="material-symbols-rounded">more_vert</span>
                        </button>
                    </div>

                    <!-- Dropdown Menu: aparece logo abaixo das informações do cliente -->
                    <div v-if="dropdownAppointmentId === appointment.id"
                        class="menu-options d-flex justify-content-between px-2 pb-2">
                        <button class="btn btn-light btn-sm d-flex align-items-center gap-1"
                            @click="deferAppointment(appointment)">
                            <span class="material-symbols-rounded">schedule</span> Adiar
                        </button>
                        <button class="btn btn-light btn-sm d-flex align-items-center gap-1 text-danger"
                            @click="cancelAppointment(appointment.id)">
                            <span class="material-symbols-rounded">cancel</span> Despachar
                        </button>
                        <button class="btn btn-light btn-sm d-flex align-items-center gap-1"
                            @click="editAppointment(appointment.id)">
                            <span class="material-symbols-rounded">edit</span> Editar
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <NothingHere v-else />

        <!-- Modal de Edição -->
        <div v-if="isEditModalOpen" class="modal fade show d-block" tabindex="-1"
            style="background: rgba(0, 0, 0, 0.5);">
            <div class="modal-dialog modal-sm"> <!-- Modal menor -->
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Editar Horário</h5>
                        <button type="button" class="btn-close" @click="closeEditModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="updateAppointment">
                            <input v-model="editAppointmentData.time" class="form-control mb-2" type="text"
                                placeholder="Novo Horário" required />
                            <button type="submit"
                                class="btn btn-primary btn-sm w-100 d-flex justify-content-center align-items-center gap-1">
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
const editAppointmentData = ref({ id: '', time: '' });
const showActionsMenu = ref(false); // Controla a visibilidade do menu de ações
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
        await updateDoc(docRef, { status: 'adiado' });
        appointments.value = appointments.value.map(app => (app.id === appointment.id ? { ...app, status: 'adiado' } : app));
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
            time: editAppointmentData.value.time,
        });
        closeEditModal();
        loadAppointments();
    } catch (error) {
        alert.show('Erro ao atualizar o agendamento.', 500);
        console.error('Erro ao atualizar o agendamento:', error);
    }
};

const toggleActionsMenu = () => {
    showActionsMenu.value = !showActionsMenu.value;
};

const clearAppointments = async (period) => {
    const now = new Date();
    let cutoffDate;

    // Define a data limite com base no período selecionado
    switch (period) {
        case 'hour':
            cutoffDate = new Date(now.getTime() - 60 * 60 * 1000); // Última hora
            break;
        case 'month':
            cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Último mês
            break;
        case 'all':
        default:
            cutoffDate = null; // Remove todos
            break;
    }

    try {
        if (cutoffDate) {
            appointments.value = appointments.value.filter(appointment => {
                const appointmentDate = new Date(appointment.time); // Considera o campo `time` como a data do agendamento
                return appointmentDate >= cutoffDate;
            });
        } else {
            appointments.value = []; // Remove todos
        }
        alert.show('Agendamentos limpos com sucesso!', 200);
        showActionsMenu.value = false; // Fecha o menu de ações após a limpeza
    } catch (error) {
        alert.show('Erro ao limpar agendamentos.', 500);
        console.error('Erro ao limpar agendamentos:', error);
    }
};

onMounted(loadAppointments);
</script>

<style scoped>
.card {
    border: 1px solid #ddd;
    border-radius: 0.5rem;
}

.menu-options {
    background: #f8f9fa;
    border-top: 1px solid #ddd;
}

.modal-content {
    border-radius: 0.5rem;
}

.actions-menu button {
    margin-bottom: 0.5rem;
}

.btn-link {
    color: #000;
    text-decoration: none;
}

.btn-link:hover {
    color: #007bff;
}
</style>
