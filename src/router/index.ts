// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { constantRoutes } from "./constant-routes";
import { useAuthStore } from "@/store/auth";
import { usePermissionStore } from "@/store/permission";
import { useTabsStore } from "@/store/tabs";

const WHITE_LIST = ["/login"];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes as RouteRecordRaw[],
});

let asyncRoutesAdded = false;

export function resetRouter() {
  const permissionStore = usePermissionStore();

  if (permissionStore.addRoutes.length > 0) {
    permissionStore.addRoutes.forEach((route) => {
      if (route.name && router.hasRoute(route.name)) {
        router.removeRoute(route.name);
      }
    });
  }

  asyncRoutesAdded = false;
  permissionStore.reset();

  const tabsStore = useTabsStore();
  tabsStore.resetTabs();
}

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  const permissionStore = usePermissionStore();

  if (!authStore.isInitialized) {
    try {
      await authStore.initializeAuth();
    } catch (e) {
      console.error("initializeAuth error:", e);
    }
  }

  const logged = authStore.isAuthenticated;

  if (WHITE_LIST.includes(to.path)) {
    if (!logged) {
      return next();
    }

    return next({ path: "/", replace: true });
  }

  if (!logged) {
    return next({
      path: "/login",
      query: { redirect: to.fullPath },
      replace: true,
    });
  }

  const role = authStore.user?.role || "USER";
  const perms = authStore.user?.permissions || [];

  if (!asyncRoutesAdded || permissionStore.currentRole !== role) {
    const accessRoutes = permissionStore.generateRoutes(role, perms);

    accessRoutes.forEach((route) => {
      if (route.name && !router.hasRoute(route.name)) {
        router.addRoute(route);
      }
    });

    asyncRoutesAdded = true;

    return next({ ...to, replace: true });
  }

  next();
});

router.afterEach((to) => {
  const tabsStore = useTabsStore();
  if (to.name && to.meta?.title && !to.meta?.hidden) {
    tabsStore.addTab(to);
  }
});

export default router;
