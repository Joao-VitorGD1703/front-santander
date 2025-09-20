<template>
  <div class="h-screen flex flex-col bg-gray-50">
    <Header />
    <div class="w-full flex flex-1 overflow-hidden">
      <Sidebar/>
      <slot />
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue';
import Header from '../components/Header.vue';
</script>