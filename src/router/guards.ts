//src/router/guards.ts
import type { Router } from "vue-router";
import { useAuthStore } from "@/store/auth";

export const setupRouterGuards = (router: Router) => {
  router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();

    console.log("Route navigate", from.path, "->", to.path);

    const title = (to.meta.title as string) || "Warehouse Admin";
    document.title = `${title}`;

    //retrieve all children nodes
    const routes = router.getRoutes();
    const rootRoute = routes.find((route) => route.path === "/");
    if (rootRoute && rootRoute.children) {
      console.log("Root route children", rootRoute.children);
    }
    const currenRouteChildren = to.matched.flatMap(
      (record) => record.children || [],
    );
    console.log("Current route children", currenRouteChildren);

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
