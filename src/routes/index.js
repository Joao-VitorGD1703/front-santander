import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL), // Especifica o modo de histórico
  scrollBehavior(to, from, savedPosition) {
    // Sempre rolar para o topo
    return { top: 0 };
  },
  routes: [
    // Rota para página não encontrada
    // { path: '/:pathMatch(.*)*', component: () => import('../views/Notfound.vue') },
    // Rotas definidas
    { path: '/', component: () => import('../views/Dasheboard.vue') },
    { path: '/dashboard', component: () => import('../views/Dasheboard.vue') },
    { path: '/chat', component: () => import('../views/Chat.vue') },

  ]
});

export default router;