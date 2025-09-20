<template>
  <aside
    class="w-64 bg-white border-r border-gray-200 h-screen pb-20 flex flex-col"
  >
    <nav class="p-4 flex-grow">
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
              :class="
                isActive('/dashboard')
                  ? 'text-red-600'
                  : 'text-gray-600 hover:text-red-600'
              "
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
              :class="
                isActive('/chat')
                  ? 'text-red-600'
                  : 'text-gray-600 hover:text-red-600'
              "
            />
            <span>Chat</span>
          </a>
        </li>
      </ul>
    </nav>

    <div class="">
      <a
        href="#"
        :class="[
          'p-4 border-t border-gray-200 flex items-center w-full  h-30 space-x-3 px-4 py-3 ',
          isActive('/chat')
            ? 'bg-zinc-100 text-red-600 font-semibold '
            : 'text-gray-600 hover:text-red-600',
        ]"
        @click="handleNewChat"
      >
        <TrashIcon
          class="w-5 h-5"
          :class="
            isActive('/') ? 'text-red-600' : 'text-gray-600 hover:text-red-600'
          "
        />
        <span>Limpar Dados</span>
      </a>
    </div>
  </aside>
</template>

<script setup>
import { useRoute } from "vue-router";
import { BarChart3, Settings, MessageCircle, TrashIcon } from "lucide-vue-next";
import { useGoTo } from "../composables/Utils";
import { limparConversa } from "@/composables/request.js";

const route = useRoute();

const goTo = (path) => {
  useGoTo(path);
};

const handleNewChat = () => {
  limparConversa();
  window.location.reload();
};

const isActive = (path) => {
  if (path === "/dashboard" && route.path === "/") {
    return true;
  }
  return route.path === path;
};
</script>
