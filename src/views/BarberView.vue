<template>
  <div class="container mt-5">
    <h1 class="mb-4 text-center text-primary">Gerenciamento do Barbeiro</h1>

    <!-- Abas de navegação -->
    <ul class="nav nav-tabs mb-4" id="barberTabs" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link active" id="available-times-tab" data-bs-toggle="tab" data-bs-target="#available-times"
          type="button" role="tab" aria-controls="available-times" aria-selected="true">
          Horários Disponíveis
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="available-dates-tab" data-bs-toggle="tab" data-bs-target="#available-dates"
          type="button" role="tab" aria-controls="available-dates" aria-selected="false">
          Datas Disponíveis
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="clients-tab" data-bs-toggle="tab" data-bs-target="#clients" type="button"
          role="tab" aria-controls="clients" aria-selected="false">
          Clientes
        </button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" id="appointments-tab" data-bs-toggle="tab" data-bs-target="#appointments" type="button"
          role="tab" aria-controls="appointments" aria-selected="false">
          Agendamentos
        </button>
      </li>
    </ul>

    <!-- Conteúdo das abas -->
    <div class="tab-content" id="barberTabsContent">
      <div class="tab-pane fade show active" id="available-times" role="tabpanel" aria-labelledby="available-times-tab">
        <AvailableTimes />
      </div>
      <div class="tab-pane fade" id="available-dates" role="tabpanel" aria-labelledby="available-dates-tab">
        <AvailableDates />
      </div>
      <div class="tab-pane fade" id="clients" role="tabpanel" aria-labelledby="clients-tab">
        <ClientList />
      </div>
      <div class="tab-pane fade" id="appointments" role="tabpanel" aria-labelledby="appointments-tab">
        <ScheduleView />
      </div>
    </div>
  </div>
</template>

<script setup>
import AvailableTimes from '@/components/AvailableTimes.vue';
import AvailableDates from '@/components/AvailableDates.vue';
import ClientList from '@/components/ClientList.vue';
import ScheduleView from '@/components/ScheduleView.vue';
</script>

<style scoped>
/* Estilos gerais */
.container {
  max-width: 90%;
  margin: 0 auto;
}

/* Estilo para as abas */
.nav-tabs {
  border-bottom: 2px solid #dee2e6; /* Borda inferior mais forte para destacar as abas */
}

.nav-tabs .nav-item {
  flex: 1; /* Faz com que cada aba ocupe a mesma largura */
}

.nav-tabs .nav-link {
  border-radius: 0;
  border: none; /* Remove a borda padrão */
  font-weight: 500;
  padding: 0.75rem 1.25rem;
  color: #495057;
  transition: color 0.3s, background-color 0.3s;
}

.nav-tabs .nav-link.active {
  color: #fff;
  background-color: #007bff; /* Cor de fundo da aba ativa */
  border-color: #007bff; /* Borda da aba ativa */
}

/* Espaçamento entre as abas e o conteúdo */
.tab-content {
  border: 1px solid #dee2e6;
  border-top: 0;
  padding: 1rem;
  border-radius: 0.25rem;
  background-color: #fff;
}

/* Tamanho mínimo das abas */
.tab-pane {
  min-height: 300px; /* Ajustar conforme necessário */
}

/* Título */
h1 {
  font-size: 1.75rem;
  font-weight: 600;
  color: #333;
}

/* Responsividade */
@media (max-width: 768px) {
  .container {
    padding: 0 10px;
  }

  .nav-tabs .nav-link {
    font-size: 0.875rem; /* Reduz o tamanho da fonte das abas em telas pequenas */
    padding: 0.5rem 1rem;
  }

  .tab-content {
    padding: 0.75rem;
  }

  h1 {
    font-size: 1.5rem; /* Reduz o tamanho do título em telas pequenas */
  }
}
</style>
