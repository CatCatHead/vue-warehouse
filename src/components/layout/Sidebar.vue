<template>
  <div>
    <div class="logo">
      <span v-if="!layoutStore.sidebarCollapsed">Warehouse Admin</span>
    </div>

    <el-menu
      router
      :default-active="currentRoute"
      :collapse="layoutStore.sidebarCollapsed"
      class="sidebar-menu"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
    >
      <SidebarItem v-for="item in menuRoutes" :key="item.path" :item="item" />
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import { useLayoutStore } from "@/store/layout";
import { usePermissionStore } from "@/store/permission";
import SidebarItem from "./SidebarItem.vue";

const route = useRoute();
const layoutStore = useLayoutStore();
const permissionStore = usePermissionStore();

const currentRoute = computed(() => route.path);

const menuRoutes = computed<RouteRecordRaw[]>(() =>
  permissionStore.routes.filter((r) => {
    const meta = r.meta || {};
    if (meta.hidden) return false;
    if (r.path === "/login") return false;
    if (r.path === "/:pathMatch(.*)*") return false; // 404
    return true;
  }),
);
</script>

<style scoped>
.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #263445;
}

.sidebar-menu {
  border: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}
</style>
