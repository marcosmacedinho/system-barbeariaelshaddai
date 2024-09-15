<template>
    <div>
        <h3>Agendamentos</h3>
        <ul class="list-group">
            <li v-for="appointment in appointments" :key="appointment.id" class="list-group-item">
                <strong>Cliente:</strong> {{ appointment.name }} <br>
                <strong>Telefone:</strong> {{ appointment.phone }} <br>
                <strong>Horário:</strong> {{ appointment.time }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig.js';

const appointments = ref([]);

const loadAppointments = async () => {
    const querySnapshot = await getDocs(collection(db, 'appointments'));
    appointments.value = querySnapshot.docs.map(doc => doc.data());
};

onMounted(() => {
    loadAppointments();
});
</script>

<style scoped>
.list-group-item {
    margin-bottom: 10px;
}
</style>