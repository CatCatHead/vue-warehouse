<template>
  <div class="item-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Item Management</h1>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAdd"
          >Add Item</el-button
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
            <span>Selected {{ selectedItems.length }} item(s)</span>
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
        <el-form-item label="Item ID">
          <el-input
            v-model="searchForm.itemId"
            placeholder="Enter Item ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="Item Description">
          <el-input
            v-model="searchForm.itemDescription"
            placeholder="Enter Item Description"
            clearable
            style="width: 250px"
          />
        </el-form-item>

        <el-form-item label="Unit">
          <el-select
            v-model="searchForm.unit"
            placeholder="Select Unit"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="unit in unitOptions"
              :key="unit.value"
              :label="unit.label"
              :value="unit.value"
            />
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

    <!-- Item Table -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>Item List</span>
          <div class="table-actions">
            <el-text type="info">Total {{ pagination.total }} items</el-text>
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

        <!-- Item ID Column -->
        <el-table-column prop="itemId" label="Item ID" width="180" sortable />

        <!-- Item Description Column -->
        <el-table-column
          prop="itemDescription"
          label="Item Description"
          min-width="200"
          sortable
        />

        <!-- Unit Price Column -->
        <el-table-column
          prop="unitOfPrice"
          label="Unit Price"
          width="120"
          sortable
        >
        </el-table-column>

        <!-- Unit Column -->
        <el-table-column prop="unit" label="Unit" width="100" sortable />

        <!-- Item Image Column -->
        <el-table-column label="Image" width="100">
          <template #default="scope">
            <div v-if="scope.row.itemGraph" class="item-image">
              <el-image
                style="width: 40px; height: 40px"
                :src="scope.row.itemGraph"
                :preview-src-list="[scope.row.itemGraph]"
                fit="cover"
                :preview-teleported="true"
              />
            </div>
            <span v-else class="no-image">No Image</span>
          </template>
        </el-table-column>

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

    <!-- Add/Edit Item Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="600px"
      @close="cancel"
    >
      <el-form
        ref="itemFormRef"
        :model="form"
        :rules="rules"
        label-width="120px"
      >
        <el-form-item label="Item ID" prop="itemId">
          <el-input
            v-model="form.itemId"
            placeholder="Enter Item ID"
            maxlength="50"
            show-word-limit
            :disabled="dialog.mode === 'edit'"
          />
        </el-form-item>

        <el-form-item label="Item Description" prop="itemDescription">
          <el-input
            v-model="form.itemDescription"
            placeholder="Enter Item Description"
            maxlength="200"
            show-word-limit
            type="textarea"
            :rows="3"
          />
        </el-form-item>

        <el-form-item label="Unit Price" prop="unitOfPrice">
          <el-input-number
            v-model="form.unitOfPrice"
            placeholder="Enter unit price"
            :min="0"
            :precision="2"
            :step="0.1"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Unit" prop="unit">
          <el-select
            v-model="form.unit"
            placeholder="Select unit"
            style="width: 100%"
          >
            <el-option
              v-for="unit in unitOptions"
              :key="unit.value"
              :label="unit.label"
              :value="unit.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="Item Image">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :before-upload="beforeUpload"
            :http-request="handleUpload"
          >
            <img v-if="form.itemGraph" :src="form.itemGraph" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">
            Click to upload item image (JPG/PNG, max 2MB)
          </div>
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
      default-filename="items"
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
import { itemApi } from "@/api/item";
import { addDialog } from "@/composables/useDialog";
import ItemForm from "@/components/common/Form/ItemForm.vue";

// Types
interface Item {
  id: string;
  itemId: string;
  itemDescription: string;
  unitOfPrice: number;
  unit: string;
  itemGraph: string;
}

// Reactive data
const searchForm = reactive({
  itemId: "",
  itemDescription: "",
  unit: "",
});

const tableData = ref<Item[]>([]);
const selectedItems = ref<Item[]>([]);
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
  itemId: "",
  itemDescription: "",
  unitOfPrice: 0,
  unit: "",
  itemGraph: "",
});

// Unit options
const unitOptions = ref([
  { value: "pcs", label: "Pieces" },
  { value: "box", label: "Box" },
  { value: "kg", label: "Kilogram" },
  { value: "m", label: "Meter" },
  { value: "l", label: "Liter" },
  { value: "set", label: "Set" },
  { value: "pack", label: "Pack" },
]);

// Form validation rules
const rules = reactive({
  itemId: [
    { required: true, message: "Item ID is required", trigger: "blur" },
    { min: 1, max: 50, message: "1-50 characters", trigger: "blur" },
  ],
  itemDescription: [
    {
      required: true,
      message: "Item description is required",
      trigger: "blur",
    },
    { min: 1, max: 200, message: "1-200 characters", trigger: "blur" },
  ],
  unitOfPrice: [
    { required: true, message: "Unit price is required", trigger: "blur" },
    {
      type: "number",
      min: 0,
      message: "Unit price must be greater than 0",
      trigger: "blur",
    },
  ],
  unit: [{ required: true, message: "Unit is required", trigger: "change" }],
});

// Export column definitions
const exportColumns = computed<ColumnDefinition[]>(() => [
  { key: "itemId", title: "Item ID", visible: true },
  { key: "itemDescription", title: "Item Description", visible: true },
  { key: "unitOfPrice", title: "Unit Price", visible: true },
  { key: "unit", title: "Unit", visible: true },
]);

// Form ref
const itemFormRef = ref();

// Lifecycle
onMounted(() => {
  loadTableData();
});

/**
 * Load item data
 */
const loadTableData = async () => {
  loading.value = true;
  try {
    const response = await itemApi.getItems({
      page: pagination.currentPage,
      size: pagination.pageSize,
      itemId: searchForm.itemId,
      itemDescription: searchForm.itemDescription,
      unit: searchForm.unit,
    });

    tableData.value = response.list;
    pagination.total = response.total;
  } catch (error) {
    ElMessage.error("Failed to load items");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

/**
 * Handle table selection change
 */
const handleSelectionChange = (selection: Item[]) => {
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
  searchForm.itemId = "";
  searchForm.itemDescription = "";
  searchForm.unit = "";
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
 * Handle add item
 */
const handleAdd = () => {
  addDialog({
    title: "Add Item",
    component: ItemForm,
    props: { mode: "add" },
    width: 600,
    closeOnClickModal: false,
    callBack: async (payload: any) => {
      if (!payload?.ok || !payload.data) return;
      try {
        await itemApi.createItem(payload.data);
        ElMessage.success("Item created successfully.");
        await loadTableData();
      } catch (error) {
        console.log(error);
        ElMessage.error("Failed to create item");
      }
    },
  });
};

/**
 * Handle edit item
 */
const handleEdit = (row: Item) => {
  addDialog({
    title: "Edit Item",
    component: ItemForm,
    props: { mode: "edit", initial: row },
    width: 600,
    closeOnClickModal: false,
    callBack: async (payload: any) => {
      if (!payload.ok || !payload.data) return;
      try {
        await itemApi.updateItem(row.id, payload.data);
        ElMessage.success("Item updated successfully.");
        await loadTableData();
      } catch (error) {
        console.error(error);
        ElMessage.error("Failed to update item");
      }
    },
  });
};

/**
 * Handle individual item deletion
 */
const handleDelete = async (row: Item) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete item "${row.itemDescription}"?`,
      "Confirm Delete",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      },
    );

    await itemApi.deleteItem(row.id);
    ElMessage.success("Item deleted successfully.");
    await loadTableData();
  } catch (error) {
    console.log(error);
    ElMessage.error("Failed to delete item");
  }
};

/**
 * Handle batch deletion
 */
const handleBatchDelete = async () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning("Please select at least one item");
    return;
  }

  try {
    const confirmed = await ElMessageBox.confirm(
      `Are you sure to delete ${selectedItems.value.length} selected item(s)?`,
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
    // await itemApi.batchDeleteItems(ids);

    ElMessage.success(
      `${selectedItems.value.length} item(s) deleted successfully`,
    );
    clearSelection();
    await loadTableData();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("Failed to delete selected items");
    }
  } finally {
    batchLoading.value = false;
  }
};

/**
 * Handle form submission
 */
const submitForm = async () => {
  if (!itemFormRef.value) return;

  try {
    dialog.loading = true;

    // Validate form
    await itemFormRef.value.validate();

    // TODO: Replace with actual API call
    if (dialog.mode === "add") {
      // await itemApi.createItem(form);
      ElMessage.success("Item created successfully");
    } else {
      // await itemApi.updateItem(form.id, form);
      ElMessage.success("Item updated successfully");
    }

    dialog.visible = false;
    await loadTableData();
  } catch (error) {
    console.error("Form submission failed:", error);
    ElMessage.error("Failed to save item");
  } finally {
    dialog.loading = false;
  }
};

/**
 * Handle dialog cancel
 */
const cancel = () => {
  dialog.visible = false;
  itemFormRef.value?.resetFields();
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

// Upload methods
/**
 * Upload validation
 */
const beforeUpload = (file: File) => {
  const isJPGOrPNG = file.type === "image/jpeg" || file.type === "image/png";
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isJPGOrPNG) {
    ElMessage.error("Upload image can only be JPG or PNG format!");
    return false;
  }
  if (!isLt2M) {
    ElMessage.error("Upload image size cannot exceed 2MB!");
    return false;
  }
  return true;
};

/**
 * Handle file upload
 */
const handleUpload = (options: any) => {
  const { file } = options;
  // Simulate upload process
  ElMessage.info("Image uploading...");
  setTimeout(() => {
    // In real project, call upload API, here using local URL simulation
    const reader = new FileReader();
    reader.onload = (e) => {
      form.itemGraph = e.target?.result as string;
      ElMessage.success("Image uploaded successfully");
    };
    reader.readAsDataURL(file);
  }, 1000);
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
      "items_quick_export",
    );
    ElMessage.success("Items exported successfully");
  } catch (error) {
    console.error("Quick export failed:", error);
    ElMessage.error("Failed to export items");
  }
};

/**
 * Export all items
 */
const handleExportAll = () => {
  handleOpenExport();
};

/**
 * Export selected items only
 */
const handleExportSelected = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning("Please select items to export");
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

<style src="./Item.css" scoped />
