<template>
  <div class="barber-layout">
    <Header />
    <div class="main-content">
      <div class="sidebar">
        <Sidebar />
      </div>
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
  height: 100dvh;
}

.main-content {
  display: flex;
  flex: 1;
  overflow-y: hidden;
}

.sidebar {
  width: 80px;
  flex-direction: column;
  align-items: center;
}

.content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  border-radius: 12px;
}

@media (max-width: 768px) {
  .sidebar {
    width: 60px;
  }
}
</style>