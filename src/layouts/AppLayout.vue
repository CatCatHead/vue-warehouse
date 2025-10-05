<template>
  <el-container class="layout-container">
    <!-- Sidebar -->
    <el-aside :width="asideWidth" class="sidebar">
      <div class="logo">
        <span v-if="!isCollapsed">VaaS Admin</span>
      </div>

      <el-menu
          router
          :default-active="currentRoute"
          :collapse="isCollapsed"
          class="sidebar-menu"
      >
        <el-menu-item index="/">
          <el-icon><Odometer /></el-icon>
          <span>Dashboard</span>
        </el-menu-item>

        <el-sub-menu index="management">
          <template #title>
            <el-icon><Setting /></el-icon>
            <span>Management</span>
          </template>
          <el-menu-item index="/users">
            <el-icon><User /></el-icon>
            <span>Users</span>
          </el-menu-item>
        </el-sub-menu>

        <el-menu-item index="/about">
          <el-icon><InfoFilled /></el-icon>
          <span>About</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- Main content area -->
    <el-container>
      <el-header class="header">
        <div class="header-content">
          <div class="left-section">
            <el-button
                @click="toggleCollapse"
                :icon="isCollapsed ? Expand : Fold"
                circle
            />
            <el-breadcrumb separator="/">
              <el-breadcrumb-item :to="{ path: '/' }">Dashboard</el-breadcrumb-item>
              <el-breadcrumb-item>{{ currentPage }}</el-breadcrumb-item>
            </el-breadcrumb>
          </div>
          <div class="right-section">
            <el-tooltip :content="themeTooltip">
              <el-button
                  @click="toggleTheme"
                  :icon="themeIcon"
                  circle
              />
            </el-tooltip>
            <div class="user-info">
              Welcome, Admin
            </div>
          </div>
        </div>
      </el-header>

      <!-- Tabs View -->
      <div class="tabs-container">
        <TabsView />
      </div>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTabsStore } from '@/store/tabs'
import { useThemeStore } from '@/store/theme'
import {
  Odometer,
  Setting,
  User,
  InfoFilled,
  Fold,
  Expand,
  Sunny,
  Moon
} from '@element-plus/icons-vue'
import TabsView from '@/components/TabsView.vue'

const isCollapsed = ref(false)
const route = useRoute()
const tabsStore = useTabsStore()
const themeStore = useThemeStore()

const asideWidth = computed(() =>
    isCollapsed.value ? '64px' : '200px'
)

const currentRoute = computed(() => route.path)

const currentPage = computed(() => {
  const name = route.name?.toString() || 'Dashboard'
  return name.charAt(0).toUpperCase() + name.slice(1)
})

const themeIcon = computed(() =>
    themeStore.isDark ? Sunny : Moon
)

const themeTooltip = computed(() =>
    themeStore.isDark ? 'Switch to light theme' : 'Switch to dark theme'
)

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value
}

const toggleTheme = () => {
  themeStore.toggleTheme()
}

// Add current route to tabs when route changes
watch(
    () => route,
    (newRoute) => {
      tabsStore.addTab(newRoute)
    },
    { immediate: true, deep: true }
)
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.sidebar {
  transition: width 0.3s;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  border-bottom: 1px solid #263445;
}

.header {
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

.tabs-container {
  background: var(--tabs-bg);
  border-bottom: 1px solid var(--el-border-color-light);
}

.main-content {
  padding: 20px;
}

/* Menu style adjustments */
.sidebar-menu {
  border: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}
</style>