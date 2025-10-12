//src/router/guards.ts
import type { Router } from "vue-router";
import { useAuthStore } from "@/store/auth";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

export function setupRouterGuards(router: Router) {
  const WHITE = ["/login"];

  router.beforeEach((to, _from, next) => {
    const auth = useAuthStore();
    const logged = auth.isAuthenticated;
    NProgress.start();

    if (WHITE.includes(to.path)) {
      if (logged && to.path === "/login") return next("/");
      return next();
    }
    if (to.meta?.requiresAuth && !logged) {
      return next({ path: "/login", query: { redirect: to.fullPath } });
    }
    next();
  });

  router.afterEach(() => NProgress.done());
}
