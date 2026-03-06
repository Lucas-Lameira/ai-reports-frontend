import { createRouter, createWebHistory } from 'vue-router'
import RelatoriosView from "@/pages/ReportsView.vue";
import patients from '@/pages/Patients.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: patients,
    },
    {
      path: "/relatorios",
      component: RelatoriosView,
    }
  ],
})

export default router
