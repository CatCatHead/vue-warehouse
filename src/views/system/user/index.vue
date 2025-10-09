<template>
  <div class="users-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">User Management</h1>
        <el-text type="info"
          >Manage all the user account in this system</el-text
        >
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAddUser"
          >Add user</el-button
        >
        <el-button :icon="Refresh" @click="refreshData">Refresh</el-button>
      </div>
    </div>

    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="Username">
          <el-input
            v-model="searchForm.username"
            placeholder="Input username"
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

    <el-card>
      <template #header>
        <div class="table-header">
          <span>User list</span>
          <div class="table-actions">
            <el-text type="info"
              >In total {{ tableData.length }} entries</el-text
            >
          </div>
        </div>
      </template>

      <el-table
        :data="tableData"
        v-loading="loading"
        style="width: 100%"
        :border="true"
        stripe
      >
        <el-table-column type="selection" width="55" />

        <el-table-column label="userInfo" min-width="200">
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

        <el-table-column prop="role" label="role" width="120">
          <template #default="scope">
            <el-tag :type="getRoleType(scope.row.role)">{{
              getRoleText(scope.row.role)
            }}</el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="department" label="department" width="150" />
        <el-table-column prop="phone" label="phone" width="150" />
        <el-table-column prop="createTime" label="createTime" width="180">
          <template #default="scope">{{
            formatDate(scope.row.createTime)
          }}</template>
        </el-table-column>

        <el-table-column prop="status" label="status" width="100">
          <template #default="scope">
            <el-switch
              v-model="scope.row.status"
              :active-value="'active'"
              :inactive-value="'inactive'"
              @change="handleStatusChange(scope.row)"
            />
          </template>
        </el-table-column>

        <el-table-column label="action" width="200" fixed="right">
          <template #default="scope">
            <el-button size="small" :icon="Edit" @click="handleEdit(scope.row)"
              >Edit</el-button
            >
            <el-button
              size="small"
              :icon="Delete"
              type="danger"
              @click="handleDelete(scope.row)"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>

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
  </div>
</template>

<script setup lang="ts">
// Use English comments only
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { Plus, Refresh, Search, Edit, Delete } from "@element-plus/icons-vue";

// Global dialog manager APIs
import { addDialog, addConfirm } from "@/components/common/GDialog";
// Reuse your existing form component (or create a new one)
import UserForm from "@/components/common/Form/UserForm.vue";

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

const searchForm = reactive({ username: "", role: "", status: "" });
const tableData = ref<User[]>([]);
const loading = ref(false);
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 });

onMounted(() => loadTableData());

const loadTableData = async () => {
  loading.value = true;
  try {
    await new Promise((r) => setTimeout(r, 400));
    tableData.value = [
      {
        id: "1",
        username: "admin",
        email: "admin@example.com",
        role: "admin",
        department: "tech",
        phone: "13800138000",
        createTime: "2024-01-15T10:30:00Z",
        status: "active",
      },
      {
        id: "2",
        username: "zhangsan",
        email: "zhangsan@example.com",
        role: "editor",
        department: "content",
        phone: "13800138001",
        createTime: "2024-01-16T14:20:00Z",
        status: "active",
      },
      {
        id: "3",
        username: "lisi",
        email: "lisi@example.com",
        role: "viewer",
        department: "maintain",
        phone: "13800138002",
        createTime: "2024-01-17T09:15:00Z",
        status: "inactive",
      },
    ];
    pagination.total = tableData.value.length;
  } catch (e) {
    ElMessage.error("Failed to load users");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.currentPage = 1;
  loadTableData();
};
const handleReset = () => {
  Object.assign(searchForm, { username: "", role: "", status: "" });
  handleSearch();
};
const refreshData = () => loadTableData();

// Open "create" dialog via global dialog manager
const handleAddUser = () => {
  addDialog<{ username: string; email: string }>({
    title: "Create User",
    component: UserForm,
    props: { mode: "create" },
    width: 600,
    modal: true,
    closeOnClickModal: false,
    callBack: (p) => {
      if (p?.ok && p.data) {
        ElMessage.success("Created: " + p.data.username);
        loadTableData();
      }
    },
  });
};

// Open "edit" dialog via global dialog manager
const handleEdit = (user: User) => {
  addDialog<{ id?: string; username: string; email: string }>({
    title: "Edit User",
    component: UserForm,
    props: { mode: "edit", initial: user },
    width: 600,
    modal: true,
    closeOnClickModal: false,
    callBack: (p) => {
      if (p?.ok && p.data) {
        ElMessage.success("Updated: " + p.data.username);
        loadTableData();
      }
    },
  });
};

const handleDelete = async (user: User) => {
  // Use addConfirm helper (no need for inline MessageBox unless you prefer it)
  const ok = await addConfirm({
    title: "Confirm",
    message: `Confirm to delete "${user.username}"? This action can't reverse.`,
    confirmText: "Delete",
    cancelText: "Cancel",
  });
  if (!ok) return;
  await new Promise((r) => setTimeout(r, 300));
  ElMessage.success("Deleted!");
  loadTableData();
};

const handleStatusChange = async (user: User) => {
  try {
    await new Promise((r) => setTimeout(r, 300));
    ElMessage.success(
      `User ${user.status === "active" ? "Able" : "Disable"} successfully.`,
    );
  } catch (e) {
    user.status = user.status === "active" ? "inactive" : "active";
    ElMessage.error("Action Failed!");
  }
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  loadTableData();
};
const handleCurrentChange = (page: number) => {
  pagination.currentPage = page;
  loadTableData();
};

const getRoleType = (role: string) =>
  ({ admin: "danger", editor: "warning", viewer: "success" })[role] || "info";
const getRoleText = (role: string) =>
  ({ admin: "admin", editor: "editor", viewer: "viewer" })[role] || role;
const formatDate = (s: string) => new Date(s).toLocaleString("en");
</script>

<style src="./index.css" scoped></style>
