<!-- src/components/HeaderView.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import avatarImage from '@/assets/male-avatar.png';

const userStore = useUserStore();
const avatarSrc = ref(avatarImage);
const userOptionsVisible = ref(false);
const barberShopName = ref('Barbearia El Shaddai');

const toggleUserOptions = () => {
    userOptionsVisible.value = !userOptionsVisible.value;
};

onMounted(() => {
    userStore.fetchUserInfo();
});
</script>

<template>
    <header class="d-flex w-100 align-items-center justify-content-between p-3">
        <!-- Campo de busca -->
        <div class="input-group" style="max-width: 500px;">
            <span class="input-group-text">
                <span class="material-symbols-rounded fs-4"> search </span>
            </span>
            <input type="text" class="form-control" placeholder="Buscar Cliente ou Serviço" v-model="searchQuery" />
        </div>

        <!-- Avatar de Perfil -->
        <div class="dropdown position-relative">
            <img :src="avatarSrc" alt="Avatar" class="rounded-circle" width="50" height="50" @click="toggleUserOptions"
                style="cursor: pointer;" />

            <div v-if="userOptionsVisible" class="dropdown-menu-custom">
                <div class="profile-header d-flex align-items-center p-3">
                    <img :src="avatarSrc" alt="Avatar" class="rounded-circle me-3" width="60" height="60" />
                    <div>
                        <h5 class="mb-0">{{ userStore.user?.name || 'Usuário' }}</h5>
                        <small>{{ userStore.user?.email || 'email@example.com' }}</small>
                    </div>
                </div>

                <div class="theme-switcher d-flex justify-content-around p-2">
                    <span class="material-symbols-rounded"> light_mode </span>
                    <span class="material-symbols-rounded"> dark_mode </span>
                </div>

                <div class="profile-body">
                    <a class="dropdown-item d-flex align-items-center py-3 px-2 gap-1" href="#">
                        <span class="material-symbols-rounded"> content_cut </span>{{ barberShopName }}
                    </a>
                    <a class="dropdown-item d-flex align-items-center py-3 px-2 gap-1" href="#">
                        <span class="material-symbols-rounded"> schedule </span>Último Login {{ userStore.lastLogin }}
                    </a>
                </div>

                <div class="profile-footer text-center">
                    <a class="dropdown-item d-flex align-items-center py-3 px-2" href="#" @click="logout">
                        <span class="material-symbols-rounded"> logout </span> Log Out
                    </a>
                </div>
            </div>
        </div>
    </header>
</template>


<style lang="scss" scoped>
header {
    width: 100%;
    top: 0;
    left: 0;
    z-index: 1000;
    background-color: #f8f9fa;
    border-bottom: 1px solid #e0e0e0;
}

.input-group-text {
    background-color: #f1f3f5;
}

.dropdown-menu-custom {
    position: absolute;
    top: 60px;
    right: 0;
    width: 260px;
    background-color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    animation: fadeIn 0.3s linear;
}

.profile-header {
    border-bottom: 1px solid #ddd;
    background-color: #f1f3f5;
}

.profile-header h5 {
    font-weight: 600;
    color: #333;
}

.profile-header small {
    color: #888;
}

.profile-body {
    padding: 10px 0;
}

.dropdown-item {
    padding: 10px 15px;
    font-size: 14px;
    color: #333;
    transition: background-color 0.2s;
}

.dropdown-item:hover {
    background-color: #f1f3f5;
}

.material-symbols-rounded {
    font-size: 1.5rem;
}

.profile-footer {
    border-top: 1px solid #ddd;
    background-color: #f1f3f5;
}

.theme-switcher {
    border-bottom: 1px solid #ddd;
    padding-bottom: 10px;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}
</style>
