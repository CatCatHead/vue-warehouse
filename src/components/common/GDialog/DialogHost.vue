<template>
  <!-- Only render dialogs that belong to current route (item.show) -->
  <el-dialog
    v-for="item in dialogList"
    :key="item.id"
    v-show="item.show"
    v-model="item.visible"
    :title="item.title"
    :width="item.width"
    :top="item.top"
    :append-to-body="item.appendToBody"
    :modal="item.modal"
    :close-on-click-modal="item.closeOnClickModal"
    :destroy-on-close="item.destroyOnClose"
    :z-index="item.zIndex"
    :closable="item.closable ?? true"
    :close-on-press-escape="item.closeOnPressEscape ?? true"
    :class="item.customClass"
    @close="() => nativeClose(item.id)"
    @keydown.esc="handleEscKey(item)"
  >
    <component
      :is="item.component"
      v-bind="item.props"
      @close="(payload) => closeDialogById(item.id, payload)"
    />
  </el-dialog>
</template>

<script setup lang="ts">
// Use English comments only
import { onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import {
  dialogList,
  closeDialogById,
  nativeClose,
} from "@/composables/useDialog";

/**
 * Route isolation logic:
 * - When a dialog is created, we record the current route path into item.pathKey.
 * - We set item.show = (item.pathKey === currentPath).
 * - On route changes, recompute item.show for all dialogs.
 *
 * This way, dialogs opened on /users won't accidentally appear on /settings, etc.
 */
const router = useRouter();

// Handle ESC key for dialogs that allow it
const handleEscKey = (item: any) => {
  if (item.closeOnPressEscape !== false) {
    nativeClose(item.id);
  }
};

onMounted(() => {
  const currentPath = router.currentRoute.value.path;
  dialogList.forEach((d) => {
    // if pathKey not set yet (opened before host mounted), set it to current route
    if (!d.pathKey) d.pathKey = currentPath;
    d.show = d.pathKey === currentPath;
  });
});

watch(
  () => router.currentRoute.value.path,
  (path) => {
    dialogList.forEach((d) => {
      if (!d.pathKey) d.pathKey = path; // fallback
      d.show = d.pathKey === path;
    });
  },
  { immediate: true },
);
</script>
