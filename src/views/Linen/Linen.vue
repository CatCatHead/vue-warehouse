<!-- Linen.vue -->
<template>
  <div class="linen-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Linen Management</h1>
        <el-text type="info">Manage all linen items in the system</el-text>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAddLinen"
          >Add Linen</el-button
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

        <el-form-item label="Description">
          <el-input
            v-model="searchForm.description"
            placeholder="Enter description"
            clearable
            style="width: 250px"
          />
        </el-form-item>

        <el-form-item label="Category">
          <el-input
            v-model="searchForm.category"
            placeholder="Enter category"
            clearable
            style="width: 180px"
          />
        </el-form-item>

        <el-form-item label="Status">
          <el-select
            v-model="searchForm.status"
            placeholder="Select status"
            clearable
            style="width: 120px"
          >
            <el-option label="ACTIVE" value="ACTIVE" />
            <el-option label="INACTIVE" value="INACTIVE" />
            <el-option label="LOW_STOCK" value="LOW_STOCK" />
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

    <!-- Linen Table -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>Linen Items</span>
          <div class="table-actions">
            <el-text type="info">Total {{ tableData.length }} items</el-text>
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

      <GTable
        :columns="columns"
        :data="tableData"
        :loading="loading"
        :pagination="pagination"
        :show-pagination="true"
        :selection="true"
        :index="true"
        :show-actions="false"
        @selection-change="handleSelectionChange"
        @page-change="handlePageChange"
      >
        <!-- Status Column -->
        <template #status="scope">
          <el-tag :type="getStatusType(scope.row.status)">
            {{ scope.row.status }}
          </el-tag>
        </template>

        <!-- On-hand Column with warning for low stock -->
        <template #onHand="scope">
          <div class="on-hand-cell">
            <span
              :class="{ 'low-stock': scope.row.onHand < scope.row.minStock }"
            >
              {{ scope.row.onHand }}
            </span>
            <el-icon
              v-if="scope.row.onHand < scope.row.minStock"
              class="warning-icon"
              color="#E6A23C"
            >
              <Warning />
            </el-icon>
          </div>
        </template>

        <!-- Actions Column -->
        <template #actions="scope">
          <div class="action-buttons">
            <!-- View Button -->
            <el-button
              size="small"
              :icon="View"
              @click.stop="handleView(scope.row)"
            >
              View
            </el-button>

            <!-- Edit Button -->
            <el-button
              size="small"
              :icon="Edit"
              type="primary"
              @click.stop="handleEdit(scope.row)"
            >
              Edit
            </el-button>

            <!-- Operation Buttons -->
            <el-dropdown
              size="small"
              @command="(command) => handleOperation(command, scope.row)"
              class="operation-dropdown"
            >
              <el-button size="small" type="success">
                Operations<el-icon class="el-icon--right"
                  ><arrow-down
                /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="inbound" :icon="Plus">
                    Inbound
                  </el-dropdown-item>
                  <el-dropdown-item command="outbound" :icon="Minus">
                    Outbound
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>

            <!-- Delete Button -->
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
      </GTable>
    </el-card>

    <!-- Export Dialog -->
    <ExportDialog
      :visible="exportDialogVisible"
      :data="tableData"
      :selected-rows="selectedItems"
      :columns="exportColumns"
      default-filename="linen_items"
      @update:visible="exportDialogVisible = $event"
      @export-complete="handleExportComplete"
    />

    <!-- Operation Dialog -->
    <el-dialog
      v-model="operationDialog.visible"
      :title="operationDialog.title"
      width="500px"
      @close="handleOperationClose"
    >
      <el-form
        :model="operationForm"
        label-width="120px"
        v-if="operationDialog.visible"
      >
        <el-form-item label="Item ID">
          <el-input v-model="operationDialog.itemId" disabled />
        </el-form-item>

        <el-form-item label="Description">
          <el-input v-model="operationDialog.description" disabled />
        </el-form-item>

        <el-form-item
          :label="`${operationDialog.type === 'inbound' ? 'Inbound' : 'Outbound'} Quantity`"
        >
          <el-input-number
            v-model="operationForm.quantity"
            :min="1"
            :max="
              operationDialog.type === 'outbound'
                ? operationDialog.currentStock
                : 10000
            "
            controls-position="right"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="Notes">
          <el-input
            v-model="operationForm.notes"
            type="textarea"
            :rows="3"
            placeholder="Enter operation notes"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleOperationClose">Cancel</el-button>
          <el-button
            type="primary"
            @click="handleOperationSubmit"
            :loading="operationLoading"
          >
            Confirm
            {{ operationDialog.type === "inbound" ? "Inbound" : "Outbound" }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Refresh,
  Search,
  Edit,
  Delete,
  View,
  Download,
  InfoFilled,
  Warning,
  ArrowDown,
  Minus,
} from "@element-plus/icons-vue";

// Components
import GTable from "@/components/common/GTable/GTable.vue";
import { addDialog, addConfirm } from "@/components/common/GDialog";
import ExportDialog from "@/components/common/ExportDialog/ExportDialog.vue";
import LinenForm from "@/components/common/Form/LinenItemForm.vue";
import { linenApi, type LinenItem } from "@/api/linen";
import LinenItemForm from "@/components/common/Form/LinenItemForm.vue";

// Reactive data
const searchForm = reactive({
  itemId: "",
  description: "",
  category: "",
  status: "",
});

const tableData = ref<LinenItem[]>([]);
const selectedItems = ref<LinenItem[]>([]);
const loading = ref(false);
const batchLoading = ref(false);
const exportDialogVisible = ref(false);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// Operation Dialog
const operationDialog = reactive({
  visible: false,
  type: "" as "inbound" | "outbound",
  title: "",
  itemId: "",
  description: "",
  currentStock: 0,
});

const operationForm = reactive({
  quantity: 1,
  notes: "",
});

const operationLoading = ref(false);

// Table Columns
const columns = [
  {
    prop: "itemId",
    label: "Item ID",
    width: 150,
    sortable: true,
  },
  {
    prop: "description",
    label: "Description",
    minWidth: 200,
    sortable: true,
  },
  {
    prop: "category",
    label: "Category",
    width: 150,
    sortable: true,
  },
  {
    prop: "onHand",
    label: "On Hand",
    width: 120,
    slot: "onHand",
    sortable: true,
  },
  {
    prop: "minStock",
    label: "Min Stock",
    width: 120,
    sortable: true,
  },
  {
    prop: "maxStock",
    label: "Max Stock",
    width: 120,
    sortable: true,
  },
  {
    prop: "status",
    label: "Status",
    width: 120,
    slot: "status",
  },
  {
    prop: "actions",
    label: "Actions",
    width: 350,
    slot: "actions",
    fixed: "right",
  },
];

// Export Columns
const exportColumns = computed(() => [
  { key: "itemId", title: "Item ID", visible: true },
  { key: "description", title: "Description", visible: true },
  { key: "category", title: "Category", visible: true },
  { key: "onHand", title: "On Hand", visible: true },
  { key: "minStock", title: "Min Stock", visible: true },
  { key: "maxStock", title: "Max Stock", visible: true },
  { key: "status", title: "Status", visible: true },
  { key: "location", title: "Location", visible: true },
  { key: "lastUpdated", title: "Last Updated", visible: true },
]);

// Lifecycle
onMounted(() => {
  loadTableData();
});

// Data methods
const loadTableData = async () => {
  loading.value = true;
  try {
    const response = await linenApi.getLinenItems({
      page: pagination.currentPage,
      size: pagination.pageSize,
      itemId: searchForm.itemId || undefined,
      description: searchForm.description || undefined,
      category: searchForm.category || undefined,
      status: searchForm.status || undefined,
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

const handleOperationSubmit = async () => {
  if (operationForm.quantity <= 0) {
    ElMessage.warning("Please enter a valid quantity");
    return;
  }

  operationLoading.value = true;

  try {
    const currentItem = tableData.value.find(
      (item) => item.itemId === operationDialog.itemId,
    );
    if (!currentItem) {
      throw new Error("Item not found");
    }

    if (operationDialog.type === "inbound") {
      await linenApi.inbound(
        currentItem.id,
        operationForm.quantity,
        operationForm.notes,
      );
    } else {
      await linenApi.outbound(
        currentItem.id,
        operationForm.quantity,
        operationForm.notes,
      );
    }

    ElMessage.success(
      `${operationDialog.type === "inbound" ? "Inbound" : "Outbound"} operation completed successfully`,
    );
    handleOperationClose();
    await loadTableData();
  } catch (error: any) {
    ElMessage.error(error.message || "Operation failed. Please try again.");
    console.error(error);
  } finally {
    operationLoading.value = false;
  }
};

// Selection methods
const handleSelectionChange = (selection: LinenItem[]) => {
  selectedItems.value = selection;
};

const clearSelection = () => {
  selectedItems.value = [];
};

// Search methods
const handleSearch = () => {
  pagination.currentPage = 1;
  loadTableData();
};

const handleReset = () => {
  searchForm.itemId = "";
  searchForm.description = "";
  searchForm.category = "";
  searchForm.status = "";
  pagination.currentPage = 1;
  loadTableData();
};

const refreshData = () => {
  loadTableData();
};

// Action methods
const handleAddLinen = () => {
  addDialog({
    title: "Add Linen Item",
    component: LinenItemForm,
    props: { mode: "add" },
    width: 600,
    closeOnClickModal: false,
    callBack: async (payload: any) => {
      if (!payload?.ok || !payload.data) return;
      try {
        await linenApi.createLinen(payload.data);
        ElMessage.success("Linen created successfully");
        await loadTableData();
      } catch (error) {
        console.error(error);
        ElMessage.error("Failed to create Linen");
      }
    },
  });
};

const handleView = (row: LinenItem) => {
  ElMessage.info(`View linen: ${row.itemId} - ${row.description}`);
};

const handleEdit = (row: LinenItem) => {
  addDialog({
    title: "Edit Linen Item",
    component: LinenForm,
    props: { mode: "edit", initial: row },
    width: 600,
    closeOnClickModal: false,
    callBack: async (payload: any) => {
      if (!payload?.ok || !payload.data) return;
      try {
        await linenApi.updateLinen(row.id, payload.data);
        ElMessage.success("Linen updated successfully");
        await loadTableData();
      } catch (e) {
        console.error(e);
        ElMessage.error("Failed to update linen item");
      }
    },
  });
};

const handleDelete = async (row: LinenItem) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure to delete linen item: ${row.itemId}?`,
      "Confirm Delete",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      },
    );

    await linenApi.deleteLinen(row.id);
    ElMessage.success("Linen item deleted successfully");
    await loadTableData();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("Failed to delete linen item");
    }
  }
};

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

    for (const item of selectedItems.value) {
      await linenApi.deleteLinen(item.id);
    }

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

// Operation methods
const handleOperation = (command: string, row: LinenItem) => {
  operationDialog.type = command as "inbound" | "outbound";
  operationDialog.title = `${command === "inbound" ? "Inbound" : "Outbound"} Operation`;
  operationDialog.itemId = row.itemId;
  operationDialog.description = row.description;
  operationDialog.currentStock = row.onHand;
  operationDialog.visible = true;

  // Reset form
  operationForm.quantity = 1;
  operationForm.notes = "";
};

const handleOperationClose = () => {
  operationDialog.visible = false;
  operationDialog.type = "";
  operationDialog.title = "";
  operationDialog.itemId = "";
  operationDialog.description = "";
  operationDialog.currentStock = 0;
};

// Export methods
const handleOpenExport = () => {
  exportDialogVisible.value = true;
};

const handleQuickExport = async () => {
  try {
    // This would use the export functions from @/utils/export
    ElMessage.info("Quick export functionality to be implemented");
  } catch (error) {
    console.error("Quick export failed:", error);
    ElMessage.error("Failed to export items");
  }
};

const handleExportSelected = () => {
  if (selectedItems.value.length === 0) {
    ElMessage.warning("Please select items to export");
    return;
  }
  ElMessage.info(`Export ${selectedItems.value.length} selected items`);
};

const handleExportComplete = () => {
  // Optional cleanup after export
};

// Pagination
const handlePageChange = (newPagination: any) => {
  console.log("Page change", newPagination);

  pagination.currentPage = newPagination.currentPage;
  pagination.pageSize = newPagination.pageSize;

  loadTableData();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  loadTableData();
};

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page;
  loadTableData();
};

// Helper methods
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    ACTIVE: "success",
    INACTIVE: "info",
    LOW_STOCK: "warning",
  };
  return types[status] || "info";
};
</script>

<style scoped src="./Linen.css"></style>
