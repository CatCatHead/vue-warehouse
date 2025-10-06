import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/Login.vue"),
    meta: {
      title: "Login",
      requiresAuth: false,
    },
  },
  {
    path: "/:pathMatch(.*)*",
    name: "NotFound",
    component: () => import("@/views/NotFound.vue"),
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
        component: () => import("@/views/Dashboard.vue"),
        meta: { title: "Dashboard" },
      },
      {
        path: "/users",
        name: "Users",
        component: () => import("@/views/Users.vue"),
        meta: { title: "User" },
      },
      {
        path: "/about",
        name: "About",
        component: () => import("@/views/About.vue"),
        meta: { title: "about" },
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
