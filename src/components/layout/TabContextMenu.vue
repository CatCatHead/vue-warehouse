<!-- src/components/layout/TabContextMenu.vue -->
<template>
  <transition name="fade">
    <div
      v-if="visible"
      class="tab-context-menu"
      :style="menuStyle"
      @click.stop
      @contextmenu.stop.prevent
    >
      <div class="menu-item" @click="handleCloseCurrent">
        <el-icon><Close /></el-icon>
        <span>Close Current Tab</span>
      </div>

      <div class="menu-item" @click="handleCloseOthers">
        <el-icon><FolderDelete /></el-icon>
        <span>Close Other Tabs</span>
      </div>

      <div class="menu-item" @click="handleCloseLeft">
        <el-icon><Back /></el-icon>
        <span>Close All Left Tabs</span>
      </div>

      <div class="menu-item" @click="handleCloseRight">
        <el-icon><Right /></el-icon>
        <span>Close All Right Tabs</span>
      </div>

      <el-divider class="menu-divider" />

      <div class="menu-item" @click="handleCloseAll">
        <el-icon><Remove /></el-icon>
        <span>Close All Tabs</span>
      </div>
    </div>
  </transition>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter } from "vue-router";
import { useTabsStore } from "@/store/tabs";
import {
  Close,
  FolderDelete,
  Back,
  Right,
  Remove,
} from "@element-plus/icons-vue";

interface Props {
  visible: boolean;
  position: { x: number; y: number };
  tabPath: string;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "close"): void;
}>();

const router = useRouter();
const tabsStore = useTabsStore();

const menuStyle = ref({
  left: "0px",
  top: "0px",
});

watch(
  () => props.position,
  (newPosition) => {
    if (newPosition) {
      menuStyle.value = {
        left: `${newPosition.x}px`,
        top: `${newPosition.y}px`,
      };
    }
  },
  { immediate: true },
);

const closeMenu = () => {
  emit("update:visible", false);
  emit("close");
};

const handleCloseCurrent = () => {
  console.log("Close current:", props.tabPath);
  if (tabsStore.tabs.length <= 1) {
    closeMenu();
    return;
  }

  const currentIndex = tabsStore.getTabIndex(props.tabPath);
  tabsStore.removeTab(props.tabPath);

  if (props.tabPath === tabsStore.activeTab) {
    const newIndex = Math.min(currentIndex, tabsStore.tabs.length - 1);
    if (newIndex >= 0) {
      const newActiveTab = tabsStore.tabs[newIndex];
      router.push(newActiveTab.path);
    }
  }

  closeMenu();
};

const handleCloseOthers = () => {
  console.log("Close other:", props.tabPath);
  tabsStore.closeOtherTab(props.tabPath);
  router.push(props.tabPath);
  closeMenu();
};

const handleCloseLeft = () => {
  console.log("Close left:", props.tabPath);
  tabsStore.closeLeftTabs(props.tabPath);
  closeMenu();
};

const handleCloseRight = () => {
  console.log("Close right:", props.tabPath);
  tabsStore.closeRightTabs(props.tabPath);
  closeMenu();
};

const handleCloseAll = () => {
  console.log("Close All");
  tabsStore.closeAllTabs();
  if (tabsStore.tabs.length > 0) {
    router.push(tabsStore.tabs[0].path);
  }
  closeMenu();
};

const handleClickOutside = (event: MouseEvent) => {
  const menu = document.querySelector(".tab-context-menu");
  if (menu && !menu.contains(event.target as Node)) {
    closeMenu();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    closeMenu();
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("contextmenu", handleClickOutside);
  document.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("contextmenu", handleClickOutside);
  document.removeEventListener("keydown", handleKeydown);
});
</script>

<style scoped>
.tab-context-menu {
  position: fixed;
  background: white;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  z-index: 9999;
  padding: 4px 0;
  min-width: 140px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  transition: background-color 0.2s;
}

.menu-item:hover {
  background-color: #f5f7fa;
}

.menu-item .el-icon {
  margin-right: 8px;
  font-size: 14px;
}

.menu-divider {
  margin: 4px 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
