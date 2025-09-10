<template>
    <MainLayout>
      <div class="chat-container">
        <div class="messages flex-1 overflow-y-auto p-4">
          <div 
            v-for="(message, index) in messages" 
            :key="index"
            class="flex mb-2 " 
            :class="{ 'justify-end': message.sender === 'user' }"
          >
            <div 
              class="p-3 rounded-lg max-w-[70%]"
              :class="{ 
                'bg-red-600 text-white': message.sender === 'user',
                'bg-gray-300 text-gray-800': message.sender !== 'user' 
              }"
            >
              {{ message.text }} <br> - {{ message.sender }}
            </div>
          </div>
        </div>
        <InputMessage @send-message="handleSendMessage" class="flex-shrink-0"/>
      </div>
    </MainLayout>
  </template>
    
  <script setup>
  import InputMessage from '@/components/InputMessage.vue';
  import MainLayout from '@/layout/MainLayout.vue';
  import { ref } from 'vue';
    
  // Example with different senders for demonstration
  const messages = ref([
    { text: 'Olá, como posso ajudar?', sender: 'ai' },
    { text: 'Quero informações sobre meus investimentos.', sender: 'user' },
    { text: 'Certo, qual tipo de informação você precisa?', sender: 'ai' },
    { text: 'Gostaria de um extrato detalhado.', sender: 'user' },
  ]);
    
  const handleSendMessage = (messageData) => {
    if (messageData.files) {
      console.log('Files received:', messageData.files);
    }
    messages.value.push({
      text: messageData.message || 'Arquivo(s) enviado(s)',
      sender: 'user',
    });
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
  </style>