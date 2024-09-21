<script setup>
import { useAlert } from '@/stores/alert';
import { computed, ref, watch } from 'vue';

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

const information = computed(() => getTitle())

const time = 7
const momentum = time * 1000
const delay = 300

const pos = ref(0)
const timeout = ref()
const interval = ref()

watch(() => alert.visible, (newval) => {
    if (newval) {
        interval.value = setInterval(() => {
            pos.value += 1
        }, (momentum - delay) / 100)
        timeout.value = setTimeout(() => {
            alert.hide()
            pos.value = 0
            clearInterval(interval.value)
        }, momentum)
    }
})

function btnClose() {
    alert.hide()
    pos.value = 0
    clearTimeout(timeout.value)
    clearInterval(interval.value)
}
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
                <span class="progress" style="height: 2px;">
                    <span :class="information[2]"
                        :style="{ 'width': `${pos}%`, 'transition': `all ${delay}ms` }"></span>
                </span>
            </div>
        </div>
    </div>
</template>

<style scoped>
#alert {
    opacity: 0;
    visibility: hidden;
    transition: 200ms;
}

#alert.active {
    opacity: 1;
    visibility: visible;
}
</style>