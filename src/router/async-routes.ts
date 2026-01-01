//src/router/async-routes.ts

import type { RouteRecordRaw } from "vue-router";
import { lazyLoad } from "@/utils/lazyLoad";

const Layout = lazyLoad(() => import("@/layouts/AppLayout.vue"));

export const asyncRoutes: RouteRecordRaw[] = [
  {
    path: "/system",
    name: "SystemManagementRoot",
    component: Layout,
    meta: {
      title: "System Management",
      icon: "Setting",
      roles: ["ADMIN"],
      requiresAuth: true,
    },
    children: [
      {
        path: "users",
        name: "UserManagement",
        component: () =>
          lazyLoad(() => import("@/views/system/user/index.vue")),
        meta: {
          title: "User Management",
          requiresAuth: true,
          closeable: true,
        },
      },
      {
        path: "departments",
        name: "Departments",
        component: () =>
          lazyLoad(() => import("@/views/department/Department.vue")),
        meta: {
          title: "Departments",
          requiresAuth: true,
          closeable: true,
        },
      },
    ],
  },
  {
    path: "/linens",
    name: "LinensManagementRoot",
    component: Layout,
    meta: {
      title: "Linens Management",
      icon: "Setting",
      roles: ["ADMIN"],
    },
    children: [
      {
        path: "linens",
        name: "Linens",
        component: () => lazyLoad(() => import("@/views/Linen/Linen.vue")),
        meta: { title: "Linens", requiresAuth: true, closeable: true },
      },
    ],
  },
];
