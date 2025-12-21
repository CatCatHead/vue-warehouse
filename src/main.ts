// src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import "element-plus/dist/index.css";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

import { useThemeStore } from "@/store/theme";
const themeStore = useThemeStore();
themeStore.loadTheme();

import { useLayoutStore } from "@/store/layout";
useLayoutStore();

import permissionDirective from "@/directives/permission";
app.directive("permission", permissionDirective);

import * as ElementPlusIconsVue from "@element-plus/icons-vue";
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");
