import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";

// Import lazy loading styles
import "@/styles/components/lazy-loading.css";

import App from "./App.vue";
import router from "./router";
import { setupRouterGuards } from "@/router/guards.ts";

import { hasPerm } from "@/directives/permission";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Initialize theme and sidebar status
import { useThemeStore } from "@/store/theme";
const themeStore = useThemeStore();
themeStore.loadTheme();

import { useLayoutStore } from "@/store/layout";
useLayoutStore();

setupRouterGuards(router);

app.directive("has-perm", hasPerm);

// Import and register Element Plus icons
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");
