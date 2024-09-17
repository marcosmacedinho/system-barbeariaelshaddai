<!-- src/components/Sidebar.vue -->
<template>
    <div class="sidebar">
        <nav class="nav flex-column">
            <router-link to="/barber/appointments" class="nav-link">
                <span class="material-symbols-rounded"> event </span>
            </router-link>
            <router-link to="/barber/schedule-manager" class="nav-link">
                <span class="material-symbols-rounded"> schedule </span>
            </router-link>
            <router-link to="/barber/clients" class="nav-link">
                <span class="material-symbols-rounded"> person </span>
            </router-link>
        </nav>
    </div>
</template>

<style scoped>
.sidebar {
    width: 80px;
    height: 100vh;
    top: 0;
    left: 0;
    background-color: #f8f9fa;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.nav-link {
    width: 100%;
    text-align: center;
    padding: 10px;
    color: #495057;
    transition: background-color 0.2s, color 0.2s;
}

.nav-link:hover {
    background-color: #e9ecef;
    color: #007bff;
    border-radius: 10%;
}

.material-symbols-rounded {
    font-size: 24px;
}
</style>
