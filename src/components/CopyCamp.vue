<script setup>
import { inject } from 'vue';

const sysapp = inject('sysapp');
</script>

<template>
    <div class="copyr">
        <span class="material-symbols-rounded icon">
            info
        </span>
        <p>{{ `${sysapp.name} ${sysapp.version} ${sysapp.copy}` }}</p>
    </div>
</template>

<style scoped>
.copyr {
    position: fixed;
    bottom: 15px;
    left: 20px;
    color: var(--cl-txt-sec);
    opacity: 0.5;
    z-index: 1000;
    display: flex;
    align-items: center;
    gap: 6px;
}

.icon {
    font-size: 1rem;
}

.copyr p {
    font-size: 0.7rem;
    margin: 0;
    padding: 0;
}

@media(max-width:992px) {
    .copyr {
        bottom: 20px;
        right: 20px;
        left: auto;
    }
}
</style>
