<template>
    <div>
        <h3 class="mb-4">Clientes Cadastrados</h3>

        <!-- Barra de Pesquisa -->
        <div class="d-flex justify-content-between mb-2 flex-column gap-md-2 ">
            <input type="text" v-model="searchQuery" class="form-control mb-2 mb-md-0 w-100 w-md-50"
                placeholder="Buscar cliente por nome, email ou telefone" />

            <span class="text-muted p-1">
                {{ searchQuery ? 'Resultado da busca: ' + filteredClients.length : 'Total de clientes cadastrados: ' +
                    totalClients }}
            </span>

        </div>

        <!-- Tabela de Clientes -->
        <div class="table-responsive">
            <table class="table table-striped table-sm mt-4">
                <thead>
                    <tr>
                        <th>Avatar</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Telefone</th>
                        <th>Cadastrado em</th>
                        <th>Último Login</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="client in filteredClients" :key="client.id" style="font-size: 0.875rem;">
                        <td class="align-middle">
                            <img :src="getAvatarUrl(client.name)" alt="Avatar" class="avatar-img" />
                        </td>
                        <td class="align-middle">{{ client.name }}</td>
                        <td class="align-middle">{{ client.email }}</td>
                        <td class="align-middle">{{ client.phone }}</td>
                        <td class="align-middle">{{ formatDate(client.createdAt) }}</td>
                        <td class="align-middle">{{ formatDate(client.lastLogin) }}</td>
                        <td class="align-middle position-relative">
                            <button class="btn" @click="toggleDropdown(client.id)">
                                <span class="material-symbols-rounded">more_vert</span>
                            </button>
                            <div v-if="dropdownClientId === client.id" class="dropdown-menu show">
                                <button class="dropdown-item d-flex align-items-center gap-1"
                                    @click="openEditModal(client); closeDropdown()">
                                    <span class="material-symbols-rounded">edit</span>Editar
                                </button>
                                <button class="dropdown-item text-danger d-flex align-items-center gap-1"
                                    @click="deleteClient(client.id); closeDropdown()">
                                    <span class="material-symbols-rounded">delete</span>Excluir
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Modal de Edição -->
        <div v-if="isEditModalOpen" class="modal fade show d-block" tabindex="-1"
            style="background: rgba(0, 0, 0, 0.5);">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header d-flex justify-content-between">
                        <h5 class="modal-title">Editar Cliente</h5>
                        <span class="material-symbols-rounded" @click="closeEditModal">cancel</span>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="updateClient">
                            <div class="mb-3">
                                <label class="form-label" for="editName">Nome</label>
                                <input v-model="editClientData.name" class="form-control" id="editName" type="text"
                                    required />
                            </div>
                            <div class="mb-3">
                                <label class="form-label" for="editEmail">Email</label>
                                <input v-model="editClientData.email" class="form-control" id="editEmail" type="email"
                                    required />
                            </div>
                            <div class="mb-3">
                                <label class="form-label" for="editPhone">Número de Telefone</label>
                                <input v-model="editClientData.phone" class="form-control" id="editPhone" type="text"
                                    required />
                            </div>
                            <button type="submit" class="btn btn-primary d-flex align-items-center gap-1">
                                <span class="material-symbols-rounded">save</span>Salvar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig.js';

const clients = ref([]);
const searchQuery = ref('');
const dropdownClientId = ref(null);
const isEditModalOpen = ref(false);
const editClientData = ref({
    id: '',
    name: '',
    email: '',
    phone: ''
});

// Função para carregar os clientes do Firestore
const loadClients = async () => {
    const querySnapshot = await getDocs(collection(db, 'clients'));
    clients.value = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
};

// Função para buscar o avatar com base no nome
const getAvatarUrl = (name) => {
    const gender = name.length % 2 === 0 ? 'boy' : 'girl';
    return `https://avatar.iran.liara.run/public/${gender}?username=${name}`;
};

// Função para formatar datas
const formatDate = (date) => {
    if (!date) return 'N/A';
    if (typeof date.toDate === 'function') {
        return date.toDate().toLocaleString();
    }
    if (typeof date === 'string') {
        return new Date(date).toLocaleString();
    }
    return 'N/A';
};

// Filtro de clientes com base na pesquisa e excluindo o administrador
const filteredClients = computed(() => {
    return clients.value
        .filter(client => client.role !== 'admin') // Exclui o administrador da listagem
        .filter(client => {
            const searchTerm = searchQuery.value.toLowerCase();
            return (
                client.name.toLowerCase().includes(searchTerm) ||
                client.email.toLowerCase().includes(searchTerm) ||
                client.phone.includes(searchTerm)
            );
        });
});

const totalClients = computed(() => {
    return clients.value.filter(client => client.role !== 'admin').length;
});



const openEditModal = (client) => {
    editClientData.value = { ...client };
    isEditModalOpen.value = true;
};

const closeEditModal = () => {
    isEditModalOpen.value = false;
};

const updateClient = async () => {
    try {
        await updateDoc(doc(db, 'clients', editClientData.value.id), {
            name: editClientData.value.name,
            email: editClientData.value.email,
            phone: editClientData.value.phone
        });
        closeEditModal();
        loadClients(); // Recarregar a lista após a atualização
    } catch (error) {
        console.error('Erro ao atualizar o cliente: ', error);
        alert('Erro ao atualizar o cliente.');
    }
};

const deleteClient = async (clientId) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        try {
            await deleteDoc(doc(db, 'clients', clientId));
            loadClients(); // Recarregar a lista após a exclusão
        } catch (error) {
            console.error('Erro ao excluir o cliente: ', error);
            alert('Erro ao excluir o cliente.');
        }
    }
};

const toggleDropdown = (clientId) => {
    dropdownClientId.value = dropdownClientId.value === clientId ? null : clientId;
};

const closeDropdown = () => {
    dropdownClientId.value = null;
};

onMounted(() => {
    loadClients();
});
</script>

<style scoped>
.avatar-img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
}

.table-sm {
    font-size: 0.875rem;
    /* Letra miúda */
}

.align-middle {
    vertical-align: middle;
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
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 1rem;
    border-bottom: 1px solid #dee2e6;
}

.modal-title {
    margin-bottom: 0;
    line-height: 1.5;
}

.modal-body {
    position: relative;
    padding: 1rem;
}

.btn {
    background-color: transparent;
    border: none;
    outline: none;
    padding: 0.5rem;
    cursor: pointer;
    color: #000;
}

.btn:hover {
    background-color: #f8f9fa;
}

@media (max-width: 768px) {
    .w-md-50 {
        width: 100%;
    }
}
</style>
