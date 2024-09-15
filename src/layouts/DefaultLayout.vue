<!-- src/layouts/DefaultLayout.vue -->
<template>
    <div>
      <Header />
      <router-view />
      <AlertToast />
    </div>
  </template>
  
  <script setup>
  import Header from '@/components/HeaderView.vue';
  import AlertToast from '@/components/AlertToast.vue';
  </script>
  