import { createRouter, createWebHistory } from "vue-router";
import AppShell from "@/components/app-shell.vue";
import { useSessionStore } from "@/stores/session";
import DashboardView from "@/views/dashboard-view.vue";
import IncidentsView from "@/views/incidents-view.vue";
import MonitorsView from "@/views/monitors-view.vue";
import SignInView from "@/views/sign-in-view.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: "/",
      component: AppShell,
      children: [
        { path: "", redirect: { name: "dashboard" } },
        { path: "dashboard", name: "dashboard", component: DashboardView },
        { path: "monitors", name: "monitors", component: MonitorsView },
        { path: "incidents", name: "incidents", component: IncidentsView },
        { path: "sign-in", name: "sign-in", component: SignInView },
      ],
    },
  ],
});

router.beforeEach((to) => {
  const session = useSessionStore();
  if (!session.configured) {
    return true;
  }
  if (to.name !== "sign-in" && !session.authenticated) {
    return { name: "sign-in" };
  }
  if (to.name === "sign-in" && session.authenticated) {
    return { name: "dashboard" };
  }
  return true;
});
