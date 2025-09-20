<template>
  <MainLayout>
    <div class="chat-container ">
   
      <div class="messages flex-1 overflow-y-auto p-4 space-y-4">
        <div
          v-for="(message, index) in messages"
          :key="index"
          class="flex items-end gap-2"
          :class="{ 'justify-end': message.sender === 'user' }"
        >
          <div v-if="message.sender !== 'user'" class="flex-shrink-0">
            <div class="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
              <Bot class="text-white w-5 h-5" />
            </div>
          </div>

          <div
            class="p-3 rounded-lg max-w-[70%] message-content"
             :class="{
              'bg-red-600 text-white order-2': message.sender === 'user',
              'bg-gray-200 text-gray-800': message.sender !== 'user',
              'prose': message.sender !== 'user' && !message.isLoading,
            }"
          >
            <div v-if="message.isLoading" class="flex items-center justify-center space-x-1 p-2">
              <div class="pulsing-dot"></div>
              <div class="pulsing-dot animation-delay-200"></div>
              <div class="pulsing-dot animation-delay-400"></div>
            </div>
             <div v-else v-html="formatMessage(message)"></div>
          </div>

          <div v-if="message.sender === 'user'" class="flex-shrink-0">
            <div class="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
              <User class="text-white w-5 h-5" />
            </div>
          </div>
        </div>
      </div>
      <InputMessage @send-message="handleSendMessage" class="flex-shrink-0" />
    </div>
  </MainLayout>
</template>

<script setup>
import { TrashIcon, User, Bot } from "lucide-vue-next";
import InputMessage from "@/components/InputMessage.vue";
import MainLayout from "@/layout/MainLayout.vue";
import { ref, nextTick, onMounted } from "vue";
import { marked } from 'marked';
import * as XLSX from "xlsx";
import { enviarDados, limparConversa } from '@/composables/request.js';
import { saveFile, loadFile } from '@/composables/fileStorage.js';


const uploadedFileData = ref(null);
const messages = ref([]); 
const isLoading = ref(false);

onMounted(() => {
  const historicoSalvo = JSON.parse(localStorage.getItem('chatHistory')) || [];
  const storedFile = loadFile();
  
  if (historicoSalvo.length > 0) {
    messages.value = historicoSalvo.map(item => ({
      text: item.parts[0].text,
      sender: item.role === 'user' ? 'user' : 'IA'
    }));
  } else {
    messages.value = [
      { text: "Olá! Posso analisar um arquivo para você ou responder a uma pergunta.", sender: "IA" }
    ];
  }

  if(storedFile){
    uploadedFileData.value = storedFile;
    messages.value.push({ text: "Notei que você já enviou um arquivo. O que você gostaria de saber sobre ele?", sender: "IA" });
  }
  
  scrollToBottom();
});

const handleNewChat = () => {
  limparConversa(); 
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

const streamResponseOnScreen = (fullText, targetMessage, speed = 20) => {
  return new Promise((resolve) => {
    if (!fullText || !fullText.trim()) {
      targetMessage.text = "Não foi possível obter uma resposta. Tente novamente.";
      resolve();
      return;
    }

    let currentIndex = 0;
    targetMessage.text = '';

    const intervalId = setInterval(() => {
      if (currentIndex < fullText.length) {
        targetMessage.text += fullText[currentIndex];
        scrollToBottom();
        currentIndex++;
      } else {
        clearInterval(intervalId);
        resolve();
      }
    }, speed);
  });
};

const handleSendMessage = async (messageData) => {
  if (isLoading.value) return;

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

      saveFile(jsonData);
      uploadedFileData.value = jsonData;
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
  
  messages.value.push({ text: "", sender: "IA", isLoading: true });
  const aiMessageIndex = messages.value.length - 1;
  scrollToBottom();

  const payload = {
    pergunta: userInstruction,
    dados_json: uploadedFileData.value,
  };

  try {
    const responseText = await enviarDados(payload); 
    console.log("Resposta da API:", responseText);
    
    const targetMessage = messages.value[aiMessageIndex];
    
    targetMessage.isLoading = false;
    await streamResponseOnScreen(responseText, targetMessage);

  } catch (error) {
    const targetMessage = messages.value[aiMessageIndex];
    targetMessage.isLoading = false;
    targetMessage.text = "Desculpe, ocorreu um erro ao processar sua solicitação.";
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
  width: 100%;
  margin: 0 auto;
  height: 82vh;
}

.pulsing-dot {
  width: 8px;
  height: 8px;
  background-color: #6b7280;
  border-radius: 50%;
  animation: pulse 1.4s infinite ease-in-out both;
}

.animation-delay-200 {
  animation-delay: 0.2s;
}

.animation-delay-400 {
  animation-delay: 0.4s;
}

@keyframes pulse {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1.0);
  }
}

:deep(.prose) {
  max-width: none;
}

:deep(.prose pre) {
  background-color: #1f2937;
  color: #d1d5db;
  padding: 1rem;
  border-radius: 0.5rem;
}

:deep(.prose ul > li::before) {
    background-color: #4b5563;
}
</style>