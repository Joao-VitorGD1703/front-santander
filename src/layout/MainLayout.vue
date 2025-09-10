<template>
    <div>
      <Header />
      <div class="w-full flex">
        <Sidebar/>
        <slot />
      </div>
    </div>
  </template>
  
  <script setup>
import Sidebar from '@/components/Sidebar.vue';
import Header from '../components/Header.vue';
  </script>
  
  