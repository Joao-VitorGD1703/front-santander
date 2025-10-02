import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Redireciona requisições de /api para a API do Gemini
      '/api': {
        target: 'https://generativelanguage.googleapis.com',
        changeOrigin: true,
        secure: false, // Pode ser útil em alguns ambientes
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api antes de enviar
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})