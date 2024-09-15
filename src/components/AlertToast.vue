<script setup>
import { useAlert } from '@/stores/alert';
import { computed, onMounted, ref } from 'vue';

const alert = useAlert()

function getTitle() {
    if (alert.status >= 500) {
        return ['report', 'Erro!', 'bg-danger']
    }

    if (alert.status >= 300) {
        return ['warning', 'Alerta!', 'bg-warning']
    }

    if (alert.status >= 200) {
        return ['done_all', 'Sucesso!', 'bg-success']
    }

    return ['info', 'Mensagem', 'bg-info']
}

const timeout = ref()

function btnClose() {
    clearTimeout(timeout.value)
    alert.hide()
}

const information = computed(() => getTitle())

onMounted(() => {
    timeout.value = setTimeout(() => {
        alert.hide()
    }, 10 * 1000)
})

</script>

<template>
    <div class="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="alert" class="toast show" :class="{ 'active': alert.visible }" role="alert" aria-live="assertive"
            aria-atomic="true">
            <div class="toast-header">
                <span class="material-symbols-rounded fs-5 me-1 rounded">
                    {{ information[0] }}
                </span>
                <strong class="me-auto">{{ information[1] }}</strong>
                <button @click="btnClose" type="button" class="btn-close" aria-label="Close"></button>
            </div>
            <div class="toast-body p-0 overflow-hidden">
                <div class="px-3 py-2">
                    {{ alert.message }}
                </div>
                <span class="progress" :class="information[2]"></span>
            </div>
        </div>
    </div>
</template>

<style>
#alert {
    opacity: 0;
    visibility: hidden;
    transition: 200ms;
}

#alert.active {
    opacity: 1;
    visibility: visible;
}

.progress {
    width: 0%;
    height: 2px !important;
    border-radius: 50px;
    animation: load 10s cubic-bezier(1, 1, 1, 1);
}

@keyframes load {
    from {
        width: 0%;
    }

    to {
        width: 100%;
    }
}
</style>