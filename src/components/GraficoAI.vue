// src/components/GraficoIA.vue (Versão Simplificada)

<template>
  <div class="bg-white p-4 rounded-lg shadow-md">
    <h3 class="font-bold text-lg mb-2 text-gray-700">{{ titulo }}</h3>
    <apexchart
      v-if="config && config.series"
      width="100%"
      height="350"
      :options="config"
      :series="config.series"
    ></apexchart>
  </div>
</template>

<script setup>
// Não é mais necessário importar VueApexCharts aqui!

// Define as props que o componente receberá
defineProps({
  titulo: {
    type: String,
    required: true,
  },
  config: {
    type: Object,
    required: true,
  }
});
</script>