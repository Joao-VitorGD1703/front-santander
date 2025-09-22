<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <Header />
    <div class="w-full flex flex-1 overflow-hidden">
      <Sidebar/>
      <main class="flex-1 overflow-y-auto p-6"> 
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
import Header from '../components/Header.vue';
</script>