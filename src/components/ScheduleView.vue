<template>
    <div>
        <h3>Agendamentos</h3>
        <ul class="list-group mt-4">
            <li v-for="appointment in appointments" :key="appointment.id"
                class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    <strong>Cliente:</strong> {{ appointment.name }} <br />
                    <strong>Telefone:</strong> {{ appointment.phone }} <br />
                    <strong>Horário:</strong> {{ appointment.time }}
                </div>
                <div>
                    <button class="btn btn-warning btn-sm me-2" @click="deferAppointment(appointment)">
                        <i class="fas fa-clock"></i> Adiar
                    </button>
                    <button class="btn btn-danger btn-sm me-2" @click="cancelAppointment(appointment.id)">
                        <i class="fas fa-times"></i> Despachar
                    </button>
                    <button class="btn btn-primary btn-sm" @click="editAppointment(appointment.id)">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                </div>
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs, deleteDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig.js';
import { useAlert } from '@/stores/alert';

const appointments = ref([]);
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

const editAppointment = (id) => {
    // Função para editar o agendamento
    console.log('Editar agendamento com ID:', id);
    // Adicione a lógica de edição conforme necessário
};

const cancelAppointment = async (id) => {
    try {
        await deleteDoc(doc(db, 'bookings', id)); // Corrigido o caminho para 'bookings'
        appointments.value = appointments.value.filter(app => app.id !== id);
        alert.show('Agendamento despachado com sucesso!', 200);
    } catch (error) {
        alert.show('Erro ao despachar agendamento.', 500);
        console.error('Erro ao despachar agendamento:', error);
    }
};

const deferAppointment = async (appointment) => {
    // Função para adiar o agendamento
    console.log('Adiar agendamento com ID:', appointment.id);
    try {
        const docRef = doc(db, 'bookings', appointment.id);
        const docSnapshot = await getDoc(docRef);
        if (docSnapshot.exists()) {
            // Atualizar o status para 'adiado' e atualizar a lista local
            await updateDoc(docRef, {
                status: 'adiado'
            });

            appointments.value = appointments.value.map(app => 
                app.id === appointment.id ? { ...app, status: 'adiado' } : app
            );

            alert.show('Agendamento adiado com sucesso!', 200);
        } else {
            alert.show('Agendamento não encontrado.', 404);
        }
    } catch (error) {
        alert.show('Erro ao adiar agendamento.', 500);
        console.error('Erro ao adiar agendamento:', error);
    }
};

onMounted(() => {
    loadAppointments();
});
</script>

<style scoped>
.list-group-item {
    margin-bottom: 10px;
}

@media (max-width: 576px) {
    .list-group-item {
        font-size: 14px;
        padding: 10px;
    }

    .btn-sm {
        font-size: 12px;
    }
}
</style>
