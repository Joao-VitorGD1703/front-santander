// src/composables/request2.js
import axios from "axios";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
// Usando a URL e modelo que você validou com o curl
const API_URL = `/api/v1beta/models/gemini-pro-latest:generateContent?key=${API_KEY}`;

const PROMPT_INSTRUCOES_DASHBOARD =  `
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
 * Converte um objeto onde algumas chaves são strings de funções JavaScript
 * em um objeto com funções reais e executáveis.
 * @param {object} obj O objeto a ser percorrido.
 * @returns {object} O objeto com as funções convertidas.
 */
function converterFuncoesApex(obj) {
  if (Array.isArray(obj)) {
    return obj.map(converterFuncoesApex);
  } else if (obj && typeof obj === "object") {
    const novoObj = {};
    for (const key in obj) {
      if (typeof obj[key] === "string" && obj[key].trim().startsWith("function")) {
        try {
          // Usa o construtor Function para converter a string em uma função real.
          // eslint-disable-next-line no-new-func
          novoObj[key] = new Function("return " + obj[key])();
        } catch (e) {
          console.error(`Erro ao converter a função da chave "${key}":`, e);
          novoObj[key] = obj[key]; // Mantém a string original em caso de erro
        }
      } else {
        novoObj[key] = converterFuncoesApex(obj[key]);
      }
    }
    return novoObj;
  }
  return obj;
}

/**
 * Extrai um objeto JS de uma string de texto, mesmo que seja JSON inválido
 * por conter funções.
 * @param {string} texto - A string retornada pela API.
 * @returns {object} - O objeto JavaScript.
 */
function extrairObjetoJS(texto) {
  const jsonMatch = texto.match(/```json\s*([\s\S]*?)\s*```/);
  let textoParaParse = jsonMatch ? jsonMatch[1] : texto;

  try {
    // Esta é a mágica: em vez de JSON.parse, usamos new Function para
    // interpretar a string como um objeto JavaScript literal, que permite funções.
    return new Function("return " + textoParaParse)();
  } catch (error) {
    console.error("Falha ao fazer o parse do objeto JS:", textoParaParse);
    throw new Error("A IA retornou um objeto em formato inválido.");
  }
}

export async function gerarDadosDashboard(dadosJson) {
  if (!API_KEY) {
    throw new Error("Chave de API do Gemini não encontrada.");
  }

  const promptCompletoParaIA = `
${PROMPT_INSTRUCOES_DASHBOARD}

---
**Dados para Análise (fornecidos pelo usuário):**
${JSON.stringify(dadosJson, null, 2)}
  `;

  const geminiPayload = {
    contents: [{ role: "user", parts: [{ text: promptCompletoParaIA }] }],
  };

  try {
    const resp = await axios.post(API_URL, geminiPayload);
    const respostaIA = resp.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!respostaIA) {
      throw new Error("A API retornou uma resposta vazia ou malformada.");
    }

    console.log("Resposta bruta da IA:", respostaIA);

    // 1. Extrai o objeto JavaScript da string
    const dashboardDataRaw = extrairObjetoJS(respostaIA);

    // 2. Converte as strings de funções para funções reais do ApexCharts
    const dashboardDataFinal = converterFuncoesApex(dashboardDataRaw);

    return dashboardDataFinal;
  } catch (error) {
    console.error("Erro detalhado:", error);
    throw new Error("Falha na comunicação ou no processamento da resposta da IA.");
  }
}