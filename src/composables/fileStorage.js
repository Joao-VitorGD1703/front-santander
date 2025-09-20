// src/composables/fileStorage.js

const FILE_STORAGE_KEY = 'uploadedFileData';

/**
 * Salva os dados do arquivo no localStorage.
 * @param {object} jsonData - Os dados do arquivo em formato JSON.
 */
export function saveFile(jsonData) {
  try {
    localStorage.setItem(FILE_STORAGE_KEY, JSON.stringify(jsonData));
  } catch (error) {
    console.error("Erro ao salvar o arquivo no localStorage:", error);
  }
}

/**
 * Carrega os dados do arquivo do localStorage.
 * @returns {object|null} - Os dados do arquivo em JSON ou null se não houver.
 */
export function loadFile() {
  try {
    const storedData = localStorage.getItem(FILE_STORAGE_KEY);
    return storedData ? JSON.parse(storedData) : null;
  } catch (error) {
    console.error("Erro ao carregar o arquivo do localStorage:", error);
    return null;
  }
}

/**
 * Limpa os dados do arquivo do localStorage.
 */
export function clearFile() {
  localStorage.removeItem(FILE_STORAGE_KEY);
}