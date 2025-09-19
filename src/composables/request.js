// src/composables/request.js

import axios from 'axios';

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

/**
 * Carrega o histórico da conversa do localStorage.
 * @returns {Array} O histórico da conversa.
 */
function carregarHistorico() {
    try {
        const historicoSalvo = localStorage.getItem('chatHistory');
        return historicoSalvo ? JSON.parse(historicoSalvo) : [];
    } catch (e) {
        console.error("Erro ao carregar o histórico:", e);
        return []; // Retorna um array vazio em caso de erro
    }
}

/**
 * Salva o histórico da conversa no localStorage.
 * @param {Array} historico - O histórico da conversa a ser salvo.
 */
function salvarHistorico(historico) {
    localStorage.setItem('chatHistory', JSON.stringify(historico));
}

// --- FUNÇÕES EXPORTADAS ---

/**
 * Envia a pergunta do usuário e os dados para a API do Gemini, gerenciando o histórico da conversa.
 * @param {object} payload - O objeto contendo a pergunta e os dados. Ex: { pergunta: string, dados_json: object|null }
 * @returns {Promise<string>} - A resposta de texto da IA.
 */
export async function enviarDados(payload) {
    if (!API_KEY) {
        throw new Error("Chave de API do Gemini não encontrada. Verifique seu arquivo .env.");
    }

    // 1. Carrega o histórico atual
    const historico = carregarHistorico();

    // 2. Monta o prompt do usuário para esta rodada
    let promptDoUsuario = payload.pergunta || 'Analise os dados fornecidos.';
    if (payload.dados_json) {
        const dadosParaAnalise = JSON.stringify(payload.dados_json, null, 2);
        promptDoUsuario = `
            **Pergunta do Usuário:** "${promptDoUsuario}"
            **Dados para Análise (enviados nesta mensagem):**
            \`\`\`json
            ${dadosParaAnalise}
            \`\`\`
        `;
    }

    // 3. Adiciona a nova mensagem do usuário ao histórico (faz o "push")
    historico.push({ role: 'user', parts: [{ text: promptDoUsuario }] });

    // 4. Prepara o payload final para a API
    const geminiPayload = {
        contents: historico,
        systemInstruction: {
            parts: [{ text: PROMPT_INSTRUCOES_ANALISE }]
        }
    };

    try {
        // 5. Envia a requisição
        const resp = await axios.post(API_URL, geminiPayload);
        const respostaIA = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!respostaIA) {
            throw new Error("A API retornou uma resposta em formato inesperado.");
        }

        // 6. Adiciona a resposta da IA ao histórico
        historico.push({ role: 'model', parts: [{ text: respostaIA }] });

        // 7. Salva o histórico atualizado
        salvarHistorico(historico);

        return respostaIA;

    } catch (error) {
        // Em caso de erro, remove a última pergunta do usuário para não poluir o histórico
        historico.pop(); 
        console.error("Erro detalhado da API:", error.response?.data || error.message);
        throw new Error("Falha na comunicação com a IA.");
    }
}

/**
 * Limpa o histórico da conversa no estado e no localStorage.
 */
export function limparConversa() {
    localStorage.removeItem('chatHistory');
    console.log("Histórico da conversa foi limpo.");
}

// src/composables/request.js

// ... (todo o resto do seu código)

