<template>
  <div class="user-management">
    <!-- Use the generic DataTable component -->
    <DataTable
      :data="tableData"
      :columns="columns"
      :loading="loading"
      :total="total"
      :page="pagination.currentPage"
      :size="pagination.pageSize"
      title="User Management"
      show-search
      show-refresh
      show-selection
      show-index
      @search="handleSearch"
      @refresh="handleRefresh"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
      @edit="handleEdit"
      @delete="handleDelete"
    >
      <!-- Custom column for user info -->
      <template #column-userInfo="{ row }">
        <div class="user-cell">
          <el-avatar :size="40" :src="row.avatar" class="user-avatar">
            {{ row.username?.charAt(0).toUpperCase() }}
          </el-avatar>
          <div class="user-info">
            <div class="username">{{ row.username }}</div>
            <div class="email">{{ row.email }}</div>
          </div>
        </div>
      </template>

      <!-- Custom column for status -->
      <template #column-status="{ row }">
        <el-switch
          v-model="row.status"
          :active-value="'active'"
          :inactive-value="'inactive'"
          @change="handleStatusChange(row)"
        />
      </template>

      <!-- Header right slot for additional actions -->
      <template #header-right>
        <el-button type="primary" :icon="Plus" @click="handleAddUser">
          Add User
        </el-button>
      </template>
    </DataTable>

    <!-- User Dialog -->
    <UserDialog
      v-model="dialogVisible"
      :user-data="currentUser"
      :mode="dialogMode"
      @success="handleDialogSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus } from "@element-plus/icons-vue";
import DataTable from "@/components/common/Table/DataTable.vue";
import UserDialog from "./components/UserDialog.vue";
import { useTable } from "@/composables/useTable";

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  department: string;
  phone: string;
  createTime: string;
  status: "active" | "inactive";
}

// Table configuration
const columns = reactive([
  {
    prop: "userInfo",
    label: "User Info",
    minWidth: 200,
  },
  {
    prop: "role",
    label: "Role",
    width: 120,
    formatter: (row: User) => {
      const roleMap: { [key: string]: string } = {
        admin: "Admin",
        editor: "Editor",
        viewer: "Viewer",
      };
      return roleMap[row.role] || row.role;
    },
  },
  {
    prop: "department",
    label: "Department",
    width: 150,
  },
  {
    prop: "phone",
    label: "Phone",
    width: 150,
  },
  {
    prop: "createTime",
    label: "Create Time",
    width: 180,
    formatter: (row: User) => {
      return new Date(row.createTime).toLocaleString("en-US");
    },
  },
  {
    prop: "status",
    label: "Status",
    width: 100,
  },
]);

// Use table composable
const {
  loading,
  tableData,
  total,
  pagination,
  handleSearch,
  handleRefresh,
  handlePageChange,
  handleSizeChange,
} = useTable({
  fetchData: async (params) => {
    // Mock API call - replace with real API later
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const mockData: User[] = [
      {
        id: "1",
        username: "admin",
        email: "admin@example.com",
        role: "admin",
        department: "Tech",
        phone: "13800138000",
        createTime: "2024-01-15T10:30:00Z",
        status: "active",
      },
      {
        id: "2",
        username: "johndoe",
        email: "john@example.com",
        role: "editor",
        department: "Content",
        phone: "13800138001",
        createTime: "2024-01-16T14:20:00Z",
        status: "active",
      },
    ];

    return {
      data: mockData,
      total: mockData.length,
    };
  },
});

// Dialog management
const dialogVisible = ref(false);
const dialogMode = ref<"add" | "edit">("add");
const currentUser = ref<User | null>(null);

// Event handlers
const handleAddUser = () => {
  dialogMode.value = "add";
  currentUser.value = null;
  dialogVisible.value = true;
};

const handleEdit = (user: User) => {
  dialogMode.value = "edit";
  currentUser.value = { ...user };
  dialogVisible.value = true;
};

const handleDelete = async (user: User) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure to delete user "${user.username}"?`,
      "Delete Confirmation",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      },
    );

    // Mock delete operation
    await new Promise((resolve) => setTimeout(resolve, 500));
    ElMessage.success("User deleted successfully");
    handleRefresh();
  } catch (error) {
    // User canceled deletion
  }
};

const handleStatusChange = async (user: User) => {
  try {
    // Mock API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    ElMessage.success(
      `User ${user.status === "active" ? "enabled" : "disabled"} successfully`,
    );
  } catch (error) {
    // Revert status on error
    user.status = user.status === "active" ? "inactive" : "active";
    ElMessage.error("Operation failed");
  }
};

const handleDialogSuccess = () => {
  dialogVisible.value = false;
  handleRefresh();
};
</script>

<style scoped>
.user-management {
  padding: 0;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  background-color: var(--el-color-primary);
  color: white;
  font-weight: bold;
  flex-shrink: 0;
}

.user-info .username {
  font-weight: 600;
  margin-bottom: 4px;
}

.user-info .email {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
