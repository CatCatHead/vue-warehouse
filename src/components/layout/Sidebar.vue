<template>
  <div>
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
        <el-menu-item index="/trackingNumber">
          <el-icon><InfoFilled /></el-icon>
          <span>Tracking Number</span>
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item index="/about">
        <el-icon><InfoFilled /></el-icon>
        <span>About</span>
      </el-menu-item>

      <el-menu-item index="/permtest">
        <el-icon><InfoFilled /></el-icon>
        <span>Permission Test</span>
      </el-menu-item>

      <el-menu-item index="/echart">
        <el-icon><PieChart /></el-icon>
        <span>Echart</span>
      </el-menu-item>

      <el-menu-item index="/linens">
        <el-icon><InfoFilled /></el-icon>
        <span>Linens</span>
      </el-menu-item>

      <el-menu-item index="/DeliveryList">
        <el-icon><InfoFilled /></el-icon>
        <span>Delivery List</span>
      </el-menu-item>

      <el-menu-item index="/DeliveryListUpload">
        <el-icon><InfoFilled /></el-icon>
        <span>Delivery List Upload</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useLayoutStore } from "@/store/layout";
import { Odometer, Setting, User, InfoFilled } from "@element-plus/icons-vue";

const route = useRoute();
const layoutStore = useLayoutStore();

const currentRoute = computed(() => route.path);
</script>

<style scoped>
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

.sidebar-menu {
  border: none;
}

.sidebar-menu:not(.el-menu--collapse) {
  width: 200px;
}
</style>
