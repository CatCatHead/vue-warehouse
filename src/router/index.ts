import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/Login.vue"),
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
    component: () => import("@/layouts/BaseLayout.vue"),
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
        component: () => import("@/views/sidebar/About.vue"),
        meta: { title: "about" },
      },
      {
        path: "/settings",
        name: "Settings",
        component: () => import("@/views/system/settings/Settings.vue"),
        meta: { title: "System settings" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
