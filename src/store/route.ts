// src/store/route.ts
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Router, RouteRecordRaw } from "vue-router";
import { buildRoutesFromMenus } from "@/router/build-routes";
import mockMenus from "@/mock/menus";

export const useRouteStore = defineStore("route", () => {
  const isReady = ref(false);

  const toChild = (r: any): any => {
    const x: any = { ...r };
    if (typeof x.path === "string" && x.path.startsWith("/"))
      x.path = x.path.slice(1);
    if (Array.isArray(x.children)) x.children = x.children.map(toChild);
    return x;
  };

  const safeTop = (p?: string) => !!p && p !== "/" && !p.includes(":pathMatch");

  async function ensureDynamicRoutes(router: Router) {
    if (isReady.value) return;

    let routes = buildRoutesFromMenus(mockMenus) as RouteRecordRaw[];

    routes = routes.filter((r) => safeTop(r.path)).map(toChild);

    routes.forEach((r) => {
      if (!router.hasRoute(r.name as string)) {
        router.addRoute("Root", r);
      }
    });

    isReady.value = true;

    console.log(
      "[route] injected:",
      router.getRoutes().map((r) => ({ name: r.name, path: r.path })),
    );
  }

  function reset() {
    isReady.value = false;
  }

  return { isReady, ensureDynamicRoutes, reset };
});
