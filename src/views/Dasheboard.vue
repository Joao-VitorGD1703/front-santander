<template>
  <MainLayout>
    <div class="p-6 bg-gray-50 min-h-full w-full">

      <div v-if="!dashboardData && !isLoading && !errorMessage" class="text-center py-20">
        <h1 class="text-3xl font-bold mb-4">Dashboard de Análise Financeira com IA</h1>
        <p class="text-gray-600 mb-8">Insira um arquivo CSV para gerar um relatório completo e visualizações interativas.</p>
        <input type="file" @change="handleFileUpload" ref="fileInput" class="hidden" accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel">
        <button @click="triggerFileInput" class="bg-red-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-red-700 transition-colors">
          <svg class="inline-block w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
          </svg>
          Inserir CSV
        </button>
      </div>

      <div v-if="isLoading" class="text-center py-20">
        <h2 class="text-2xl font-semibold text-gray-700">Analisando dados e gerando seu dashboard...</h2>
        <p class="text-gray-500 mt-2">Isso pode levar alguns instantes.</p>
      </div>

      <div v-if="errorMessage" class="text-center py-20 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
        <strong class="font-bold">Ocorreu um erro:</strong>
        <span class="block sm:inline">{{ errorMessage }}</span>
        <button @click="resetState" class="mt-4 bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-800">Tentar Novamente</button>
      </div>

      <div v-if="dashboardData" class="animate-in fade-in duration-500">
        
        <div v-if="dashboardData.sumario" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-red-600 text-white p-6 rounded-lg shadow-lg">
            <h2 class="text-lg font-semibold">Faturamento</h2>
            <p class="text-3xl font-bold">{{ dashboardData.sumario.faturamento ?? '-' }}</p>
          </div>
          <div class="bg-red-600 text-white p-6 rounded-lg shadow-lg">
            <h2 class="text-lg font-semibold">Lucros</h2>
            <p class="text-3xl font-bold">{{ dashboardData.sumario.lucros ?? '-' }}</p>
          </div>
          <div class="bg-red-600 text-white p-6 rounded-lg shadow-lg">
            <h2 class="text-lg font-semibold">Principal Risco</h2>
            <p class="text-3xl font-bold">{{ dashboardData.sumario.riscos ?? '-' }}</p>
          </div>
        </div>

        <div class="bg-white p-4 rounded-lg shadow-md mb-6 flex justify-between items-center">
          <h3 class="text-xl font-bold text-gray-700">{{ dashboardData.nome_empresa ?? 'Empresa Analisada' }}</h3>
          <div>
            <button @click="handleDownloadCSV" class="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition-colors">
              Download CSV Original
            </button>
            <button @click="resetState" class="bg-gray-800 text-white font-bold py-2 px-4 rounded hover:bg-gray-700 ml-4">
              Analisar Novo CSV
            </button>
          </div>
        </div>

        <div v-if="dashboardData.graficos" class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div v-for="(grafico, index) in dashboardData.graficos" :key="index" class="bg-white p-4 rounded-lg shadow-md">
            <h3 class="font-bold text-lg mb-2 text-gray-700">{{ grafico.titulo }}</h3>
            <apexchart width="100%" height="350" :options="grafico.config_apexchart" :series="grafico.config_apexchart.series"></apexchart>
          </div>
        </div>
        
        <div v-if="dashboardData.relatorio_texto" class="bg-white p-6 rounded-lg shadow-md">
          <div class="prose max-w-none" v-html="relatorioHtml"></div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { marked } from 'marked';
import * as XLSX from "xlsx";
import { gerarDadosDashboard } from '@/composables/request2.js';
import { limparConversa } from '@/composables/request.js';
import { saveFile, loadFile } from '@/composables/fileStorage.js';
import { saveDashboard, loadDashboard } from '@/composables/dashboardStorage.js';
import MainLayout from '@/layout/MainLayout.vue';
import VueApexCharts from 'vue3-apexcharts';

const apexchart = VueApexCharts;
const fileInput = ref(null);
const isLoading = ref(false);
const dashboardData = ref(null);
const errorMessage = ref(null);
const originalJsonData = ref(null);

onMounted(() => {
  const storedDashboard = loadDashboard();
  if (storedDashboard) {
    dashboardData.value = storedDashboard;
    originalJsonData.value = loadFile();
  }
});

const triggerFileInput = () => { fileInput.value.click(); };

const processData = async (jsonData) => {
  isLoading.value = true;
  errorMessage.value = null;
  try {
    originalJsonData.value = jsonData;
    const generatedData = await gerarDadosDashboard(jsonData);
    dashboardData.value = generatedData;
    saveFile(jsonData); 
    saveDashboard(generatedData);
  } catch (error) {
    console.error("Erro no processo de geração do dashboard:", error);
    errorMessage.value = error.message || "Não foi possível processar os dados.";
    limparConversa();
  } finally {
    isLoading.value = false;
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  resetState();
  try {
    const data = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
    const workbook = XLSX.read(data, { type: "array" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    await processData(jsonData);
  } catch (error) {
    errorMessage.value = error.message || "Não foi possível processar o arquivo.";
  } finally {
    if (fileInput.value) fileInput.value.value = '';
  }
};

const relatorioHtml = computed(() => {
  return dashboardData.value?.relatorio_texto ? marked.parse(dashboardData.value.relatorio_texto) : '';
});

const resetState = () => {
  dashboardData.value = null;
  errorMessage.value = null;
  isLoading.value = false;
  originalJsonData.value = null; 
  limparConversa();
};

function jsonToCsv(jsonArray) {
  if (!jsonArray || jsonArray.length === 0) return "";
  const headers = Object.keys(jsonArray[0]);
  const csvRows = [headers.join(',')];
  for (const row of jsonArray) {
    const values = headers.map(header => `"${(''+(row[header]||'')).replace(/"/g,'""')}"`);
    csvRows.push(values.join(','));
  }
  return csvRows.join('\n');
}

const handleDownloadCSV = () => {
  if (!originalJsonData.value) { return; }
  const csvString = jsonToCsv(originalJsonData.value);
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `dados_originais.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>