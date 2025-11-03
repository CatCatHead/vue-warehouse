<!-- src/components/layout/TabsView.vue -->
<template>
  <div class="tabs-view">
    <div class="tabs-container" ref="tabsContainerRef">
      <div
        v-for="tab in tabs"
        :key="tab.path"
        :class="['tab-item', { active: activeTab === tab.path }]"
        @click="handleTabClick(tab)"
        @contextmenu.prevent="handleContextMenu($event, tab)"
        draggable="true"
        @dragstart="handleDragStart($event, tab)"
        @dragover="handleDragOver($event, tab)"
        @dragend="handleDragEnd"
        @drop="handleDrop($event, tab)"
      >
        <span class="tab-title">{{ tab.title }}</span>
        <el-icon
          v-if="tab.closable !== false && tabs.length > 1"
          class="tab-close"
          @click.stop="handleTabRemove(tab.path)"
        >
          <Close />
        </el-icon>
      </div>
    </div>

    <!-- Tab right click menu -->
    <TabContextMenu
      v-if="contextMenu.visible"
      :visible="contextMenu.visible"
      :position="contextMenu.position"
      :tab-path="contextMenu.tabPath"
      @update:visible="contextMenu.visible = $event"
      @close="handleMenuClose"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useTabsStore } from "@/store/tabs";
import { Close } from "@element-plus/icons-vue";
import TabContextMenu from "./TabContextMenu.vue";

const router = useRouter();
const route = useRoute();
const tabsStore = useTabsStore();

const tabsContainerRef = ref<HTMLElement>();
const dragTab = ref<string>("");

const tabs = computed(() => tabsStore.tabs);
const activeTab = computed(() => tabsStore.activeTab);

// Right click menu status
const contextMenu = reactive({
  visible: false,
  position: { x: 0, y: 0 },
  tabPath: "",
});

const handleTabClick = (tab: any) => {
  router.push(tab.path);
};

const handleTabRemove = (path: string) => {
  if (tabs.value.length <= 1) return;

  tabsStore.removeTab(path);

  if (path === route.path) {
    const lastTab = tabs.value[tabs.value.length - 1];
    router.push(lastTab.path);
  }
};

const handleContextMenu = (event: MouseEvent, tab: any) => {
  event.preventDefault();
  event.stopPropagation();

  console.log("Right Clock:", tab.path); // debug log

  contextMenu.visible = true;
  contextMenu.position = {
    x: event.clientX,
    y: event.clientY,
  };
  contextMenu.tabPath = tab.path;
};

// menu close
const handleMenuClose = () => {
  contextMenu.visible = false;
  contextMenu.tabPath = "";
};

const handleDragStart = (event: DragEvent, tab: any) => {
  dragTab.value = tab.path;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
  }
};

const handleDragOver = (event: DragEvent, tab: any) => {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "move";
  }
};

const handleDrop = (event: DragEvent, targetTab: any) => {
  event.preventDefault();

  const fromPath = dragTab.value;
  const toPath = targetTab.path;

  if (fromPath === toPath) return;

  const fromIndex = tabsStore.getTabIndex(fromPath);
  const toIndex = tabsStore.getTabIndex(toPath);

  if (fromIndex !== -1 && toIndex !== -1) {
    tabsStore.reorderTabs(fromIndex, toIndex);
  }
};

const handleDragEnd = () => {
  dragTab.value = "";
};

const ensureTabVisible = () => {
  if (tabsContainerRef.value) {
    const activeElement =
      tabsContainerRef.value.querySelector(".tab-item.active");
    if (activeElement) {
      activeElement.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }
};

onMounted(() => {
  setTimeout(ensureTabVisible, 100);
});
</script>

<style scoped>
.tabs-view {
  background: var(--tabs-bg);
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  overflow-x: auto;
}

.tabs-container {
  display: flex;
  align-items: center;
  min-height: 40px;
  gap: 4px;
}

.tab-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px 4px 0 0;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  min-width: 120px;
  max-width: 200px;
  position: relative;
}

.tab-item:hover {
  background: var(--el-fill-color-light);
}

.tab-item.active {
  background: var(--el-bg-color);
  border-bottom-color: var(--el-bg-color);
  color: var(--el-color-primary);
  font-weight: 500;
}

.tab-item.dragging {
  opacity: 0.5;
}

.tab-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 14px;
}

.tab-close {
  margin-left: 8px;
  padding: 2px;
  border-radius: 50%;
  transition: background-color 0.2s;
  font-size: 12px;
}

.tab-close:hover {
  background-color: var(--el-color-primary-light-7);
  color: var(--el-color-primary);
}

/* 滚动条样式 */
.tabs-view::-webkit-scrollbar {
  height: 4px;
}

.tabs-view::-webkit-scrollbar-track {
  background: var(--el-fill-color-light);
}

.tabs-view::-webkit-scrollbar-thumb {
  background: var(--el-border-color-light);
  border-radius: 2px;
}

.tabs-view::-webkit-scrollbar-thumb:hover {
  background: var(--el-text-color-placeholder);
}
</style>
