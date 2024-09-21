<template>
    <div>
        <h3 class="mb-4">Clientes Cadastrados</h3>

        <div class="d-flex justify-content-between mb-2 flex-column gap-md-2 ">
            <input type="text" v-model="searchQuery" class="form-control mb-2 mb-md-0 w-25"
                placeholder="Buscar cliente por nome, email ou telefone" />
            <span class="text-muted p-1">
                {{ searchQuery ? 'Resultado da busca: ' + filteredClients.length : 'Total de clientes cadastrados: ' +
                    totalClients }}
            </span>
        </div>

        <div class="table-responsive">
            <table class="table table-striped table-sm mt-4">
                <thead>
                    <tr>
                        <th>Avatar</th>
                        <th>Nome</th>
                        <th>Email</th>
                        <th>Telefone</th>
                        <th>Status</th>
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
                        <td class="align-middle">
                            <span :class="isActive(client) ? 'status-active' : 'status-inactive'">
                                <span class="material-symbols-rounded">
                                    {{ isActive(client) ? 'radio_button_checked' : 'radio_button_unchecked' }}
                                </span>
                                {{ isActive(client) ? 'Ativo' : 'Inativo' }}
                            </span>
                        </td>


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
                                    required v-mask="['(##) ####-####', '(##) #####-####']" />
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/firebaseConfig.js';
import { getAuth, deleteUser } from 'firebase/auth';

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

const getAvatarUrl = (name) => {
    const gender = name.length % 2 === 0 ? 'boy' : 'girl';
    const avatarApiUrl = `https://avatar.iran.liara.run/public/${gender}?username=${name}`;

    const localBoyAvatar = new URL('@/assets/avatars/avatar-boy.png', import.meta.url).href;
    const localGirlAvatar = new URL('@/assets/avatars/avatar-girl.png', import.meta.url).href;

    const img = new Image();
    img.src = avatarApiUrl;

    img.onerror = () => {
        return gender === 'boy' ? localBoyAvatar : localGirlAvatar;
    };

    return avatarApiUrl;
};

const isActive = (client) => {
    if (client.lastLogin) {
        const lastLoginDate = new Date(client.lastLogin);
        const now = new Date();
        const daysSinceLastLogin = (now - lastLoginDate) / (1000 * 60 * 60 * 24);
        return daysSinceLastLogin <= 30; // Considera ativo se logou nos últimos 30 dias
    }
    return false;
};

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

const startClientsListener = () => {
    const unsubscribe = onSnapshot(collection(db, 'clients'), (snapshot) => {
        clients.value = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));
    });

    return unsubscribe;
};

const openEditModal = (client) => {
    editClientData.value = { ...client }; // Carrega os dados do cliente
    isEditModalOpen.value = true;
};

const closeEditModal = () => {
    isEditModalOpen.value = false;
};

const updateClient = async () => {
    try {
        const updates = {};
        const auth = getAuth();
        const user = auth.currentUser; // Obter o usuário atual

        if (!user) {
            alert('Usuário não autenticado. Não é possível enviar e-mail de verificação.');
            return; // Sai da função se o usuário não estiver autenticado
        }

        let emailChanged = false;

        // Verifica quais campos foram alterados
        if (editClientData.value.name) {
            updates.name = editClientData.value.name;
        }
        if (editClientData.value.phone) {
            updates.phone = editClientData.value.phone;
        }
        if (editClientData.value.email !== user.email) { // Se o e-mail foi alterado
            updates.email = editClientData.value.email;
            emailChanged = true;
        }

        // Atualiza as informações no Firestore
        await updateDoc(doc(db, 'clients', editClientData.value.id), updates);

        // Se o e-mail foi alterado, envia um e-mail de verificação
        if (emailChanged) {
            try {
                await user.sendEmailVerification(); // Envia o e-mail de verificação
                alert('Um e-mail de verificação foi enviado para o novo endereço. Por favor, verifique-o.');
            } catch (error) {
                console.error('Erro ao enviar o e-mail de verificação: ', error);
                alert('Erro ao enviar o e-mail de verificação: ' + error.message);
            }
        } else {
            alert('Cliente atualizado com sucesso!');
        }

        closeEditModal();
    } catch (error) {
        console.error('Erro ao atualizar o cliente: ', error);
        alert('Erro ao atualizar o cliente. ' + error.message);
    }
};



const deleteClient = async (clientId, email) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        try {
            await deleteDoc(doc(db, 'clients', clientId));

            const auth = getAuth();
            const user = auth.currentUser;
            if (user && user.email === email) {
                await deleteUser(user);
            }

            alert('Cliente excluído com sucesso!');
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
    const unsubscribe = startClientsListener();

    onUnmounted(() => {
        unsubscribe();
    });
});
</script>


<style lang="scss" scoped>
.avatar-img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
}

.status-active {
    color: white;
    background-color: $success;
    padding: 0.2rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    width: fit-content;
    gap: 4px;
}

.status-inactive {
    color: white;
    background-color: $danger;
    padding: 0.2rem 0.5rem;
    border-radius: 0.25rem;
    font-weight: bold;
    display: flex;
    align-items: center;
    width: fit-content;
    gap: 4px;
}

.table-sm {
    font-size: 0.875rem;
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
