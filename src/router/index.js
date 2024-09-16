import { createRouter, createWebHistory } from 'vue-router';
import DefaultLayout from '@/layouts/DefaultLayout.vue'; // Layout com cabeçalho
import NoHeaderLayout from '@/layouts/NoHeaderLayout.vue'; // Layout sem cabeçalho
import BarberLayout from '@/layouts/BarberLayout.vue'; // Layout para o barbeiro
import { auth } from '@/firebaseConfig'; // Importar configuração do Firebase

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'ClientView',
        component: () => import('@/views/ClientView.vue')
      }
    ]
  },
  {
    path: '/barber',
    component: BarberLayout,
    children: [
      {
        path: 'schedule-manager',
        name: 'BarberScheduleManager',
        component: () => import('@/components/WorkSchedule.vue'),
        meta: { requiresAuth: true } 
      },
      {
        path: 'available-dates',
        name: 'AvailableDates',
        component: () => import('@/components/AvailableDates.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'clients',
        name: 'ClientList',
        component: () => import('@/components/ClientList.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'appointments',
        name: 'ScheduleView',
        component: () => import('@/components/ScheduleView.vue'),
        meta: { requiresAuth: true }
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

router.beforeEach(async (to, from, next) => {
  const user = auth.currentUser;
  if (to.matched.some(record => record.meta.requiresAuth) && !user) {
    // Se a rota requer autenticação e o usuário não está autenticado, redireciona para o login
    next('/login');
  } else {
    // Se o usuário está autenticado e está tentando acessar a página de login ou registro, redireciona para a página principal
    if (user && (to.name === 'Login' || to.name === 'Register')) {
      next('/');
    } else {
      next();
    }
  }
});

export default router;
