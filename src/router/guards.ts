// src/router/guards.ts
import type { Router } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { ElMessage } from "element-plus";
import NProgress from "nprogress";
import { useTabsStore } from "@/store/tabs";

export function setupRouterGuards(router: Router) {
  const WHITE = ["/login"];

  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStore();
    const logged = authStore.isAuthenticated;

    console.log("Navigation to:", to.path, "Logged:", logged);
    NProgress.start();
    NProgress.inc();

    if (WHITE.includes(to.path)) {
      if (logged && to.path === "/login") return next("/");
      return next();
    }

    if (to.meta?.requiresAuth && !logged) {
      return next({ path: "/login", query: { redirect: to.fullPath } });
    }

    next();
  });

  router.afterEach((to) => {
    const tabsStore = useTabsStore();
    // tab actived
    if (to.name && to.meta?.title) {
      const existingTab = tabsStore.findTabByPath(to.path);
      if (existingTab) {
        tabsStore.setActiveTab(to.path);
      }
    }
    NProgress.done();
  });

  router.onError((error) => {
    console.error("Router error:", error);
    ElMessage.error("Page loading failed");
  });
}
