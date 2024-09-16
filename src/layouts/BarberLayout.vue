<template>
  <div class="barber-layout">
    <Header />
    <div class="main-content">
      <Sidebar />
      <div class="content">
        <router-view />
        <AlertToast />
      </div>
    </div>
  </div>
</template>

<script setup>
import AlertToast from '@/components/AlertToast.vue';
import Header from '@/components/HeaderView.vue';
import Sidebar from '@/components/SideBar.vue';
</script>

<style scoped>
.barber-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 80px;
  background-color: #f8f9fa;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 20px;
}

.content {
  flex: 1;
  padding: 20px;
  background-color: #fff;
  overflow-y: auto;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
    /* Sidebar mais estreita em telas pequenas */
  }
}
</style>
