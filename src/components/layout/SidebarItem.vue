<template>
  <!-- 隐藏路由不渲染 -->
  <template v-if="!item.meta || !item.meta.hidden">
    <el-sub-menu v-if="hasChildren && showAsGroup" :index="fullPath">
      <template #title>
        <el-icon v-if="iconName">
          <component :is="iconName" />
        </el-icon>
        <span>{{ item.meta?.title }}</span>
      </template>

      <SidebarItem
        v-for="child in visibleChildren"
        :key="child.path"
        :item="child"
        :base-path="fullPath"
      />
    </el-sub-menu>

    <template v-else-if="hasChildren">
      <SidebarItem
        v-for="child in visibleChildren"
        :key="child.path"
        :item="child"
        :base-path="fullPath"
      />
    </template>

    <el-menu-item v-else :index="fullPath">
      <el-icon v-if="iconName">
        <component :is="iconName" />
      </el-icon>
      <span>{{ item.meta?.title }}</span>
    </el-menu-item>
  </template>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { RouteRecordRaw } from "vue-router";

defineOptions({ name: "SidebarItem" });

const props = defineProps<{
  item: RouteRecordRaw;
  basePath?: string;
}>();

const basePath = computed(() => props.basePath ?? "");

function resolvePath(parentPath: string, routePath: string): string {
  if (!routePath) return parentPath || "/";
  if (routePath.startsWith("/")) return routePath;
  if (!parentPath || parentPath === "/") return `/${routePath}`;
  return `${parentPath.replace(/\/$/, "")}/${routePath}`;
}

const fullPath = computed(() =>
  resolvePath(basePath.value, props.item.path as string),
);

const visibleChildren = computed<RouteRecordRaw[]>(() =>
  (props.item.children || []).filter(
    (child) => !(child.meta && (child.meta as any).hidden),
  ),
);

const hasChildren = computed(() => visibleChildren.value.length > 0);

const showAsGroup = computed(() => !!props.item.meta?.title);

const iconName = computed(() => {
  const icon = props.item.meta?.icon as any;
  if (!icon) return "";
  if (typeof icon === "string") return icon;
  return icon;
});
</script>
