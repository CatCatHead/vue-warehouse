<template>
  <el-container class="layout-container">
    <el-aside :width="asideWidth" class="sidebar">
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
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>

        <el-sub-menu index="management">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>System</span>
          </template>
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <span>User</span>
          </el-menu-item>
          <el-menu-item index="/settings">
            <el-icon><Setting /></el-icon>
            <span>System Setting</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/about">
          <el-icon><InfoFilled /></el-icon>
          <span>About</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="left-section">
            <el-button
              @click="toggleCollapse"
              :icon="layoutStore.sidebarCollapsed ? Expand : Fold"
              circle
            />
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }"
                >Dashboard</el-breadcrumb-item
              >
              <el-breadcrumb-item>{{ currentPage }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="right-section">
            <el-tooltip :content="themeTooltip">
              <el-button
                @click="toggleTheme"
                :icon="themeIcon"
                circle
                class="theme-toggle-btn"
              />
            </el-tooltip>
            <div class="user-info">Welcome, Admin</div>

            <el-badge :value="3" class="notification-badge">
              <el-button :icon="Bell" circle />
            </el-badge>

            <UserDropdown />
          </div>
        </div>
      </el-header>

      <TabsView />

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useTabsStore } from "@/store/tabs";
import { useThemeStore } from "@/store/theme";
import { useLayoutStore } from "@/store/layout";
import {
  Odometer,
  Setting,
  User,
  InfoFilled,
  Fold,
  Expand,
  Sunny,
  Moon,
} from "@element-plus/icons-vue";
import TabsView from "@/components/layout/TabsView.vue";
import UserDropdown from "@/components/layout/UserDropDown.vue";

const route = useRoute();
const tabsStore = useTabsStore();
const themeStore = useThemeStore();
const layoutStore = useLayoutStore();

const asideWidth = computed(() =>
  layoutStore.sidebarCollapsed ? "64px" : "200px",
);

const currentRoute = computed(() => route.path);

const currentPage = computed(() => {
  const name = route.name?.toString() || "仪表板";
  return name;
});

const themeIcon = computed(() => (themeStore.isDark ? Sunny : Moon));

const themeTooltip = computed(() =>
  themeStore.isDark ? "to light" : "to dark",
);

const toggleCollapse = () => {
  layoutStore.toggleSidebar();
};

const toggleTheme = () => {
  console.log("Switch Theme");
  themeStore.toggleTheme();
};

watch(
  () => route,
  (newRoute) => {
    tabsStore.addTab(newRoute);
  },
  { immediate: true, deep: true },
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

.header {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  padding: 0 20px;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  color: var(--el-text-color-regular);
}

.main-content {
  padding: 20px;
  background-color: var(--el-bg-color-page);
}

.sidebar-menu {
  border: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}

/* 主题切换按钮的简单涟漪效果 */
.theme-toggle-btn {
  position: relative;
  overflow: hidden;
}

.theme-toggle-btn::after {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition:
    width 0.3s,
    height 0.3s;
}

.theme-toggle-btn:active::after {
  width: 100px;
  height: 100px;
}

.notification-badge {
  margin-right: 8px;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
