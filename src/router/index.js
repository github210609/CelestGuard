import { createRouter, createWebHistory } from 'vue-router'
import MapView from '../views/MapView.vue'
import FriendsView from '../views/FriendsView.vue'
import ProfileView from '../views/ProfileView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'map',
      component: MapView,
      meta: { requiresAuth: true }
    },
    {
      path: '/friends',
      name: 'friends',
      component: FriendsView,
      meta: { requiresAuth: true }
    },
    {
      path: '/profile',
      name: 'profile',
      component: ProfileView,
      meta: { requiresAuth: true }
    }
  ]
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    // 需要登录但未登录，重定向到登录页
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated) {
    // 已登录时访问登录页，重定向到首页
    next({ name: 'map' })
  } else {
    next()
  }
})

export default router 