<template>
  <div class="users-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">User Management</h1>
        <el-text type="info">Manage all user accounts in the system</el-text>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAddUser"
          >Add User</el-button
        >
        <el-button
          :icon="Download"
          @click="handleOpenExport"
          :disabled="tableData.length === 0"
        >
          Export
        </el-button>
        <el-button :icon="Refresh" @click="refreshData">Refresh</el-button>
      </div>
    </div>

    <!-- Batch Actions Bar -->
    <div class="batch-actions" v-if="selectedUsers.length > 0">
      <el-card class="batch-actions-card">
        <div class="batch-content">
          <div class="batch-info">
            <el-icon><InfoFilled /></el-icon>
            <span>Selected {{ selectedUsers.length }} user(s)</span>
          </div>
          <div class="batch-buttons">
            <el-button
              size="small"
              :icon="Check"
              @click="handleBatchAction('activate')"
              :loading="batchLoading.activate"
            >
              Activate Selected
            </el-button>
            <el-button
              size="small"
              :icon="Close"
              @click="handleBatchAction('deactivate')"
              :loading="batchLoading.deactivate"
            >
              Deactivate Selected
            </el-button>
            <el-button
              size="small"
              type="danger"
              :icon="Delete"
              @click="handleBatchAction('delete')"
              :loading="batchLoading.delete"
            >
              Delete Selected
            </el-button>

            <el-button
              size="small"
              :icon="Download"
              @click="handleExportSelected"
            >
              Export Selected
            </el-button>

            <el-button size="small" link @click="clearSelection">
              Clear Selection
            </el-button>
          </div>
        </div>
      </el-card>
    </div>

    <!-- Search Card -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="Username">
          <el-input
            v-model="searchForm.username"
            placeholder="Enter username"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="User Role">
          <el-select
            v-model="searchForm.role"
            placeholder="Select role"
            clearable
            style="width: 150px"
          >
            <el-option label="Admin" value="admin" />
            <el-option label="Editor" value="editor" />
            <el-option label="Viewer" value="viewer" />
          </el-select>
        </el-form-item>

        <el-form-item label="Department">
          <el-input
            v-model="searchForm.department"
            placeholder="Enter department"
            clearable
            style="width: 180px"
          />
        </el-form-item>

        <el-form-item label="Create Time">
          <el-date-picker
            v-model="searchForm.createTimeRange"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            value-format="YYYY-MM-DD"
            style="width: 240px"
          />
        </el-form-item>

        <el-form-item label="Status">
          <el-select
            v-model="searchForm.status"
            placeholder="Select status"
            clearable
            style="width: 120px"
          >
            <el-option label="Active" value="active" />
            <el-option label="Inactive" value="inactive" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch"
            >Search</el-button
          >
          <el-button :icon="Refresh" @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- User Table -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>User List</span>
          <div class="table-actions">
            <el-text type="info">Total {{ tableData.length }} entries</el-text>
            <el-button
              size="small"
              :icon="Download"
              @click="handleQuickExport"
              :disabled="tableData.length === 0"
            >
              Quick Export
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        :border="true"
        stripe
        @selection-change="handleSelectionChange"
      >
        <!-- Selection Column -->
        <el-table-column type="selection" width="55" />

        <!-- User Info Column -->
        <el-table-column label="User Info" min-width="200">
          <template #default="scope">
            <div class="user-cell">
              <el-avatar :size="40" :src="scope.row.avatar" class="user-avatar">
                {{ scope.row.username.charAt(0).toUpperCase() }}
              </el-avatar>
              <div class="user-info">
                <div class="username">{{ scope.row.username }}</div>
                <div class="email">{{ scope.row.email }}</div>
              </div>
            </div>
          </template>
        </el-table-column>

        <!-- Role Column -->
        <el-table-column prop="role" label="Role" width="120">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)">{{
              getRoleText(scope.row.role)
            }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="department" label="Department" width="150" />
        <el-table-column prop="phone" label="Phone" width="150" />

        <!-- Create Time Column -->
        <el-table-column prop="createTime" label="Create Time" width="180">
          <template #default="scope">{{
            formatDate(scope.row.createTime)
          }}</template>
        </el-table-column>

        <!-- Status Column -->
        <el-table-column prop="status" label="Status" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="'active'"
              :inactive-value="'inactive'"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>

        <!-- Actions Column -->
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" :icon="Edit" @click="handleEdit(scope.row)">
              Edit
            </el-button>
            <el-button
              size="small"
              :icon="Delete"
              type="danger"
              @click="handleDelete(scope.row)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
    <!-- Export Dialog -->
    <ExportDialog
      :visible="exportDialogVisible"
      :data="tableData"
      :selected-rows="selectedUsers"
      :columns="exportColumns"
      :default-filename="users"
      @update:visible="exportDialogVisible = $event"
      @export-complete="handleExportComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { userApi, type User as ApiUser } from "@/api/user";
import {
  Plus,
  Refresh,
  Search,
  Edit,
  Delete,
  Check,
  Close,
  InfoFilled,
  Download,
} from "@element-plus/icons-vue";

// Global dialog manager APIs
import { addDialog, addConfirm } from "@/components/common/GDialog";
// Reuse your existing form component
import UserForm from "@/components/common/Form/UserForm.vue";

// Import export functionality
import ExportDialog from "@/components/common/ExportDialog/ExportDialog.vue";
import type { ColumnDefinition } from "@/utils/export";
import {
  exportToCSV,
  exportToExcel,
  formatDateForExport,
  formatStatusForExport,
} from "@/utils/export";

// Export dialog state
const exportDialogVisible = ref(false);
const tableRef = ref();

// Export column definitions
const exportColumns = computed<ColumnDefinition[]>(() => [
  { key: "username", title: "Username", visible: true },
  { key: "email", title: "Email", visible: true },
  { key: "role", title: "Role", visible: true, formatter: getRoleText },
  { key: "department", title: "Department", visible: true },
  { key: "phone", title: "Phone", visible: true },
  {
    key: "createTime",
    title: "Create Time",
    visible: true,
    formatter: formatDateForExport,
  },
  {
    key: "status",
    title: "Status",
    visible: true,
    formatter: formatStatusForExport,
  },
]);

/**
 * Open export dialog
 */
const handleOpenExport = () => {
  exportDialogVisible.value = true;
};

/**
 * Quick export without dialog
 */
const handleQuickExport = async () => {
  try {
    await exportToExcel(
      tableData.value,
      exportColumns.value,
      "users_quick_export",
    );
    ElMessage.success("Users exported successfully");
  } catch (error) {
    console.error("Quick export failed:", error);
    ElMessage.error("Failed to export users");
  }
};

/**
 * Export selected users only
 */
const handleExportSelected = () => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning("Please select users to export");
    return;
  }

  try {
    exportToExcel(selectedUsers.value, exportColumns.value, "users_selected");
    ElMessage.success(`Exported ${selectedUsers.value.length} selected users`);
  } catch (error) {
    console.error("Selected users export failed:", error);
    ElMessage.error("Failed to export selected users");
  }
};

/**
 * Handle export completion
 */
const handleExportComplete = () => {
  // Optionally clear selection after export
  // clearSelection()
};

type User = ApiUser;

// Reactive data
const searchForm = reactive({
  username: "",
  role: "",
  department: "",
  status: "",
  createTimeRange: [] as string[],
});
const tableData = ref<User[]>([]);
const selectedUsers = ref<User[]>([]);
const loading = ref(false);
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 });

// Batch operations loading states
const batchLoading = reactive({
  activate: false,
  deactivate: false,
  delete: false,
});

// Load table data on component mount
onMounted(() => loadTableData());

/**
 * Load user data from API or mock
 */
const loadTableData = async () => {
  loading.value = true;
  try {
    let createTimeStart: string | undefined;
    let createTimeEnd: string | undefined;

    if (searchForm.createTimeRange && searchForm.createTimeRange.length === 2) {
      createTimeStart = searchForm.createTimeRange[0];
      createTimeEnd = searchForm.createTimeRange[1];
    }

    const response = await userApi.getUserList({
      page: pagination.currentPage,
      size: pagination.pageSize,
      username: searchForm.username || undefined,
      role: searchForm.role || undefined,
      department: searchForm.department || undefined,
      status: searchForm.status || undefined,
      createTimeStart,
      createTimeEnd,
    });

    tableData.value = Array.isArray(response.list) ? response.list : [];
    pagination.total = response.total || 0;
  } catch (error) {
    console.error("Failed to load users:", error);
    ElMessage.error("Failed to load user data");
    tableData.value = [];
    pagination.total = 0;
  } finally {
    loading.value = false;
  }
};

/**
 * Handle table selection change
 */
const handleSelectionChange = (selection: User[]) => {
  selectedUsers.value = selection;
};

/**
 * Clear all selections
 */
const clearSelection = () => {
  selectedUsers.value = [];
  // If you're using a table ref, you can also clear selection visually
  // tableRef.value?.clearSelection();
};

/**
 * Handle batch actions (activate, deactivate, delete)
 */
const handleBatchAction = async (
  action: "activate" | "deactivate" | "delete",
) => {
  if (selectedUsers.value.length === 0) {
    ElMessage.warning("Please select at least one user");
    return;
  }

  const actionMap = {
    activate: {
      title: "Activate Users",
      message: `Are you sure you want to activate ${selectedUsers.value.length} user(s)?`,
      confirmText: "Activate",
      loadingKey: "activate" as const,
      successMessage: "Users activated successfully",
    },
    deactivate: {
      title: "Deactivate Users",
      message: `Are you sure you want to deactivate ${selectedUsers.value.length} user(s)?`,
      confirmText: "Deactivate",
      loadingKey: "deactivate" as const,
      successMessage: "Users deactivated successfully",
    },
    delete: {
      title: "Delete Users",
      message: `Are you sure you want to delete ${selectedUsers.value.length} user(s)? This action cannot be undone.`,
      confirmText: "Delete",
      loadingKey: "delete" as const,
      successMessage: "Users deleted successfully",
    },
  };

  const ids = selectedUsers.value.map((u) => u.id);
  const config = actionMap[action];

  try {
    const confirmed = await addConfirm({
      title: config.title,
      message: config.message,
      confirmText: config.confirmText,
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    if (action === "delete") {
      await userApi.batchDeleteUsers(ids);
    } else {
      const newStatus: "active" | "inactive" =
        action === "activate" ? "active" : "inactive";

      await Promise.all(
        ids.map((id) => userApi.updateUser(id, { status: newStatus })),
      );
    }

    ElMessage.success(config.successMessage);
    clearSelection();
    await loadTableData();
  } catch (e) {
    console.error(e);
    ElMessage.error(`Failed to ${action} users`);
  }
};

/**
 * Handle individual user status change
 */
const handleStatusChange = async (row: User) => {
  const original = row.status;
  try {
    await userApi.updateUser(row.id, { status: row.status });
    const action = row.status === "active" ? "activated" : "deactivated";
    ElMessage.success(`User ${action} successfully`);
  } catch (e) {
    console.error(e);
    row.status = original;
    ElMessage.error("Failed to update user status");
  }
};

/**
 * Handle search
 */
const handleSearch = () => {
  pagination.currentPage = 1;
  loadTableData();
};

/**
 * Handle reset search form
 */
const handleReset = () => {
  Object.assign(searchForm, {
    username: "",
    role: "",
    department: "",
    status: "",
    createTimeRange: [],
  });
  pagination.currentPage = 1;
  loadTableData();
};

/**
 * Refresh table data
 */
const refreshData = () => loadTableData();

/**
 * Open add user dialog
 */
const handleAddUser = () => {
  addDialog({
    title: "Create User",
    component: UserForm,
    props: { mode: "add" },
    width: 600,
    closeOnClickModal: false,
    callBack: async (payload: any) => {
      if (!payload?.ok || !payload.data) return;

      try {
        await userApi.createUser(payload.data);
        ElMessage.success("User created successfully");
        await loadTableData();
      } catch (e) {
        console.error(e);
        ElMessage.error("Failed to create user");
      }
    },
  });
};

/**
 * Open edit user dialog
 */
const handleEdit = (row: User) => {
  addDialog({
    title: "Edit User",
    component: UserForm,
    props: { mode: "edit", initial: row },
    width: 600,
    closeOnClickModal: false,
    callBack: async (payload: any) => {
      if (!payload?.ok || !payload.data) return;
      try {
        await userApi.updateUser(row.id, payload.data);
        ElMessage.success("User updated successfully");
        await loadTableData();
      } catch (e) {
        console.error(e);
        ElMessage.error("Failed to update user");
      }
    },
  });
};

/**
 * Handle individual user deletion
 */
const handleDelete = async (row: User) => {
  const confirmed = await addConfirm({
    title: "Confirm Delete",
    message: `Delete user "${row.username}"? This action cannot be undone.`,
    confirmText: "Delete",
    cancelText: "Cancel",
  });
  if (!confirmed) return;

  try {
    await userApi.deleteUser(row.id);
    ElMessage.success("User deleted successfully");
    await loadTableData();
  } catch (e) {
    console.error(e);
    ElMessage.error("Failed to delete user");
  }
};

/**
 * Handle pagination size change
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  loadTableData();
};

/**
 * Handle pagination page change
 */
const handleCurrentChange = (page: number) => {
  pagination.currentPage = page;
  loadTableData();
};

/**
 * Get role type for tag styling
 */
const getRoleType = (role: string) =>
  ({ admin: "danger", editor: "warning", viewer: "success" })[role] || "info";

/**
 * Get display text for role
 */
const getRoleText = (role: string) =>
  ({ admin: "Admin", editor: "Editor", viewer: "Viewer" })[role] || role;

/**
 * Format date for display
 */
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
</script>

<style src="./index.css" scoped></style>
