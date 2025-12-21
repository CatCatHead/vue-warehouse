//src/router/constant-routes.ts
import type { RouteRecordRaw } from "vue-router";
import { lazyLoad } from "@/utils/lazyLoad";

const Layout = lazyLoad(() => import("@/layouts/AppLayout.vue"));

export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/login",
    name: "Login",
    component: () => lazyLoad(() => import("@/views/auth/index.vue")),
    meta: {
      title: "Login",
      hidden: true,
    },
  },
  {
    path: "/",
    name: "Root",
    component: Layout,
    meta: {
      requiresAuth: true,
      closeable: false,
    },
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        name: "Dashboard",
        component: () => lazyLoad(() => import("@/views/dashboard/index.vue")),
        meta: {
          title: "Dashboard",
          icon: "House",
          requiresAuth: true,
          closeable: false,
        },
      },
      {
        path: "about",
        name: "About",
        component: () => lazyLoad(() => import("@/views/about/index.vue")),
        meta: { title: "About", requiresAuth: true, closeable: true },
      },
      {
        path: "deliveryList",
        name: "DeliveryList",
        component: () =>
          lazyLoad(() => import("@/views/DeliveryList/DeliveryList.vue")),
        meta: { title: "DeliveryList", requiresAuth: true, closeable: true },
      },
      {
        path: "deliveryListUpload",
        name: "DeliveryListUpload",
        component: () =>
          lazyLoad(() => import("@/views/DeliveryList/DeliveryListUpload.vue")),
        meta: {
          title: "DeliveryListUpload",
          requiresAuth: true,
          closeable: true,
        },
      },
      {
        path: "trackingNumber",
        name: "TrackingNumber",
        component: () =>
          lazyLoad(() => import("@/views/Tracking/TrackingNumber.vue")),
        meta: { title: "Tracking Number", requiresAuth: true, closeable: true },
      },
    ],
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => lazyLoad(() => import("@/views/error/NotFound.vue")),
    meta: {
      hidden: true,
    },
  },
];
