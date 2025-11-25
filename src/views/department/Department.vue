<template>
  <div class="department-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Department Management</h1>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd"
          >Add Department</el-button
        >
        <el-button
          :icon="Download"
          @click="handleExportAll"
          :disabled="tableData.length === 0"
        >
          Export
        </el-button>
        <el-button :icon="Refresh" @click="refreshData">Refresh</el-button>
      </div>
    </div>

    <!-- Batch Actions Bar -->
    <div class="batch-actions" v-if="selectedItems.length > 0">
      <el-card class="batch-actions-card">
        <div class="batch-content">
          <div class="batch-info">
            <el-icon><InfoFilled /></el-icon>
            <span>Selected {{ selectedItems.length }} department(s)</span>
          </div>
          <div class="batch-buttons">
            <el-button
              size="small"
              :icon="Download"
              @click="handleExportSelected"
            >
              Export Selected
            </el-button>
            <el-button
              size="small"
              type="danger"
              :icon="Delete"
              @click="handleBatchDelete"
              :loading="batchLoading"
            >
              Delete Selected
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
        <el-form-item label="Department ID">
          <el-input
            v-model="searchForm.departmentCode"
            placeholder="Enter Department ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="Department Name">
          <el-input
            v-model="searchForm.departmentName"
            placeholder="Enter Department Name"
            clearable
            style="width: 250px"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch"
            >Search</el-button
          >
          <el-button :icon="Refresh" @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Department Table -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>Department List</span>
          <div class="table-actions">
            <el-text type="info"
              >Total {{ pagination.total }} departments</el-text
            >
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

        <!-- Department ID Column -->
        <el-table-column
          prop="departmentCode"
          label="Department ID"
          width="180"
          sortable
        />

        <!-- Department Name Column -->
        <el-table-column
          prop="departmentName"
          label="Department Name"
          min-width="200"
          sortable
        />

        <!-- Actions Column -->
        <el-table-column label="Actions" width="180" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <el-button
                size="small"
                :icon="Edit"
                type="primary"
                @click.stop="handleEdit(scope.row)"
              >
                Edit
              </el-button>
              <el-button
                size="small"
                :icon="Delete"
                type="danger"
                @click.stop="handleDelete(scope.row)"
              >
                Delete
              </el-button>
            </div>
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

    <!-- Add/Edit Department Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="500px"
      @close="cancel"
    >
      <el-form
        ref="departmentFormRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="Department ID" prop="departmentCode">
          <el-input
            v-model="form.departmentCode"
            placeholder="Enter Department ID"
            maxlength="50"
            show-word-limit
            :disabled="dialog.mode === 'edit'"
          />
        </el-form-item>

        <el-form-item label="Department Name" prop="departmentName">
          <el-input
            v-model="form.departmentName"
            placeholder="Enter Department Name"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Manager" prop="manager">
          <el-input
            v-model="form.manager"
            placeholder="Enter manager name"
            maxlength="100"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="Contact Phone" prop="contactPhone">
          <el-input
            v-model="form.contactPhone"
            placeholder="Enter contact phone"
            maxlength="20"
          />
        </el-form-item>

        <el-form-item label="Email" prop="email">
          <el-input
            v-model="form.email"
            placeholder="Enter email address"
            maxlength="100"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="cancel">Cancel</el-button>
          <el-button
            type="primary"
            @click="submitForm"
            :loading="dialog.loading"
          >
            {{ dialog.mode === "add" ? "Create" : "Update" }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Export Dialog -->
    <ExportDialog
      :visible="exportDialogVisible"
      :data="tableData"
      :selected-rows="selectedItems"
      :columns="exportColumns"
      default-filename="departments"
      @update:visible="exportDialogVisible = $event"
      @export-complete="handleExportComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Refresh,
  Search,
  Edit,
  Delete,
  Download,
  InfoFilled,
} from "@element-plus/icons-vue";

// Components
import ExportDialog from "@/components/common/ExportDialog/ExportDialog.vue";
import type { ColumnDefinition } from "@/utils/export";
import { exportToExcel, formatDateForExport } from "@/utils/export";
import { departmentApi } from "@/api/department.ts";
import { addDialog } from "@/composables/useDialog.ts";
import DepartmentForm from "@/components/common/Form/DepartmentForm.vue";

// Types
interface Department {
  id: string;
  departmentCode: string;
  departmentName: string;
}

// Reactive data
const searchForm = reactive({
  departmentCode: "",
  departmentName: "",
});

const tableData = ref<Department[]>([]);
const selectedItems = ref<Department[]>([]);
const loading = ref(false);
const batchLoading = ref(false);
const exportDialogVisible = ref(false);

// Pagination
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// Dialog management
const dialog = reactive({
  visible: false,
  title: "",
  mode: "add" as "add" | "edit",
  loading: false,
});

// Form data
const form = reactive({
  id: "",
  departmentCode: "",
  departmentName: "",
  manager: "",
  contactPhone: "",
  email: "",
});

// Form validation rules
const rules = reactive({
  departmentCode: [
    { required: true, message: "Department ID is required", trigger: "blur" },
    { min: 2, max: 50, message: "2-50 characters", trigger: "blur" },
  ],
  departmentName: [
    { required: true, message: "Department name is required", trigger: "blur" },
    { min: 2, max: 100, message: "2-100 characters", trigger: "blur" },
  ],
});

// Export column definitions
const exportColumns = computed<ColumnDefinition[]>(() => [
  { key: "departmentCode", title: "Department ID", visible: true },
  { key: "departmentName", title: "Department Name", visible: true },
]);

// Form ref
const departmentFormRef = ref();

// Lifecycle
onMounted(() => {
  loadTableData();
});

/**
 * Load department data
 */
const loadTableData = async () => {
  loading.value = true;
  try {
    const response = await departmentApi.getDepartments({
      page: pagination.currentPage,
      size: pagination.pageSize,
      departmentCode: searchForm.departmentCode,
      departmentName: searchForm.departmentName,
    });

    tableData.value = response.list;
    pagination.total = response.total;
  } catch (error) {
    ElMessage.error("Failed to load linen items");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

/**
 * Handle table selection change
 */
const handleSelectionChange = (selection: Department[]) => {
  selectedItems.value = selection;
};

/**
 * Clear all selections
 */
const clearSelection = () => {
  selectedItems.value = [];
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
  searchForm.departmentCode = "";
  searchForm.departmentName = "";
  pagination.currentPage = 1;
  loadTableData();
};

/**
 * Refresh table data
 */
const refreshData = () => {
  loadTableData();
};

/**
 * Handle add department
 */
const handleAdd = () => {
  addDialog({
    title: "Add Department",
    component: DepartmentForm,
    props: { mode: "add" },
    width: 600,
    closeOnClickModal: false,
    callBack: async (payload: any) => {
      if (!payload?.ok || !payload.data) return;
      try {
        await departmentApi.createDepartment(payload.data);
        ElMessage.success("Department created successfully.");
        await loadTableData();
      } catch (error) {
        console.log(error);
        ElMessage.error("Failed to create department");
      }
    },
  });
};

/**
 * Handle edit department
 */
const handleEdit = (row: Department) => {
  addDialog({
    title: "Edit Department",
    component: DepartmentForm,
    props: { mode: "edit", initial: row },
    width: 600,
    closeOnClickModal: false,
    callBack: async (payload: any) => {
      if (!payload.ok || !payload.data) return;
      try {
        await departmentApi.updateDepartment(row.id, payload.data);
        ElMessage.success("Department updated successfully.");
        await loadTableData();
      } catch (error) {
        console.error(error);
        ElMessage.error("Failed to update department");
      }
    },
  });
};

/**
 * Handle individual department deletion
 */
const handleDelete = async (row: Department) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete this Department ${row.id}?`,
      "Confirm Delete",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      },
    );

    await departmentApi.deleteDepartment(row.id);
    ElMessage.success("Department deleted successfully.");
    await loadTableData();
  } catch (error) {
    console.log(error);
    ElMessage.error("Failed to delete department");
  }
};

/**
 * Handle batch deletion
 */
const handleBatchDelete = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning("Please select at least one department");
    return;
  }

  try {
    const confirmed = await ElMessageBox.confirm(
      `Are you sure to delete ${selectedItems.value.length} selected department(s)?`,
      "Confirm Batch Delete",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      },
    );

    if (!confirmed) return;

    batchLoading.value = true;

    // TODO: Replace with actual API call
    // const ids = selectedItems.value.map(item => item.id);
    // await departmentApi.batchDeleteDepartments(ids);

    ElMessage.success(
      `${selectedItems.value.length} department(s) deleted successfully`,
    );
    clearSelection();
    await loadTableData();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("Failed to delete selected departments");
    }
  } finally {
    batchLoading.value = false;
  }
};

/**
 * Handle form submission
 */
const submitForm = async () => {
  if (!departmentFormRef.value) return;

  try {
    dialog.loading = true;

    // Validate form
    await departmentFormRef.value.validate();

    // TODO: Replace with actual API call
    if (dialog.mode === "add") {
      // await departmentApi.createDepartment(form);
      ElMessage.success("Department created successfully");
    } else {
      // await departmentApi.updateDepartment(form.id, form);
      ElMessage.success("Department updated successfully");
    }

    dialog.visible = false;
    await loadTableData();
  } catch (error) {
    console.error("Form submission failed:", error);
    ElMessage.error("Failed to save department");
  } finally {
    dialog.loading = false;
  }
};

/**
 * Handle dialog cancel
 */
const cancel = () => {
  dialog.visible = false;
  departmentFormRef.value?.resetFields();
};

/**
 * Handle pagination size change
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadTableData();
};

/**
 * Handle pagination page change
 */
const handleCurrentChange = (page: number) => {
  pagination.currentPage = page;
  loadTableData();
};

// Export methods
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
      "departments_quick_export",
    );
    ElMessage.success("Departments exported successfully");
  } catch (error) {
    console.error("Quick export failed:", error);
    ElMessage.error("Failed to export departments");
  }
};

/**
 * Export all departments
 */
const handleExportAll = () => {
  handleOpenExport();
};

/**
 * Export selected departments only
 */
const handleExportSelected = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning("Please select departments to export");
    return;
  }
  exportDialogVisible.value = true;
};

/**
 * Handle export completion
 */
const handleExportComplete = () => {
  // Optional cleanup after export
};

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

<style scoped src="./Department.css"></style>
