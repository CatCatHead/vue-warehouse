// src/router/guards.ts
import type { Router } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useRouteStore } from "@/store/route";

export function setupRouterGuards(router: Router) {
  const WHITE = ["/login"];

  router.beforeEach(async (to, _from, next) => {
    const auth = useAuthStore();
    const routeStore = useRouteStore();
    const logged = auth.isAuthenticated;

    if (WHITE.includes(to.path)) {
      if (logged && to.path === "/login") return next("/");
      return next();
    }

    if (to.meta?.requiresAuth && !logged) {
      return next({ path: "/login", query: { redirect: to.fullPath } });
    }

    if (logged && !routeStore.isReady) {
      await routeStore.ensureDynamicRoutes(router);
      return next({ ...to, replace: true });
    }

    next();
  });
}
