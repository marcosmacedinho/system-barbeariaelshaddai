// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue'; // Layout com cabeçalho
import NoHeaderLayout from '@/layouts/NoHeaderLayout.vue'; // Layout sem cabeçalho

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'ClientView',
        component: () => import('@/views/ClientView.vue')
      },
      {
        path: '/barber',
        name: 'BarberView',
        component: () => import('@/views/BarberView.vue')
      }
    ]
  },
  {
    path: '/login',
    component: NoHeaderLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/views/LoginView.vue')
      }
    ]
  },
  {
    path: '/register',
    component: NoHeaderLayout,
    children: [
      {
        path: '',
        name: 'Register',
        component: () => import('@/views/RegisterView.vue')
      }
    ]
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
