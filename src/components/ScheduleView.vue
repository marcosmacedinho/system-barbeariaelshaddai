<template>
    <div>
        <div class="header mb-4">
            <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center">
                <h4 class="title mb-3 mb-md-0">Agendamentos</h4>

                <div class="d-flex flex-row flex-sm-row align-items-center align-items-sm-center gap-2">
                    <select v-model="filterStatus" class="form-select form-select-sm w-auto">
                        <option value="">Todos</option>
                        <option value="adiado">Adiado</option>
                        <option value="despachado">Despachado</option>
                    </select>

                    <button class="btn btn-sm btn-primary d-flex align-items-center gap-1 mt-sm-0"
                        @click="toggleActionsMenu">
                        <span class="material-symbols-rounded">delete</span> Limpar
                    </button>
                </div>
            </div>
        </div>



        <transition name="slide-fade">
            <div v-if="showActionsMenu" class="actions-menu d-flex flex-column mb-3 gap-3 p-3">
                <button class="btn btn-outline-secondary d-flex align-items-center gap-1"
                    @click="clearAppointments('hour')">
                    <span class="material-symbols-rounded">watch_later</span> Última Hora
                </button>
                <button class="btn btn-outline-secondary d-flex align-items-center gap-1"
                    @click="clearAppointments('month')">
                    <span class="material-symbols-rounded">calendar_view_month</span> Último Mês
                </button>
                <button class="btn btn-outline-danger d-flex align-items-center gap-1"
                    @click="clearAppointments('all')">
                    <span class="material-symbols-rounded">delete_forever</span> Todo Período
                </button>
            </div>
        </transition>

        <div v-if="filteredAppointments.length > 0" class="appointments-list">
            <div class="card appointment-card mb-3" v-for="appointment in filteredAppointments" :key="appointment.id">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div class="d-flex flex-column">
                        <h5 class="card-title">Cliente: {{ appointment.name }}</h5>
                        <p class="text-muted mb-0">Contato: {{ appointment.phone }}</p>
                        <p class="text-muted mb-0">Agendado para às {{ appointment.time }}</p>
                    </div>
                    <button class="btn btn-sm btn-icon" @click="toggleDropdown(appointment.id)">
                        <span class="material-symbols-rounded">more_vert</span>
                    </button>
                </div>

                <transition name="fade">
                    <div v-if="dropdownAppointmentId === appointment.id"
                        class="menu-options d-flex justify-content-around py-2">
                        <button class="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
                            @click="deferAppointment(appointment)">
                            <span class="material-symbols-rounded">schedule</span> Adiar
                        </button>
                        <button class="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                            @click="cancelAppointment(appointment.id)">
                            <span class="material-symbols-rounded">cancel</span> Despachar
                        </button>
                        <button class="btn btn-outline-warning btn-sm d-flex align-items-center gap-1"
                            @click="editAppointment(appointment.id)">
                            <span class="material-symbols-rounded">edit</span> Editar
                        </button>
                    </div>
                </transition>
            </div>
        </div>

        <NothingHere v-else />

        <transition name="fade">
            <div v-if="isEditModalOpen" class="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Editar Horário</h5>
                        <button type="button" class="btn-close" @click="closeEditModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="updateAppointment">
                            <input v-model="editAppointmentData.time" class="form-control mb-3" type="text"
                                placeholder="Novo Horário" required />
                            <button type="submit"
                                class="btn btn-primary btn-sm w-100 d-flex justify-content-center align-items-center gap-1">
                                <span class="material-symbols-rounded">save</span> Salvar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig.js';
import { useAlert } from '@/stores/alert';
import NothingHere from '@/components/NothingHere.vue';

const appointments = ref([]);
const dropdownAppointmentId = ref(null);
const isEditModalOpen = ref(false);
const editAppointmentData = ref({ id: '', time: '' });
const showActionsMenu = ref(false);
const alert = useAlert();
const filterStatus = ref('');

const filteredAppointments = computed(() => {
    if (!filterStatus.value) {
        return appointments.value;
    }
    return appointments.value.filter(appointment => appointment.status === filterStatus.value);
});
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
        const batch = db.batch(); // Usando batch para deletar múltiplos documentos de forma eficiente

        if (cutoffDate) {
            // Filtrar e remover os agendamentos com base na data
            appointments.value.forEach((appointment) => {
                const appointmentDate = new Date(appointment.time); // Considera o campo `time` como a data do agendamento
                if (appointmentDate < cutoffDate) {
                    const docRef = doc(db, 'bookings', appointment.id);
                    batch.delete(docRef); // Marca o documento para exclusão no Firestore
                }
            });
        } else {
            // Remove todos os agendamentos
            appointments.value.forEach((appointment) => {
                const docRef = doc(db, 'bookings', appointment.id);
                batch.delete(docRef); // Marca o documento para exclusão no Firestore
            });
        }

        await batch.commit(); // Executa todas as exclusões de uma vez
        alert.show('Agendamentos limpos com sucesso!', 200);

        // Após a exclusão no Firestore, atualiza a interface localmente
        if (cutoffDate) {
            appointments.value = appointments.value.filter(appointment => {
                const appointmentDate = new Date(appointment.time);
                return appointmentDate >= cutoffDate;
            });
        } else {
            appointments.value = []; // Limpa a lista localmente
        }

        showActionsMenu.value = false; // Fecha o menu de ações após a limpeza
    } catch (error) {
        alert.show('Erro ao limpar agendamentos.', 500);
        console.error('Erro ao limpar agendamentos:', error);
    }
};


onMounted(loadAppointments);
</script>

<style scoped>
.actions-menu {
    border: 1px solid #ccc;
    border-radius: 0.25rem;
    background-color: #f8f9fa;
}

.appointment-card {
    border-radius: 0.5rem;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
    background-color: #fff;
}

.menu-options {
    border-top: 1px solid #eee;
}

.btn-icon {
    background: transparent;
    border: none;
    color: #555;
    padding: 0;
    font-size: 1.5rem;
}

.btn-icon:hover {
    color: #000;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-title {
    font-size: 1.25rem;
}

.btn-close {
    background: transparent;
    border: none;
    font-size: 1.5rem;
}

.slide-fade-enter-active,
.slide-fade-leave-active {
    transition: all 0.1s ease;
}

.slide-fade-enter,
.slide-fade-leave-to {
    transform: translatey(-10px);
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity .8s;

}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>