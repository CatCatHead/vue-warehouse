// src/mock/menus.ts
export default [
  {
    name: "System",
    path: "/",
    component: "layouts/RouteView",
    meta: { title: "System" },
  },
  {
    name: "TrackingNumber",
    path: "/TrackingNumber",
    component: "Tracking/TrackingNumber",
    meta: { title: "Tracking Number" },
  },
  {
    name: "About",
    path: "/about",
    component: "about/index",
    meta: { title: "About" },
  },
  {
    name: "PermissionTest",
    path: "/permtest",
    component: "permtest/test",
    meta: { title: "Permission Test" },
  },
  {
    name: "User",
    path: "/users",
    component: "system/user/index",
    meta: { title: "User" },
  },
  {
    name: "SystemSettings",
    path: "/settings",
    component: "system/settings/Settings",
    meta: { title: "System settings" },
  },
];
