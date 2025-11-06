// src/router/guards.ts
import type { Router } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useTabsStore } from "@/store/tabs";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export function setupRouterGuards(router: Router) {
  const WHITE = ["/login"];

  router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore();
    const logged = auth.isAuthenticated;
    const tabsStore = useTabsStore();

    NProgress.start();
    NProgress.inc();

    console.log("Navigation to:", to.path, "Logged:", logged);

    if (WHITE.includes(to.path)) {
      if (logged && to.path === "/login") return next("/");
      return next();
    }

    if (to.meta?.requiresAuth && !logged) {
      return next({ path: "/login", query: { redirect: to.fullPath } });
    }

    //make sure the tab refresh
    if (logged && to.name && to.meta?.title) {
      tabsStore.addTab(to);
    }

    next();
  });

  //
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
}
