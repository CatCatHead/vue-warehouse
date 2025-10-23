// src/router/index.ts
import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { setupRouterGuards } from "./guards";

export const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/index.vue"),
  },
  {
    path: "/",
    name: "Root",
    component: () => import("@/layouts/AppLayout.vue"),
    meta: { requiresAuth: true },
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: { title: "Dashboard", requiresAuth: true },
      },
      {
        path: "users",
        name: "User",
        component: () => import("@/views/system/user/index.vue"),
        meta: { title: "User Management", requiresAuth: true },
      },
      {
        path: "settings",
        name: "SystemSettings",
        component: () => import("@/views/system/settings/Settings.vue"),
        meta: { title: "System Settings", requiresAuth: true },
      },
      {
        path: "trackingNumber",
        name: "TrackingNumber",
        component: () => import("@/views/Tracking/TrackingNumber.vue"),
        meta: { title: "Tracking Number", requiresAuth: true },
      },
      {
        path: "about",
        name: "About",
        component: () => import("@/views/about/index.vue"),
        meta: { title: "About", requiresAuth: true },
      },
      {
        path: "permtest",
        name: "PermissionTest",
        component: () => import("@/views/permtest/test.vue"),
        meta: { title: "Permission Test", requiresAuth: true },
      },
      {
        path: "echart",
        name: "Echart",
        component: () => import("@/views/Echart/Echart.vue"),
        meta: { title: "Echart", requiresAuth: true },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/error/NotFound.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

setupRouterGuards(router);

export default router;
