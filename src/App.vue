<template>
  <div v-if="userStore.loading" class="loading d-flex justify-content-center align-items-center">
    <div class="spinner-grow" role="status">
    </div>
  </div>
  <div v-else>
    <router-view />
    <AlertToast />
    <CopyCamp />
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/userStore';
import AlertToast from './components/AlertToast.vue';
import { provide } from 'vue';
import CopyCamp from './components/CopyCamp.vue';

const sysapp = {
  name: 'Barbearia El Shaddai',
  version: '1.0.0',
  copy: '- 2024'
};

provide('sysapp', sysapp);

const router = useRouter();
const userStore = useUserStore();

userStore.initAuthListener(router);
</script>

<style lang="scss">
@import './scss/init.scss'; 

.loading {
  height: 100dvh;
}
</style>
