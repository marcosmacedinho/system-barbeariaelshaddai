import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAlert = defineStore('alert', () => {
    const message = ref(null)
    const status = ref(0)
    const visible = ref(false)

    function show(userMessage, userStatus) {
        message.value = userMessage
        status.value = userStatus
        visible.value = true
    }

    function hide() {
        visible.value = false
    }

    return {
        message,
        status,
        visible,
        show,
        hide
    }
})