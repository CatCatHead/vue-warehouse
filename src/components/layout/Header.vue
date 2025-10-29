<template>
  <div class="header-content">
    <div class="left-section">
      <el-button
        @click="toggleCollapse"
        :icon="layoutStore.sidebarCollapsed ? Expand : Fold"
        circle
      />
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/' }">Dashboard</el-breadcrumb-item>
        <el-breadcrumb-item>{{ currentPage }}</el-breadcrumb-item>
      </el-breadcrumb>

      <GlobalSearch />
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
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRoute } from "vue-router";
import { useTabsStore } from "@/store/tabs";
import { useThemeStore } from "@/store/theme";
import { useLayoutStore } from "@/store/layout";
import { Fold, Expand, Sunny, Moon, Bell } from "@element-plus/icons-vue";
import UserDropdown from "@/components/layout/UserDropDown.vue";
import GlobalSearch from "@/components/common/GlobalSearch/GlobalSearch.vue"; //

const route = useRoute();
const tabsStore = useTabsStore();
const themeStore = useThemeStore();
const layoutStore = useLayoutStore();

const currentPage = computed(() => {
  const name = route.name?.toString() || "Dashboard";
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
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  padding: 0 20px;
}

.left-section {
  display: flex;
  align-items: center;
  gap: 15px;
  flex: 1;
}

.breadcrumb {
  margin-right: auto;
}

.right-section {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info {
  color: var(--el-text-color-regular);
  white-space: nowrap;
}

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

@media (max-width: 768px) {
  .header-content {
    padding: 0 10px;
  }

  .left-section {
    gap: 8px;
  }

  .user-info {
    display: none;
  }

  .right-section {
    gap: 8px;
  }
}
</style>
