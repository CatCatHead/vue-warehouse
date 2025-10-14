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
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/error/NotFound.vue"),
  },
];

const router = createRouter({ history: createWebHistory(), routes });

setupRouterGuards(router);

export default router;
