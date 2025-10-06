<template>
  <el-container class="layout-container">
    <el-aside :width="asideWidth" class="aside">
      <div class="logo">
        <el-icon class="logo-icon"><Management /></el-icon>
        <span class="logo-text">Warehouse Admin</span>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="sidebar-menu"
        router
        background-color="#001529"
        text-color="#fff"
        active-text-color="#ffd04b"
      >
        <el-menu-item index="/">
          <el-icon><House /></el-icon>
          <span>Home</span>
        </el-menu-item>
        <el-menu-item index="/about">
          <el-icon><InfoFilled /></el-icon>
          <span>About</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-left">
          <el-button type="text" @click="toggleCollapse" class="collapse-btn">
            <el-icon v-if="isCollapsed"><Expand /></el-icon>
            <el-icon v-else><Fold /></el-icon>
          </el-button>
        </div>
        <div class="header-right">
          <span>Welcome, Admin</span>
        </div>
      </el-header>

      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import {
  Management,
  House,
  InfoFilled,
  Expand,
  Fold,
} from "@element-plus/icons-vue";

const isCollapsed = ref(false);

const asideWidth = computed(() => (isCollapsed.value ? "64px" : "200px"));

const route = useRoute();
const activeMenu = computed(() => route.path);

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.aside {
  background-color: #001529;
  transition: width 0.3s;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 60px;
  color: white;
  font-size: 18px;
  font-weight: bold;
}

.logo-icon {
  font-size: 24px;
  margin-right: 8px;
}

.logo-text {
  opacity: 1;
  transition: opacity 0.3s;
}

.aside:not(.is-collapsed) .logo-text {
  opacity: 1;
}

.sidebar-menu {
  border: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 100%;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  padding: 0 20px;
}

.collapse-btn {
  font-size: 18px;
}

.header-right {
  color: #333;
}

.main {
  background-color: #f0f2f5;
  padding: 20px;
}
</style>
