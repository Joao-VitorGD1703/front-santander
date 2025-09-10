<template>
    <aside class="w-64 bg-white border-r border-gray-200 h-screen">
      <nav class="p-4">
        <ul class="space-y-2">
          <li key="chat ">
            <a
              href="#"
              class="flex items-center space-x-3 px-4 py-3 rounded-lg bg-red-100 text-red-600 font-semibold border-l-4 border-red-500"
            >
              <MessageCircle class="w-5 h-5 text-red-600" />
              <span>Chat</span>
            </a>
          </li>
          <li key="reports">
            <a
              href="#"
              class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:text-red-600"
            >
              <BarChart3 class="w-5 h-5 text-gray-600 hover:text-red-600" />
              <span>Relatórios</span>
            </a>
          </li>
          <li key="settings">
            <a
              href="#"
              class="flex items-center space-x-3 px-4 py-3 rounded-lg text-gray-600 hover:text-red-600"
            >
              <Settings class="w-5 h-5 text-gray-600 hover:text-red-600" />
              <span>Configurações</span>
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  </template>
  
  <script setup>
  import { BarChart3, FileText, Settings, MessageCircle } from "lucide-vue-next";
  </script>