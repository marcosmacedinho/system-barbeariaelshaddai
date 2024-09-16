<!-- src/components/Sidebar.vue -->
<template>
    <div class="sidebar">
        <nav class="nav flex-column">
            <router-link to="/barber/schedule-manager" class="nav-link">
                <span class="material-symbols-rounded"> schedule </span>
            </router-link>
            <router-link to="/barber/available-dates" class="nav-link">
                <span class="material-symbols-rounded"> calendar_today </span>
            </router-link>
            <router-link to="/barber/clients" class="nav-link">
                <span class="material-symbols-rounded"> person </span>
            </router-link>
            <router-link to="/barber/appointments" class="nav-link">
                <span class="material-symbols-rounded"> event </span>
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
    box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 20px;
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
}

.material-symbols-rounded {
    font-size: 24px;
}
</style>
