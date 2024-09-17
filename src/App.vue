<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import AlertToast from './components/AlertToast.vue';
import ConnectionStatus from './components/ConnectionStatus.vue';

const router = useRouter();
const userStore = useUserStore();

userStore.initAuthListener(router);
</script>

<template>
  <div v-if="userStore.loading" class="d-flex justify-content-center align-items-center min-vh-100">
    <div class="spinner-border" role="status">
    </div>
  </div>
  <div v-else>
    <router-view />
    <AlertToast />
    <ConnectionStatus />
  </div>
</template>

<style lang="scss">
@import './scss/init.scss';

.spinner-border {
  width: 3rem;
  height: 3rem;
  border-width: 0.2em;
}
</style>
