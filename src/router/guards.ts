// src/router/guards.ts
import type { Router } from "vue-router";
import { useAuthStore } from "@/store/auth";

export function setupRouterGuards(router: Router) {
  const WHITE = ["/login"];

  router.beforeEach(async (to, from, next) => {
    const auth = useAuthStore();
    const logged = auth.isAuthenticated;

    console.log("Navigation to:", to.path, "Logged:", logged);

    if (WHITE.includes(to.path)) {
      if (logged && to.path === "/login") return next("/");
      return next();
    }

    if (to.meta?.requiresAuth && !logged) {
      return next({ path: "/login", query: { redirect: to.fullPath } });
    }

    next();
  });
}
