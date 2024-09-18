<template>
    <div class="nothing-here-container">
        <div class="text-center">
            <div class="svg-placeholder">
                <img src="@/assets/imgs/nothing-here2.svg" alt="Nada por aqui" class="img-fluid" />
            </div>
            <h2 class="mt-3">Nada por aqui...</h2>
            <p class="text-muted">Parece que não há agendamentos feito no momento.</p>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.nothing-here-container {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    height: 70vh;
}

.svg-placeholder {
    max-width: 300px;
    /* Ajuste o tamanho do SVG */
    margin: 0 auto 20px;
}

.img-fluid {
    width: 100%;
    height: auto;
}

h2 {
    font-weight: bold;
    color: #495057;
}

.text-muted {
    color: #6c757d;
}

.btn {
    padding: 0.5rem 1rem;
    font-size: 1rem;
}

.material-symbols-rounded {
    font-size: 24px;
}

@media (max-width: 768px) {
    .nothing-here-container {
        height: 55vh;
    }
}
</style>