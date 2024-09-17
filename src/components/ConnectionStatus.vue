<template>
    <div>
        <transition name="bounce">
            <div v-if="showToast" class="toast-container position-fixed top-0 start-50 translate-middle-x p-3">
                <div class="toast fade show" role="alert" aria-live="assertive" aria-atomic="true">
                    <div class="toast-header">
                        <span class="material-symbols-rounded me-2">{{ toastIcon }}</span>
                        <strong class="me-auto">{{ toastTitle }}</strong>
                    </div>
                    <div class="toast-body">
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
const toastTitle = ref('Conexão');
const toastIcon = ref('wifi'); // Ícone inicial é o de conexão normal
let intervalId = null;

const showToastMessage = (message, icon) => {
    toastMessage.value = message;
    toastIcon.value = icon;
    showToast.value = true;
    setTimeout(() => {
        showToast.value = false;
    }, 3000);
};

const handleOffline = () => {
    showToastMessage('Você está offline.', 'wifi_off');
};

const checkConnectionSpeed = () => {
    const updateConnectionStatus = () => {
        if ('connection' in navigator) {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            const downlink = connection.downlink || 1;

            if (downlink < 2) {
                showToastMessage('Sua conexão está lenta.', 'signal_wifi_0_bar');
            } else {
                showToastMessage('Conectado', 'wifi');
            }
        } else {
            console.warn('API de Network Information não suportada.');
        }
    };

    // Checa o status da conexão inicialmente
    if (!navigator.onLine) {
        showToastMessage('Você está offline.', 'wifi_off');
    } else {
        updateConnectionStatus();
    }

    intervalId = setInterval(updateConnectionStatus, 10000);

    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', handleOffline);

    onUnmounted(() => {
        window.removeEventListener('online', updateConnectionStatus);
        window.removeEventListener('offline', handleOffline);
        clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
    });
};

onMounted(() => {
    checkConnectionSpeed();
});
</script>

<style scoped>
.toast-container {
    z-index: 1050;
    width: 270px;
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
    min-width: 250px;
    border-radius: 0.5rem;
    background-color: #343a40;
    color: #fff;
}

.toast-header {
    background-color: #495057;
    color: #fff;
    border-bottom: 1px solid #6c757d;
}

.toast-body {
    font-size: 0.875rem;
}

.material-symbols-rounded {
    font-size: 1.25rem;
    color: #28a745;
}
</style>
