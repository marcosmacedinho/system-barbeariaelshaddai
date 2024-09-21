<template>
    <button v-if="showButton" class="floating-button" @click="goToComments">
        <span class="material-symbols-rounded fs-4">comment</span>
    </button>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute(); // Para acessar a rota atual
const userStore = useUserStore();

const isAuthenticated = computed(() => userStore.isAuthenticated);

// Computed para verificar se a rota atual é FeedbackView
const showButton = computed(() => {
    return isAuthenticated.value && route.name !== 'Feedback'; // Substitua 'Feedback' pelo nome exato da sua rota
});

const goToComments = () => {
    router.replace({ name: 'Feedback' });
};
</script>

<style lang="scss" scoped>
.floating-button {
    position: fixed;
    bottom: 20px;
    right: 20px;
    background-color: $primary;
    color: white;
    border: none;
    border-radius: 50%;
    width: 56px;
    height: 56px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: background-color 0.3s;
}

.floating-button:hover {
    background-color: $primary;
}

@media (max-width: 992px) {
    .floating-button {
        left: 20px;
    }
}
</style>
