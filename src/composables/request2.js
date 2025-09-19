// src/composables/request.js

import axios from 'axios';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
// Em src/composables/request2.js

// Em src/composables/request2.js

const PROMPT_INSTRUCOES_DASHBOARD = `
Você é um assistente de IA especialista em ciência de dados e análise financeira. Sua tarefa é analisar um conjunto de dados financeiros (em JSON) de uma empresa e gerar um objeto JSON completo para popular um dashboard.

O JSON de saída DEVE ter EXATAMENTE a seguinte estrutura, com configurações ApexCharts VÁLIDAS:
{
  "nome_empresa": "O nome da empresa principal, se identificável nos dados, ou 'Empresa Analisada'",
  "sumario": {
    "faturamento": "Valor total de receitas, formatado como string. Ex: 'R$ 425.000,00'",
    "lucros": "Cálculo do (Receitas - Despesas), formatado como string. Ex: 'R$ 275.000,00'. Se não for possível calcular, use '-'",
    "riscos": "Uma palavra ou frase curta que resume o principal risco. Ex: 'Dependência de Clientes', 'Fluxo de Caixa', 'Concentração de Fornecedores'"
  },
  "graficos": [
    {
      "titulo": "Gráfico 1: Evolução de Receitas vs. Despesas",
      "config_apexchart": {
        "chart": { "type": "line", "height": 350 },
        "xaxis": { "categories": ["Jan", "Fev", "Mar", "Abr"] },
        "series": [
          { "name": "Receitas", "data": [30000, 40000, 45000, 50000] },
          { "name": "Despesas", "data": [20000, 22000, 23000, 28000] }
        ],
        "stroke": { "curve": "smooth" }
      }
    },
    {
      "titulo": "Gráfico 2: Distribuição de Receitas por Cliente",
      "config_apexchart": {
        "chart": { "type": "pie", "height": 350 },
        "labels": ["Cliente A", "Cliente B", "Cliente C"],
        "series": [44000, 55000, 13000]
      }
    },
    {
      "titulo": "Gráfico 3: Maiores Despesas por Categoria",
      "config_apexchart": {
        "chart": { "type": "bar", "height": 350 },
        "plotOptions": { "bar": { "horizontal": true } },
        "xaxis": { "categories": ["Fornecedores", "Salários", "Marketing"] },
        "series": [{ "name": "Despesa", "data": [4300, 4480, 4700] }]
      }
    }
  ],
  "relatorio_texto": "Um relatório de análise financeira completo, formatado em Markdown, seguindo a estrutura e o tom do exemplo fornecido."
}

**Exemplo do Estilo do Relatório (use este formato em Markdown):**
"""
### Relatório de Análise Financeira - Cenário de Fluxo de Caixa
Este relatório analisa o fluxo de caixa da empresa com base nos dados fornecidos...
"""

**REGRAS ESTRITAS:**
1.  Sua resposta deve ser APENAS o objeto JSON.
2.  NÃO inclua markdown como \`\`\`json no início ou fim da sua resposta.
3.  NÃO inclua nenhum texto explicativo antes ou depois do objeto JSON.
4.  Garanta que o JSON seja estritamente válido, sem vírgulas extras no final de listas ou objetos e com todas as strings entre aspas duplas.
`;

/**
 * Função especializada para chamar a IA e gerar o JSON completo do dashboard.
 * @param {object} dadosJson - Os dados extraídos do CSV do usuário.
 * @returns {Promise<object>} - O objeto JSON com todos os dados do dashboard.
 */
// Em src/composables/request2.js

export async function gerarDadosDashboard(dadosJson) {
  if (!API_KEY) {
      throw new Error("Chave de API do Gemini não encontrada. Verifique seu arquivo .env.");
  }
  
  const promptParaIA = `
      **Dados para Análise (JSON):**
      \`\`\`json
      ${JSON.stringify(dadosJson, null, 2)}
      \`\`\`
  `;

  const geminiPayload = {
      contents: [{ role: 'user', parts: [{ text: promptParaIA }] }],
      systemInstruction: {
          parts: [{ text: PROMPT_INSTRUCOES_DASHBOARD }]
      },
      generationConfig: {
          responseMimeType: "application/json",
      }
  };

  try {
      const resp = await axios.post(API_URL, geminiPayload);
      let respostaIA = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!respostaIA) {
          throw new Error("A API retornou uma resposta vazia.");
      }
      
      // --- ADIÇÕES PARA ROBUSTEZ ---
      // 1. Log para depuração: veja exatamente o que a IA retornou
      console.log("Raw API Response:", respostaIA);

      // 2. Limpeza da string: remove os blocos de código ```json ... ``` se existirem
      const jsonMatch = respostaIA.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
          respostaIA = jsonMatch[1];
      }

      // 3. Tenta fazer o parse da string limpa
      return JSON.parse(respostaIA);

  } catch (error) {
      // Loga o erro de parse ou de rede
      console.error("Erro detalhado da API ao gerar dashboard:", error.message);
      // Lança um novo erro mais amigável para a interface
      throw new Error("Falha na comunicação com a IA para gerar o dashboard.");
  }
}