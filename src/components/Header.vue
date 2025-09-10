<script setup>
import { Search, Bell, User } from 'lucide-vue-next';
</script>

<template>
  <header class="bg-red-600 text-white h-20 px-6 py-4 flex items-center justify-between">
    <div class="flex items-center">
      <div class="flex items-center space-x-2">
        <div class="w-8 h-8 bg-white rounded flex items-center justify-center">
          <span class="text-red-600 font-bold">F</span>
        </div>
        <span class="font-bold text-lg">FinanceRisk</span>
      </div>
    </div>
    <div class="flex h-20 items-center space-x-4">
      <button class="p-2 hover:bg-red-700 rounded-full transition-colors">
        <Bell class="w-5 h-5" />
      </button>
      <button class="p-2 hover:bg-red-700 rounded-full transition-colors">
        <User class="w-5 h-5" />
      </button>
    </div>
  </header>
</template>

<style scoped>
/* Add any component-specific styles here */
</style>



