import type { Router } from "vue-router";
import { useAuthStore } from "@/store/auth";

export const setupRouterGuards = (router: Router) => {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    console.log("Route navigate", from.path, "->", to.path);

    const title = (to.meta.title as string) || "VaaS Admin";
    document.title = `${title}`;

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      console.log("Not Authenticated");
      next({
        path: "/login",
        query: { redirect: to.fullPath },
      });
      return;
    }

    if (to.path === "/login" && authStore.isAuthenticated) {
      console.log("Logon, redirecting..");
      const redirect = (to.query.redirect as string) || "/";
      next(redirect);
      return;
    }

    next();
  });
};
