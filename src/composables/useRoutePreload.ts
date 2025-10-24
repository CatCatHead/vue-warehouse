import { watch } from "vue";
import { useRoute } from "vue-router";
import { preloadComponents } from "@/utils/lazyLoad";

/**
 * Composable for intelligent route preloading
 */
export function useRoutePreload() {
  const route = useRoute();

  // Preload likely next routes based on current route
  const preloadStrategies: Record<string, Array<() => Promise<any>>> = {
    "/dashboard": [
      () => import("@/views/system/user/index.vue"),
      () => import("@/views/system/settings/Settings.vue"),
    ],
    "/users": [
      () => import("@/views/system/settings/Settings.vue"),
      () => import("@/views/dashboard/index.vue"),
    ],
    "/settings": [
      () => import("@/views/dashboard/index.vue"),
      () => import("@/views/system/user/index.vue"),
    ],
  };

  watch(
    () => route.path,
    (newPath) => {
      // Preload components after current route is loaded
      setTimeout(() => {
        const strategies = preloadStrategies[newPath];
        if (strategies) {
          preloadComponents(strategies).catch(console.error);
        }
      }, 1000);
    },
    { immediate: true },
  );
}
