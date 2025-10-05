<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useAuthStore } from "@/store/auth";

onMounted(() => {
  // 这里使用 store 会触发 store 的初始化，然后我们可以在控制台看到输出
  const authStore = useAuthStore();
  console.log(
    "App mounted, auth state initialized:",
    authStore.isAuthenticated,
  );
});
</script>

<style>
* {
  margin: 0;
  padding: 0;
}
html,
body,
#app {
  height: 100%;
}
</style>
