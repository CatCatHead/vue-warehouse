<template>
  <el-container class="layout-container">
    <el-aside :width="asideWidth" class="sidebar">
      <Sidebar />
    </el-aside>

    <el-container>
      <el-header class="header">
        <Header />
      </el-header>

      <TabsView />

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useLayoutStore } from "@/store/layout";
import Sidebar from "@/components/layout/Sidebar.vue";
import Header from "@/components/layout/Header.vue";
import TabsView from "@/components/layout/TabsView.vue";

const layoutStore = useLayoutStore();

const asideWidth = computed(() =>
  layoutStore.sidebarCollapsed ? "64px" : "200px",
);
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  background-color: #304156;
  transition: width 0.3s;
}

.header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 20px;
}

.main-content {
  padding: 20px;
  background-color: var(--el-bg-color-page);
}
</style>
