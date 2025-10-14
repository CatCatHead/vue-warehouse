// src/router/build-routes.ts
const viewRel = import.meta.glob("../views/**/*.vue");
const viewAbs = import.meta.glob("/src/views/**/*.vue");

const layoutLoaders: Record<string, any> = {
  "layouts/AppLayout": () => import("@/layouts/AppLayout.vue"),
};

type MenuItem = {
  name: string;
  path: string;
  component?: string;
  meta?: Record<string, any>;
  children?: MenuItem[];
};

function resolveViewLoader(comp?: string) {
  if (!comp) return null;
  let c = comp
    .trim()
    .replace(/^\//, "")
    .replace(/^(\.\/)+/, "")
    .replace(/^views\//, "")
    .replace(/\.vue$/i, "");

  if (c.startsWith("layouts/")) {
    return layoutLoaders[c] || layoutLoaders["layouts/RouteView"];
  }

  const candidates = [
    `../views/${c}.vue`,
    `../views/${c}/index.vue`,
    `/src/views/${c}.vue`,
    `/src/views/${c}/index.vue`,
  ];
  for (const k of candidates) {
    const hit = (viewRel as any)[k] || (viewAbs as any)[k];
    if (hit) return hit;
  }
  return null;
}

export function buildRoutesFromMenus(menus: MenuItem[]) {
  const walk = (nodes: MenuItem[] = []): any[] =>
    nodes.map((n) => {
      const rec: any = {
        name: n.name,
        path: n.path,
        meta: { requiresAuth: true, ...(n.meta || {}) },
      };

      const loader = resolveViewLoader(n.component);
      if (loader) {
        rec.component = loader;
      } else if (n.children?.length) {
        rec.component = layoutLoaders["layouts/RouteView"];
      } else {
        console.warn(
          "[route] unresolved component:",
          n.component,
          "for path:",
          n.path,
        );
        rec.component = () => import("@/views/error/NotFound.vue");
      }

      if (n.children?.length) rec.children = walk(n.children);
      return rec;
    });

  return walk(menus);
}
