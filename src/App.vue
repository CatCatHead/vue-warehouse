<!-- src/App.vue -->
<template>
  <div id="app">
    <DialogHost />
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "@/store/auth";
import { useRoutePreload } from "@/composables/useRoutePreload";
import { config, isMockMode } from "@/utils/config";
import DialogHost from "@/components/common/GDialog/DialogHost.vue";

const router = useRouter();
const authStore = useAuthStore();

// Enable intelligent route preloading
useRoutePreload();

onMounted(() => {
  if (isMockMode) {
    console.log("🚀 Vue Warehouse Admin - Running in Mock Mode");
    console.log("📊 Mock Data: All operations are simulated");
    console.log("🔗 Backend: Not connected (using mock adapter)");
  } else {
    console.log("🚀 Vue Warehouse Admin - Connected to Backend API");
  }

  document.title = config.appTitle;
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body,
#app {
  height: 100%;
  font-family:
    -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
</style>
