//src/utils/dynamicRoutes.ts
import type { RouteRecordNormalized } from "vue-router";
import router from "@/router/index";

//get children nodes of inputed path
export function getRouteChildren(path: string): RouteRecordNormalized[] {
  const routes = router.getRoutes();
  const targetRoute = routes.find((route) => route.path === path);
  return targetRoute?.children || [];
}

export function getAllNestedChildren(path: string): RouteRecordNormalized[] {
  const routes = router.getRoutes();
  const result: RouteRecordNormalized[] = [];

  function findChildren(currentPath: string) {
    const route = routes.find((r) => r.path === currentPath);
    if (route?.children) {
      result.push(...route.children);
      route.children.forEach((child) => {
        findChildren(child.path);
      });
    }
  }

  findChildren(path);
  return result;
}

//flat route menu tree
export function getFlatRouteTree(): RouteRecordNormalized[] {
  return route
    .getRoutes()
    .filter((route) => route.meta & route.meta.title && !route.meta.hidden);
}
