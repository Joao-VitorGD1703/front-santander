<template>
  <MainLayout>
    <div class="chat-container">
      <div class="w-full items-right flex justify-end ">
        <button         
          @click="handleNewChat"
            class=
              "flex items-center space-x-3 px-4 py-3 w-12 m-6  rounded-lg bg-red-100 text-red-600 font-semibold border"
          >
            <TrashIcon
              class="w-5 h-5"
            />
      </button>
      </div>
      
      <div class="messages flex-1 overflow-y-auto p-4">
         
     
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="flex mb-2"
          :class="{ 'justify-end': message.sender === 'user' }"
        >
          <div
            class="p-3 rounded-lg max-w-[70%] message-content"
            :class="{
              'bg-red-600 text-white': message.sender === 'user',
              'bg-gray-300 text-gray-800': message.sender !== 'user',
            }"
            v-html="formatMessage(message)"
          >
          </div>
        </div>
      </div>
      <InputMessage @send-message="handleSendMessage" class="flex-shrink-0" />
    </div>
  </MainLayout>
</template>

<script setup>
import { TrashIcon } from "lucide-vue-next";
import InputMessage from "@/components/InputMessage.vue";
import MainLayout from "@/layout/MainLayout.vue";
import { ref, nextTick, onMounted } from "vue";
import { marked } from 'marked';
import * as XLSX from "xlsx";
import { enviarDados, limparConversa } from '@/composables/request.js';


const uploadedFileData = ref(null);
// --- ALTERAÇÃO MESCLADA: Inicia o array de mensagens como vazio ---
const messages = ref([]); 
const isLoading = ref(false);

// --- ALTERAÇÃO MESCLADA: Lógica aprimorada para carregar o histórico ---
// Carrega o histórico salvo quando o componente é montado
onMounted(() => {
  const historicoSalvo = JSON.parse(localStorage.getItem('chatHistory')) || [];
  
  if (historicoSalvo.length > 0) {
    // Se houver histórico, mapeia para o formato de exibição
    messages.value = historicoSalvo.map(item => ({
      text: item.parts[0].text,
      sender: item.role === 'user' ? 'user' : 'IA'
    }));
  } else {
    // Se não houver histórico, adiciona apenas a mensagem inicial padrão
    messages.value = [
      { text: "Olá! Posso analisar um arquivo para você ou responder a uma pergunta.", sender: "IA" }
    ];
  }
  scrollToBottom();
});

// Dentro do <script setup> do seu Chat.vue

const handleNewChat = () => {
  // 1. Chama a função para limpar o localStorage
  limparConversa(); 

  // 2. Recarrega a página para reiniciar o estado do chat.
  // Esta é a maneira mais simples e garantida de começar do zero.
  window.location.reload(); 
};
const formatMessage = (message) => {
  const textToRender = message.text || "";
  if (message.sender === 'IA') {
    return marked.parse(textToRender);
  }
  return textToRender.replace(/\n/g, '<br>');
};

const scrollToBottom = () => {
  nextTick(() => {
    const container = document.querySelector('.messages');
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  });
};

const streamResponseOnScreen = (fullText, targetMessage, speed = 30) => {
  return new Promise((resolve) => {
    const words = fullText.split(' ');
    let currentIndex = 0;
    targetMessage.text = ''; // Limpa o texto "Analisando..."

    const intervalId = setInterval(() => {
      if (currentIndex < words.length) {
        targetMessage.text += words[currentIndex] + ' ';
        scrollToBottom();
        currentIndex++;
      } else {
        clearInterval(intervalId);
        resolve();
      }
    }, speed);
  });
};

// Sua função handleSendMessage já está perfeita e não precisa de alterações.
// Ela já chama o `enviarDados` que agora gerencia o histórico automaticamente.
const handleSendMessage = async (messageData) => {
  if (isLoading.value) return;

  // Lógica de upload de arquivo (com tratamento de erro melhorado)
  if (messageData.files && messageData.files.length > 0) {
    const file = messageData.files[0];
    messages.value.push({ text: `Arquivo "${file.name}" recebido. Processando...`, sender: "user" });
    try {
      const fileData = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      });
      const workbook = XLSX.read(fileData, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      if (jsonData.length === 0) {
        throw new Error("O arquivo parece estar vazio ou em um formato não suportado.");
      }

      uploadedFileData.value = jsonData;
      console.log(uploadedFileData.value)
      messages.value.push({ text: `O arquivo "${file.name}" foi carregado com sucesso! Agora, me diga o que você gostaria de fazer com esses dados.`, sender: "IA" });
    
    } catch (error) {
      console.error("Erro detalhado ao processar o arquivo:", error);
      messages.value.push({ text: `Ocorreu um erro ao ler o arquivo "${file.name}". Por favor, verifique se o arquivo não está corrompido e se o formato (CSV/XLSX) está correto.`, sender: "IA" });
      uploadedFileData.value = null;
    }
    return;
  }

  const userInstruction = messageData.message?.trim();
  if (!userInstruction && !uploadedFileData.value) return;

  isLoading.value = true;
  
  if (userInstruction) {
    messages.value.push({ text: userInstruction, sender: "user" });
  } else {
    messages.value.push({ text: "Analisando arquivo...", sender: "user" });
  }
  
  const aiMessageIndex = messages.value.length;
  messages.value.push({ text: "Analisando...", sender: "IA" });
  scrollToBottom();

  const payload = {
    pergunta: userInstruction,
    dados_json: uploadedFileData.value,
  };

  try {
    // ESTA CHAMADA ESTÁ CORRETA e usa o novo `request.js`
    const responseText = await enviarDados(payload); 
    console.log("Resposta da API:", responseText);
    const targetMessage = messages.value[aiMessageIndex];
    await streamResponseOnScreen(responseText, targetMessage);

    if (payload.dados_json) {
      uploadedFileData.value = null;
    }

  } catch (error) {
    messages.value[aiMessageIndex].text = "Desculpe, ocorreu um erro ao processar sua solicitação.";
  } finally {
    isLoading.value = false;
    scrollToBottom();
  }
};
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  /*border: 1px solid #ccc;*/
  width: 100%;
  margin: 0 auto;
  height: 82vh;
}

/* Seus estilos estão preservados */
.message-content ul, .message-content ol {
  padding-left: 20px;
  margin-top: 5px;
  margin-bottom: 5px;
}
.message-content a {
  color: #007bff;
  text-decoration: underline;
}
.message-content strong {
  font-weight: bold;
}
.message-content pre {
  background-color: #f0f0f0;
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>