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
          <!-- user info -->
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

          <!-- Change password -->
          <el-dropdown-item command="changePassword">
            <el-icon><Setting /></el-icon>
            <span>Change password</span>
          </el-dropdown-item>

          <el-dropdown-item command="logout" divided>
            <el-icon><SwitchButton /></el-icon>
            <span>Log out</span>
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>

    <!-- Logout dialog -->
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

    <!-- Change password dialog -->
    <el-dialog
      v-model="changePwdDialogVisible"
      title="Change Password"
      width="480px"
      align-center
      @close="resetChangePwdForm"
    >
      <el-form
        ref="changePwdFormRef"
        :model="changePwdForm"
        :rules="changePwdRules"
        label-width="140px"
        status-icon
      >
        <el-form-item label="Old Password" prop="oldPassword">
          <el-input
            v-model="changePwdForm.oldPassword"
            type="password"
            show-password
            autocomplete="current-password"
            placeholder="Enter old password"
          />
        </el-form-item>

        <el-form-item label="New Password" prop="newPassword">
          <el-input
            v-model="changePwdForm.newPassword"
            type="password"
            show-password
            autocomplete="new-password"
            placeholder="Enter new password"
          />
        </el-form-item>

        <el-form-item label="Confirm Password" prop="confirmPassword">
          <el-input
            v-model="changePwdForm.confirmPassword"
            type="password"
            show-password
            autocomplete="new-password"
            placeholder="Confirm new password"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="changePwdDialogVisible = false">Cancel</el-button>
          <el-button
            type="primary"
            :loading="changePwdLoading"
            @click="submitChangePassword"
          >
            Save
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import {
  User,
  Setting,
  SwitchButton,
  ArrowDown,
} from "@element-plus/icons-vue";
import { useAuthStore } from "@/store/auth.ts";
import { authApi } from "@/api/auth.ts";

const router = useRouter();
const auth = useAuthStore();

// logout dialog state
const logoutDialogVisible = ref(false);
const logoutLoading = ref(false);

// change-password dialog state
const changePwdDialogVisible = ref(false);
const changePwdLoading = ref(false);
const changePwdFormRef = ref<FormInstance>();

const changePwdForm = reactive({
  oldPassword: "",
  newPassword: "",
  confirmPassword: "",
});

const changePwdRules: FormRules = {
  oldPassword: [
    { required: true, message: "Old password is required", trigger: "blur" },
  ],
  newPassword: [
    { required: true, message: "New password is required", trigger: "blur" },
    {
      min: 6,
      message: "New password must be at least 6 characters",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: "Please confirm new password",
      trigger: "blur",
    },
    {
      validator: (_rule, value, callback) => {
        if (value !== changePwdForm.newPassword) {
          callback(new Error("Passwords do not match"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
};

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
    case "changePassword":
      resetChangePwdForm();
      changePwdDialogVisible.value = true;
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

const resetChangePwdForm = () => {
  changePwdForm.oldPassword = "";
  changePwdForm.newPassword = "";
  changePwdForm.confirmPassword = "";
  if (changePwdFormRef.value) {
    changePwdFormRef.value.clearValidate();
  }
};

const submitChangePassword = () => {
  if (!changePwdFormRef.value) return;

  changePwdFormRef.value.validate(async (valid) => {
    if (!valid) return;

    changePwdLoading.value = true;
    try {
      await authApi.changePassword(
        changePwdForm.oldPassword,
        changePwdForm.newPassword,
      );
      ElMessage.success("Password changed successfully. Please log in again.");

      changePwdDialogVisible.value = false;

      auth.logout();
      router.push("/login");
    } catch (error) {
      console.error(error);
      ElMessage.error("Failed to change password");
    } finally {
      changePwdLoading.value = false;
    }
  });
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
  background-color: var(--el-color-primary-light-7);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-info-item {
  cursor: default !important;
}

.user-name {
  font-size: 14px;
  font-weight: 500;
}

.user-info-item {
  cursor: default !important;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.user-info .user-name {
  font-weight: 600;
}

.user-email,
.user-role {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
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
