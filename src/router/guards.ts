import { useAuthStore } from "@/store/auth";

export const setupRouterGuards = (router: any) => {
  router.beforeEach((to: any, from: any, next: any) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
      next("/login");
    } else if (to.path === "/login" && authStore.isAuthenticated) {
      next("/");
    } else {
      next();
    }
  });
};
