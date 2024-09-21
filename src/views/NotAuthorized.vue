<template>
    <div class="not-authorized">
      <div class="container text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="100"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="icon"
        >
          <path d="M10 12h4m-2-2v4M20 12c0-5.5-4.5-10-10-10S0 6.5 0 12h2c0-4.4 3.6-8 8-8s8 3.6 8 8h2z" />
          <path d="M22 12c0 5.5-4.5 10-10 10S2 17.5 2 12h2c0 4.4 3.6 8 8 8s8-3.6 8-8h2z" />
        </svg>
        <h1 class="display-4">Acesso Negado</h1>
        <p class="lead">Você não tem permissão para acessar esta página.</p>
        <router-link to="/" class="btn btn-primary">Voltar para a Página Inicial</router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  // Aqui você pode adicionar lógica adicional se necessário
  </script>
  
  <style scoped>
  .not-authorized {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }
  
  .container {
    max-width: 600px;
  }
  
  .icon {
    margin-bottom: 20px;
    color: #dc3545; /* Cor para o ícone */
  }
  
  h1 {
    color: #dc3545; /* Cor para mensagem de erro */
  }
  
  .btn {
    margin-top: 20px;
  }
  </style>
  