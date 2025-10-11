import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import App from "./App.vue";
import router from "./router";
import { setupRouterGuards } from "@/router/guards.ts";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

//Initialize them and sidebar status
import { useThemeStore } from "@/store/theme";
const themeStore = useThemeStore();
themeStore.loadTheme();

import { useLayoutStore } from "@/store/layout";
useLayoutStore();

setupRouterGuards(router);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

app.mount("#app");
