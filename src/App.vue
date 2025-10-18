<template>
  <DialogHost />
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/store/auth";
import { DialogHost } from "@/components/common/GDialog";

const authStore = useAuthStore();

onMounted(() => {
  console.log("App mounted, auth state:", {
    isAuthenticated: authStore.isAuthenticated,
    accessToken: authStore.accessToken,
  });
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
