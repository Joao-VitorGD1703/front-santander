<script setup>
import { ref } from 'vue';
import { Send, Paperclip } from 'lucide-vue-next';

const message = ref('');
const fileInputRef = ref(null);
const emit = defineEmits(['send-message']);

const handleSend = () => {
  if (message.value.trim()) {
    emit('send-message', { message: message.value });
    message.value = '';
  }
};

const handleKeyPress = (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSend();
  }
};

const handleFileClick = () => {
  fileInputRef.value.click();
};

const handleFileChange = (e) => {
  const files = e.target.files;
  if (files && files.length > 0) {
    emit('send-message', { message: message.value || 'Arquivos enviados', files: files });
    message.value = '';
    e.target.value = '';
  }
};
</script>

<template>
  <div class="input-message">
    <div class="flex items-end space-x-2 w-full">
      <div class="flex-1 relative">
        <textarea
          v-model="message"
          @keypress="handleKeyPress"
          placeholder="Digite sua mensagem..."
          rows="1"
          class="resize-none w-full min-h-[50px] max-h-[200px] border border-gray-300 rounded-2xl p-4 pr-10 focus:outline-none focus:border-red-500 overflow-y-auto"
        ></textarea>
        <button
          type="button"
          @click="handleFileClick"
          class="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-2"
        >
          <Paperclip class="h-5 w-5" />
        </button>
        <input
          ref="fileInputRef"
          type="file"
          multiple
          @change="handleFileChange"
          class="hidden"
          accept=".csv,.xlsx,.xls,.pdf,.txt"
        />
      </div>
      <button
        @click="handleSend"
        :disabled="!message.trim()"
        class="bg-red-600 hover:bg-red-700 text-white h-[45px] w-[45px] m-[auto] rounded-full flex items-center justify-center p-0 disabled:bg-red-600"
      >
        <Send class="h-5 w-5" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.input-message {
  padding: 10px;
  background-color: #ffffff;
  border-radius: 10px;
  display: flex;
  width: 50%;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
}
</style>