<template>
    <div>
        <transition name="bounce">
            <div v-if="showToast" class="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
                <div class="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-body">
                        <span class="material-symbols-rounded me-2">{{ toastIcon }}</span>
                        {{ toastMessage }}
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const showToast = ref(false);
const toastMessage = ref('');
const toastIcon = ref('wifi'); // Ícone inicial é o de conexão normal
let connectionChecked = false; // Variável para evitar múltiplas verificações

const showToastMessage = (message, icon) => {
    toastMessage.value = message;
    toastIcon.value = icon;
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
    }, 3000);
};

const handleOffline = () => {
    showToastMessage('Você não está conectado à internet.', 'wifi_off');
};

const handleOnline = () => {
    // Reseta a flag de verificação ao voltar online
    connectionChecked = false;
    showToastMessage('Você está conectado novamente.', 'wifi');
};

const checkConnectionSpeed = () => {
    const updateConnectionStatus = () => {
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const downlink = connection.downlink || 1;

            if (downlink < 2 && !connectionChecked) {
                showToastMessage('Sua conexão está lenta.', 'signal_wifi_0_bar');
                connectionChecked = true; // Marca como verificado para não repetir a checagem
            }
        } else {
            console.warn('API de Network Information não suportada.');
        }
    };

    if (!navigator.onLine) {
        showToastMessage('Você está offline.', 'wifi_off');
    } else {
        updateConnectionStatus();
    }
};

onMounted(() => {
    checkConnectionSpeed();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if ('connection' in navigator) {
        navigator.connection.addEventListener('change', checkConnectionSpeed);
    }
});

onUnmounted(() => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);

    if ('connection' in navigator) {
        navigator.connection.removeEventListener('change', checkConnectionSpeed);
    }
});
</script>

<style scoped>
.toast-container {
    z-index: 1050;
}

.bounce-enter-active,
.bounce-leave-active {
    transition: all 0.5s ease;
}

.bounce-enter {
    transform: scale(0.5) translateY(-50px);
    opacity: 0;
}

.bounce-enter-to {
    transform: scale(1) translateY(0);
    opacity: 1;
}

.bounce-leave {
    transform: scale(1) translateY(0);
    opacity: 1;
}

.bounce-leave-to {
    transform: scale(0.5) translateY(50px);
    opacity: 0;
}

.toast {
    width: fit-content;
    border-radius: 0.5rem;
    background-color: #343a40;
    color: #fff;
}

.toast-body {
    font-size: 0.875rem;
    display: flex;
    align-items: center;
    justify-content: center;
}

.material-symbols-rounded {
    font-size: 1.25rem;
    color: #28a745;
}
</style>
