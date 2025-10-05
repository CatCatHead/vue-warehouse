<template>
  <el-container class="layout-container">
    <el-header class="header">
      <div class="header-left">
        <h2>{{ appTitle }}</h2>
      </div>
      <div class="header-right">
        <span>Welcome, Admin</span>
      </div>
    </el-header>

    <el-container>
      <el-aside width="200px" class="sidebar">
        <el-menu
            default-active="1"
            class="sidebar-menu"
            router
            :default-openeds="['1']"
        >
          <el-sub-menu index="1">
            <template #title>
              <el-icon><location /></el-icon>
              <span>Navigation</span>
            </template>
            <el-menu-item index="/" route="/">
              <el-icon><house /></el-icon>
              <span>Home</span>
            </el-menu-item>
            <el-menu-item index="/about" route="/about">
              <el-icon><info-filled /></el-icon>
              <span>About</span>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-aside>

      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { APP_CONFIG } from '@/constants/app'
import { Location, House, InfoFilled } from '@element-plus/icons-vue'

const appTitle = APP_CONFIG.TITLE
</script>

<style scoped>
.layout-container {
  height: 100vh;
}

.header {
  background-color: #409eff;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header h2 {
  margin: 0;
}

.sidebar {
  background-color: #fff;
  border-right: 1px solid #e6e6e6;
}

.sidebar-menu {
  border: none;
}

.main-content {
  background-color: #f5f7fa;
  padding: 20px;
}
</style>