import { defineStore } from 'pinia'

export const useAlert = defineStore('alert', {
    state: () => {
        return {
            message: null,
            status: 0,
            visible: false
        }
    },
    actions: {
        show(message, status) {
            this.message = message
            this.status = status
            this.visible = true
        },
        hide() {
            this.visible = false
        },
    },
})