// src/composables/dashboardStorage.js

const DASHBOARD_STORAGE_KEY = 'dashboardData';

/**
 * Salva os dados do dashboard no localStorage.
 * @param {object} dashboardData - O objeto JSON do dashboard.
 */
export function saveDashboard(dashboardData) {
  try {
    localStorage.setItem(DASHBOARD_STORAGE_KEY, JSON.stringify(dashboardData));
  } catch (error) {
    console.error("Erro ao salvar o dashboard no localStorage:", error);
  }
}

/**
 * Carrega os dados do dashboard do localStorage.
 * @returns {object|null} - Os dados do dashboard ou null se não houver.
 */
export function loadDashboard() {
  try {
    const storedData = localStorage.getItem(DASHBOARD_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error("Erro ao carregar o dashboard do localStorage:", error);
    return null;
  }
}

/**
 * Limpa os dados do dashboard do localStorage.
 */
export function clearDashboard() {
  localStorage.removeItem(DASHBOARD_STORAGE_KEY);
}