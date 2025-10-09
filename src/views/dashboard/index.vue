<!-- views/system/user/index.vue -->
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

      <GTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        selection
        index
        @selection-change="handleSelectionChange"
        @page-change="handlePageChange"
        @edit="handleEdit"
        @delete="handleDelete"
      >
        <template #userInfo="{ row }">
          <div class="user-cell">
            <el-avatar :size="40" :src="row.avatar" class="user-avatar">
              {{ row.username.charAt(0).toUpperCase() }}
            </el-avatar>
            <div class="user-info">
              <div class="username">{{ row.username }}</div>
              <div class="email">{{ row.email }}</div>
            </div>
          </div>
        </template>

        <template #role="{ row }">
          <el-tag :type="getRoleType(row.role)">
            {{ getRoleText(row.role) }}
          </el-tag>
        </template>

        <template #createTime="{ row }">
          {{ formatDate(row.createTime) }}
        </template>

        <template #status="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="'active'"
            :inactive-value="'inactive'"
            @change="handleStatusChange(row)"
          />
        </template>

        <template #actions="{ row }">
          <el-button size="small" :icon="Edit" @click="handleEdit(row)"
            >Edit</el-button
          >
          <el-button
            size="small"
            :icon="Delete"
            type="danger"
            @click="handleDelete(row)"
            >Delete</el-button
          >
        </template>
      </GTable>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Plus, Refresh, Search, Edit, Delete } from "@element-plus/icons-vue";
import { addDialog, addConfirm } from "@/components/common/GDialog";
import UserForm from "@/components/common/Form/UserForm.vue";
import GTable from "@/components/common/GTable/GTable.vue";

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

const columns = [
  {
    prop: "userInfo",
    label: "User Info",
    minWidth: 200,
    slot: "userInfo",
  },
  {
    prop: "role",
    label: "Role",
    width: 120,
    slot: "role",
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
    slot: "createTime",
  },
  {
    prop: "status",
    label: "Status",
    width: 100,
    slot: "status",
  },
];

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

const handleSelectionChange = (selection: any[]) => {
  console.log("Selected rows:", selection);
};

const handlePageChange = (newPagination: any) => {
  Object.assign(pagination, newPagination);
  loadTableData();
};

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

const getRoleType = (role: string) =>
  ({ admin: "danger", editor: "warning", viewer: "success" })[role] || "info";
const getRoleText = (role: string) =>
  ({ admin: "admin", editor: "editor", viewer: "viewer" })[role] || role;
const formatDate = (s: string) => new Date(s).toLocaleString("en");
</script>

<style src="./index.css" scoped></style>
