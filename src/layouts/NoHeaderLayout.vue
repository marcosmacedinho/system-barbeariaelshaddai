<!-- src/layouts/NoHeaderLayout.vue -->
<template>
    <div>
      <router-view />
      <AlertToast />
    </div>
  </template>
  
  <script setup>
  import AlertToast from '@/components/AlertToast.vue';
  </script>
  