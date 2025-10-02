// src/composables/request.js

import axios from "axios";
import { clearFile } from "./fileStorage";
import { clearDashboard } from "./dashboardStorage.js";

// --- CONFIGURAÇÃO DA API E INSTRUÇÕES DO SISTEMA ---
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Corrigido: rota precisa ser v1beta
const API_URL = `/api/v1beta/models/gemini-pro-latest:generateContent?key=${API_KEY}`;

const PROMPT_INSTRUCOES_ANALISE = `
Você é um assistente de IA especialista em ciência de dados e análise financeira para o setor bancário. Seja objetivo e profissional.

---
**REGRAS E LIMITAÇÕES (GUARD RAILS):**
1.  **FOCO TOTAL:** Sua única função é analisar dados financeiros de empresas (PJ).
2.  **RECUSA OBRIGATÓRIA:** Recuse educadamente qualquer pergunta fora deste escopo (conhecimentos gerais, conversas casuais, etc).
3.  **EXEMPLO DE RECUSA:** "Como um assistente de análise financeira, meu foco é em dados de empresas. Não consigo ajudar com outros assuntos. Por favor, forneça os dados para que eu possa iniciar a análise."
---

**INSTRUÇÕES DE ANÁLISE:**
Sua análise se adapta automaticamente à estrutura dos dados fornecidos.

1.  **SE OS DADOS FOREM DE UMA ÚNICA EMPRESA (com colunas como 'data', 'tipo', 'valor', 'participante'):**
    * **OBJETIVO:** Gerar um relatório de **Perfil de Negócio**.
    * **TAREFAS:** Analise a saúde financeira, fluxo de caixa, sazonalidade e identifique os principais clientes e fornecedores.

2.  **SE OS DADOS FOREM DE UMA REDE DE EMPRESAS (com colunas como 'ID_PGTO', 'ID_RCBE', 'VL'):**
    * **OBJETIVO:** Gerar uma **Análise de Cadeia de Valor**.
    * **TAREFAS:** Mapeie as conexões da rede, identifique as empresas centrais (hubs) e avalie o risco do ecossistema.
---

Vá direto ao ponto e entregue a análise solicitada.
`;

// --- GERENCIAMENTO DO HISTÓRICO ---
function carregarHistorico() {
  try {
    const historicoSalvo = localStorage.getItem("chatHistory");
    return historicoSalvo ? JSON.parse(historicoSalvo) : [];
  } catch (e) {
    console.error("Erro ao carregar o histórico:", e);
    return [];
  }
}

function salvarHistorico(historico) {
  localStorage.setItem("chatHistory", JSON.stringify(historico));
}

// --- FUNÇÕES EXPORTADAS ---
export async function enviarDados(payload) {
  if (!API_KEY) {
    throw new Error(
      "Chave de API do Gemini não encontrada. Verifique seu arquivo .env."
    );
  }

  const historico = carregarHistorico();

  let promptUsuario =
    payload.pergunta ||
    "Analise os dados fornecidos e gere um relatório completo.";

  if (payload.dados_json) {
    const dadosParaAnalise = JSON.stringify(payload.dados_json, null, 2);
    promptUsuario = `
**Pergunta do Usuário:** "${promptUsuario}"

**Dados para Análise (enviados nesta mensagem):**
${dadosParaAnalise}
    `;
  }

  // Montamos o payload para a API do Gemini
  const geminiPayload = {
    contents: [
      { role: "user", parts: [{ text: PROMPT_INSTRUCOES_ANALISE }] },
      {
        role: "model",
        parts: [
          { text: "Entendido. Estou pronto para analisar os dados financeiros." },
        ],
      },
      ...historico,
      { role: "user", parts: [{ text: promptUsuario }] },
    ],
  };

  try {
    const resp = await axios.post(API_URL, geminiPayload, {
      headers: { "Content-Type": "application/json" },
    });

    const respostaIA =
      resp.data?.candidates?.[0]?.content?.parts?.[0]?.text || null;

    if (!respostaIA) {
      throw new Error("A API retornou uma resposta vazia ou em formato inesperado.");
    }

    const userDisplayMessage =
      payload.pergunta || "Análise do arquivo enviado";

    historico.push({ role: "user", parts: [{ text: userDisplayMessage }] });
    historico.push({ role: "model", parts: [{ text: respostaIA }] });

    salvarHistorico(historico);

    return respostaIA;
  } catch (error) {
    console.error(
      "Erro detalhado da API:",
      error.response?.data || error.message || error
    );
    throw new Error(
      "Falha na comunicação com a IA. Verifique o console para mais detalhes."
    );
  }
}

/**
 * Limpa todos os dados da sessão: histórico, arquivo e dashboard.
 */
export function limparConversa() {
  localStorage.removeItem("chatHistory");
  clearFile();
  clearDashboard();
  console.log("Todos os históricos (chat, arquivo e dashboard) foram limpos.");
}
