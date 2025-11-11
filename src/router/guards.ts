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

    console.log(
      "Navigation to:",
      to.path,
      "Logged:",
      authStore.isAuthenticated,
      "Initialized:",
      authStore.isInitialized,
    );
    NProgress.start();
    NProgress.inc();

    if (!authStore.isInitialized) {
      console.log("Auth not initialized, waiting...");
      try {
        await authStore.initializeAuth();
        console.log("Auth initialization completed in guard", {
          isAuthenticated: authStore.isAuthenticated,
          hasUser: !!authStore.user,
        });
      } catch (error) {
        console.error("Auth initialization failed in guard:", error);
      }
    }

    const logged = authStore.isAuthenticated;

    //white list check
    if (WHITE.includes(to.path)) {
      if (logged && to.path === "/login") {
        console.log("Already logged in, redirecting from login to home");
        return next("/");
      }
      console.log("White list route access:", to.path);
      return next();
    }

    //Pages need authorizes
    if (to.meta?.requiresAuth && !logged) {
      console.log("Access denied, redirecting to login");
      return next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
    }

    console.log("Access granted to:", to.path);
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
