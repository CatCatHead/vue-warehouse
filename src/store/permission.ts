// src/store/permission.ts
import { defineStore } from "pinia";
import type { RouteRecordRaw } from "vue-router";
import { asyncRoutes } from "@/router/async-routes";
import { constantRoutes } from "@/router/constant-routes";

function hasPermission(
  route: RouteRecordRaw,
  userRole: string,
  permissions: string[],
): boolean {
  const meta = route.meta || {};

  if (meta.roles && Array.isArray(meta.roles) && meta.roles.length > 0) {
    const roles = (meta.roles as string[]).map((r) => r.toUpperCase());
    if (!roles.includes(userRole.toUpperCase())) {
      return false;
    }
  }

  if (meta.permissions && Array.isArray(meta.permissions)) {
    const permSet = new Set(permissions);
    const required = meta.permissions as string[];
    const match = required.some((p) => permSet.has(p));
    if (!match) {
      return false;
    }
  }

  return true;
}

function filterAsyncRoutes(
  routes: RouteRecordRaw[],
  userRole: string,
  permissions: string[],
): RouteRecordRaw[] {
  const res: RouteRecordRaw[] = [];

  routes.forEach((route) => {
    const tmp: RouteRecordRaw = { ...route };

    if (hasPermission(tmp, userRole, permissions)) {
      if (tmp.children && tmp.children.length > 0) {
        tmp.children = filterAsyncRoutes(tmp.children, userRole, permissions);
      }
      res.push(tmp);
    }
  });

  return res;
}

export const usePermissionStore = defineStore("permission", {
  state: () => ({
    routes: constantRoutes as RouteRecordRaw[],

    addRoutes: [] as RouteRecordRaw[],

    currentRole: "" as string,
  }),
  actions: {
    generateRoutes(userRole: string, permissions: string[]) {
      const accessedRoutes = filterAsyncRoutes(
        asyncRoutes,
        userRole,
        permissions,
      );

      this.addRoutes = accessedRoutes;
      this.routes = constantRoutes.concat(accessedRoutes);
      this.currentRole = userRole;

      return accessedRoutes;
    },

    reset() {
      this.routes = constantRoutes as RouteRecordRaw[];
      this.addRoutes = [];
      this.currentRole = "";
    },
  },
});
