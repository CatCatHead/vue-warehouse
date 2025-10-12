//src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import { setupRouterGuards } from "@/router/guards";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/index.vue"),
    meta: {
      title: "Login",
      requiresAuth: false,
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/error/NotFound.vue"),
    meta: {
      title: "Page Not Found",
      requiresAuth: false,
    },
  },
  {
    path: "/",
    component: () => import("@/layouts/AppLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        meta: { title: "Dashboard" },
      },
      {
        path: "/users",
        name: "Users",
        component: () => import("@/views/system/user/index.vue"),
        meta: { title: "User" },
      },
      {
        path: "/about",
        name: "About",
        component: () => import("@/views/about/index.vue"),
        meta: { title: "about" },
      },
      {
        path: "/settings",
        name: "Settings",
        component: () => import("@/views/system/settings/Settings.vue"),
        meta: { title: "System settings" },
      },
      {
        path: "/trackingNumber",
        name: "TrackingNumber",
        component: () => import("@/views/Tracking/TrackingNumber.vue"),
        meta: { title: "Tracking Number" },
      },
      {
        path: "/permtest",
        name: "permtest",
        component: () => import("@/views/permtest/test.vue"),
        meta: { title: "Permission Test" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

setupRouterGuards(router);

export default router;
