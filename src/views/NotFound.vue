<template>
    <div class="d-flex flex-column justify-content-center align-items-center p-4 container">
        <img src="@/assets/imgs/404.svg" class="img-notfound" alt="Página não encontrada">
        <p class="small text-center txt-color-sec my-2 fs-md-4 fs-5">
            Acho que você se perdeu, clique no botão para voltar ao início!
        </p>
        <RouterLink to="/login" class="btn btn-sm btn-outline-secondary d-flex align-items-center">
            <span class="material-symbols-rounded fs-3 me-1">home</span>
            Voltar à Civilização
        </RouterLink>
    </div>
</template>

<style scoped>
.img-notfound {
    width: 360px;
    height: auto;
}

.container {
    height: 100vh;
}

.txt-color-sec {
    color: #6c757d;
}

@media (max-width:768px) {
    .img-notfound {
        width: 260px;
    }

    .container {
        height: 80vh;
    }
}
</style>