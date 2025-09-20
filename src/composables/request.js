// src/composables/request.js

import axios from 'axios';
import { clearFile } from './fileStorage';
import { clearDashboard } from './dashboardStorage.js'; // <-- ADICIONE ESTA LINHA

// --- CONFIGURAÇÃO DA API E INSTRUÇÕES DO SISTEMA ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

const PROMPT_INSTRUCOES_ANALISE = `
Você é um assistente de IA especialista em ciência de dados e análise financeira, atuando para o setor bancário.
**Objetivo Geral:** Sua função é analisar dados de empresas (clientes PJ) para gerar insights estratégicos sobre seu perfil de negócio e as dinâmicas de sua cadeia de valor. Você deve ser capaz de lidar com dois cenários de análise distintos, dependendo dos dados fornecidos.
// ... (resto das suas instruções do sistema)
---
**Cenário 2: Análise de Cadeias de Valor (Dados de uma rede de empresas)**
Se os dados fornecidos representarem uma REDE de pagamentos e recebimentos entre MÚLTIPLAS empresas, execute as seguintes tarefas:
1.  **Objetivo:** Analisar a saúde, a interdependência e os riscos do ecossistema formado por essas empresas.
2.  **Análise a ser Realizada:**
    * **Mapeamento de Relações:** Identifique as conexões mais críticas na rede e as empresas centrais (hubs).
    * **Análise de Risco Sistêmico:** Avalie a capacidade financeira geral da rede e identifique vulnerabilidades.
3.  **Resultado Esperado:** Produza um relatório sobre a cadeia de valor, destacando as empresas-chave, as relações importantes e uma avaliação de risco.
---
`;

// --- GERENCIAMENTO DO HISTÓRICO ---

function carregarHistorico() {
    try {
        const historicoSalvo = localStorage.getItem('chatHistory');
        return historicoSalvo ? JSON.parse(historicoSalvo) : [];
    } catch (e) {
        console.error("Erro ao carregar o histórico:", e);
        return [];
    }
}

function salvarHistorico(historico) {
    localStorage.setItem('chatHistory', JSON.stringify(historico));
}

// --- FUNÇÕES EXPORTADAS ---

export async function enviarDados(payload) {
    if (!API_KEY) {
        throw new Error("Chave de API do Gemini não encontrada. Verifique seu arquivo .env.");
    }

    const historico = carregarHistorico();

    let promptParaIA = payload.pergunta || 'Analise os dados fornecidos.';
    if (payload.dados_json) {
        const dadosParaAnalise = JSON.stringify(payload.dados_json, null, 2);
        promptParaIA = `
            **Pergunta do Usuário:** "${promptParaIA}"
            **Dados para Análise (enviados nesta mensagem):**
            \`\`\`json
            ${dadosParaAnalise}
            \`\`\`
        `;
    }
    const novaMensagemUsuarioParaAPI = { role: 'user', parts: [{ text: promptParaIA }] };

    const geminiPayload = {
        contents: [...historico, novaMensagemUsuarioParaAPI],
        systemInstruction: {
            parts: [{ text: PROMPT_INSTRUCOES_ANALISE }]
        }
    };

    try {
        const resp = await axios.post(API_URL, geminiPayload);
        const respostaIA = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!respostaIA) {
            throw new Error("A API retornou uma resposta em formato inesperado.");
        }

        const userDisplayMessage = payload.pergunta || 'Análise de arquivo';
        historico.push({ role: 'user', parts: [{ text: userDisplayMessage }] });
        historico.push({ role: 'model', parts: [{ text: respostaIA }] });

        salvarHistorico(historico);

        return respostaIA;

    } catch (error) {
        console.error("Erro detalhado da API:", error.response?.data || error.message);
        throw new Error("Falha na comunicação com a IA.");
    }
}

/**
 * Limpa todos os dados da sessão: histórico, arquivo e dashboard.
 */
export function limparConversa() {
    localStorage.removeItem('chatHistory');
    clearFile();
    clearDashboard(); // <-- ADICIONE ESTA LINHA
    console.log("Todos os históricos (chat, arquivo e dashboard) foram limpos.");
}