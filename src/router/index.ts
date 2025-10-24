import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { setupRouterGuards } from "./guards";
import { lazyLoad } from "@/utils/lazyLoad";

export const routes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => lazyLoad(() => import("@/views/auth/index.vue")),
  },
  {
    path: "/",
    name: "Root",
    component: () => lazyLoad(() => import("@/layouts/AppLayout.vue")),
    meta: { requiresAuth: true },
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => lazyLoad(() => import("@/views/dashboard/index.vue")),
        meta: { title: "Dashboard", requiresAuth: true },
      },
      {
        path: "users",
        name: "User",
        component: () =>
          lazyLoad(() => import("@/views/system/user/index.vue")),
        meta: { title: "User Management", requiresAuth: true },
      },
      {
        path: "settings",
        name: "SystemSettings",
        component: () =>
          lazyLoad(() => import("@/views/system/settings/Settings.vue")),
        meta: { title: "System Settings", requiresAuth: true },
      },
      {
        path: "trackingNumber",
        name: "TrackingNumber",
        component: () =>
          lazyLoad(() => import("@/views/Tracking/TrackingNumber.vue")),
        meta: { title: "Tracking Number", requiresAuth: true },
      },
      {
        path: "about",
        name: "About",
        component: () => lazyLoad(() => import("@/views/about/index.vue")),
        meta: { title: "About", requiresAuth: true },
      },
      {
        path: "permtest",
        name: "PermissionTest",
        component: () => lazyLoad(() => import("@/views/permtest/test.vue")),
        meta: { title: "Permission Test", requiresAuth: true },
      },
      {
        path: "echart",
        name: "Echart",
        component: () => lazyLoad(() => import("@/views/Echart/Echart.vue")),
        meta: { title: "Echart", requiresAuth: true },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => lazyLoad(() => import("@/views/error/NotFound.vue")),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

setupRouterGuards(router);

export default router;
