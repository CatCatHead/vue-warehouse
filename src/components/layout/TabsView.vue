<template>
  <div class="tabs-view">
    <el-tabs
      v-model="activeTab"
      type="card"
      closable
      @tab-click="handleTabClick"
      @tab-remove="handleTabRemove"
    >
      <el-tab-pane
        v-for="tab in tabs"
        :key="tab.path"
        :name="tab.path"
        :label="tab.title"
      />
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTabsStore } from "@/store/tabs.ts";

const router = useRouter();
const route = useRoute();
const tabsStore = useTabsStore();

const tabs = computed(() => tabsStore.tabs);
const activeTab = computed({
  get: () => tabsStore.activeTab,
  set: (value) => tabsStore.setActiveTab(value),
});

const handleTabClick = (tab: any) => {
  router.push(tab.paneName);
};

const handleTabRemove = (path: string) => {
  if (tabs.value.length <= 1) return;

  tabsStore.removeTab(path);

  if (path === route.path) {
    const lastTab = tabs.value[tabs.value.length - 1];
    router.push(lastTab.path);
  }
};
</script>

<style scoped>
.tabs-view {
  background: var(--tabs-bg);
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

:deep(.el-tabs__header) {
  margin: 0;
}

:deep(.el-tabs__nav-wrap) {
  padding: 8px 0 0 0;
}

/* Ensure tabs adapt to dark theme */
:deep(.el-tabs--card > .el-tabs__header .el-tabs__item) {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  color: var(--el-text-color-primary);
}

:deep(.el-tabs--card > .el-tabs__header .el-tabs__item.is-active) {
  background: var(--el-bg-color);
  border-bottom-color: var(--el-bg-color);
  color: var(--el-color-primary);
}
</style>
