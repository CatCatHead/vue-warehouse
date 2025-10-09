<template>
  <div class="user-dropdown">
    <el-dropdown
      trigger="click"
      placement="bottom-end"
      @command="handleCommand"
    >
      <span class="user-trigger">
        <el-avatar :size="32" :src="auth.user?.avatar" class="user-avatar">
          {{ auth.getDisplayName().charAt(0).toUpperCase() }}
        </el-avatar>
        <span class="user-name">{{ auth.getDisplayName() }}</span>
        <el-icon><ArrowDown /></el-icon>
      </span>

      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item disabled class="user-info-item">
            <div class="user-info">
              <div class="user-name">{{ auth.getDisplayName() }}</div>
              <div class="user-email">{{ auth.user?.email }}</div>
              <div class="user-role">Role: {{ auth.getUserRole() }}</div>
            </div>
          </el-dropdown-item>

          <el-dropdown-item command="profile">
            <el-icon><User /></el-icon>
            <span>Personal profile</span>
          </el-dropdown-item>

          <el-dropdown-item command="settings">
            <el-icon><Setting /></el-icon>
            <span>Account setting</span>
          </el-dropdown-item>

          <el-dropdown-item command="logout" divided>
            <el-icon><SwitchButton /></el-icon>
            <span>Log out</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <el-dialog
      v-model="logoutDialogVisible"
      title="Confirm"
      width="400px"
      align-center
    >
      <span>Are you sure you want to log out?</span>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="logoutDialogVisible = false">Cancel</el-button>
          <el-button
            type="primary"
            @click="confirmLogout"
            :loading="logoutLoading"
          >
            Confirm
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import {
  User,
  Setting,
  SwitchButton,
  ArrowDown,
} from "@element-plus/icons-vue";
import { useAuthStore } from "@/store/auth.ts";

const router = useRouter();
const auth = useAuthStore();

const logoutDialogVisible = ref(false);
const logoutLoading = ref(false);

const handleCommand = (command: string) => {
  switch (command) {
    case "logout":
      logoutDialogVisible.value = true;
      break;
    case "profile":
      ElMessage.info("Updating...");
      break;
    case "settings":
      ElMessage.info("Updating...");
      break;
  }
};

const confirmLogout = async () => {
  logoutLoading.value = true;

  try {
    await auth.logout();
    ElMessage.success("Log out successfully");

    router.push("/login");
  } catch (error) {
    ElMessage.error("Failed to log out");
  } finally {
    logoutLoading.value = false;
    logoutDialogVisible.value = false;
  }
};
</script>

<style scoped>
.user-dropdown {
  display: inline-block;
}

.user-trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.user-trigger:hover {
  background-color: var(--el-fill-color-light);
}

.user-avatar {
  background-color: var(--el-color-primary);
  color: white;
  font-weight: bold;
}

.user-name {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
}

.user-info-item {
  opacity: 1 !important;
  cursor: default;
}

.user-info {
  padding: 4px 0;
  min-width: 160px;
}

.user-info .user-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 2px;
}

.user-info .user-email {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin-bottom: 2px;
}

.user-info .user-role {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item--divided) {
  margin-top: 4px;
}
</style>
