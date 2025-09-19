<template>
  <aside class="w-64 bg-white border-r border-gray-200 h-screen">
    <nav class="p-4">
      <ul class="space-y-2">
        <li key="reports">
          <a
            href="#"
            :class="[
              'flex items-center space-x-3 px-4 py-3 rounded-lg',
              isActive('/dashboard')
                ? 'bg-red-100 text-red-600 font-semibold border-l-4 border-red-500'
                : 'text-gray-600 hover:text-red-600',
            ]"
            @click.prevent="goTo('/dashboard')"
          >
            <BarChart3
              class="w-5 h-5"
              :class="isActive('/dashboard') ? 'text-red-600' : 'text-gray-600 hover:text-red-600'"
            />
            <span>Relatórios</span>
          </a>
        </li>
        <li key="chat">
          <a
            href="#"
            :class="[
              'flex items-center space-x-3 px-4 py-3 rounded-lg',
              isActive('/chat')
                ? 'bg-red-100 text-red-600 font-semibold border-l-4 border-red-500'
                : 'text-gray-600 hover:text-red-600',
            ]"
            @click.prevent="goTo('/chat')"
          >
            <MessageCircle
              class="w-5 h-5"
              :class="isActive('/chat') ? 'text-red-600' : 'text-gray-600 hover:text-red-600'"
            />
            <span>Chat</span>
          </a>
        </li>
        <li key="settings">
          <a
            href="#"
            :class="[
              'flex items-center space-x-3 px-4 py-3 rounded-lg',
              isActive('/config')
                ? 'bg-red-100 text-red-600 font-semibold border-l-4 border-red-500'
                : 'text-gray-600 hover:text-red-600',
            ]"
            @click.prevent="goTo('/config')"
          >
            <Settings
              class="w-5 h-5"
              :class="isActive('/config') ? 'text-red-600' : 'text-gray-600 hover:text-red-600'"
            />
            <span>Configurações</span>
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue';
import { BarChart3, Settings, MessageCircle } from "lucide-vue-next";
import { useGoTo } from '../composables/Utils'; // Ajuste o caminho se necessário

// 3. Rota inicial definida como '/dashboard'
const activeRoute = ref('/dashboard');

const goTo = (path) => {
  useGoTo(path);
  activeRoute.value = path;
};

const isActive = (path) => {
  return activeRoute.value === path;
};
</script>