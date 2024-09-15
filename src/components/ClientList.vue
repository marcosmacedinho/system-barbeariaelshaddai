<template>
    <div>
        <h3>Clientes Cadastrados</h3>
        <ul class="list-group">
            <li v-for="client in clients" :key="client.id" class="list-group-item">
                <strong>Nome:</strong> {{ client.name }} <br>
                <strong>Telefone:</strong> {{ client.phone }}
            </li>
        </ul>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/firebaseConfig.js';

const clients = ref([]);

const loadClients = async () => {
    const querySnapshot = await getDocs(collection(db, 'clients'));
    clients.value = querySnapshot.docs.map(doc => doc.data());
};

onMounted(() => {
    loadClients();
});
</script>

<style scoped>
.list-group-item {
    margin-bottom: 10px;
}
</style>