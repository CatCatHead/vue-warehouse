<!-- src/views/Linen/Linen.vue -->
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

        <el-form-item label="Status">
          <el-select
            v-model="searchForm.status"
            placeholder="Select status"
            clearable
            style="width: 120px"
          >
            <el-option label="Active" value="active" />
            <el-option label="Inactive" value="inactive" />
            <el-option label="Low Stock" value="low_stock" />
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
        :data="filteredTableData"
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
            {{ getStatusText(scope.row.status) }}
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
import ExportDialog from "@/components/common/ExportDialog/ExportDialog.vue";
import { config } from "@/utils/config";
import { linenApi } from "@/api/linen";

// Types
interface LinenItem {
  id: string;
  itemId: string;
  description: string;
  onHand: number;
  minStock: number;
  maxStock: number;
  category: string;
  status: "active" | "inactive" | "low_stock";
  location: string;
  lastUpdated: string;
  createdAt: string;
}

// Reactive data
const searchForm = reactive({
  itemId: "",
  description: "",
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
    label: "Item Description",
    minWidth: 200,
    sortable: true,
  },
  {
    prop: "onHand",
    label: "On-hand",
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
  { key: "description", title: "Item Description", visible: true },
  { key: "onHand", title: "On-hand", visible: true },
  { key: "minStock", title: "Min Stock", visible: true },
  { key: "maxStock", title: "Max Stock", visible: true },
  { key: "category", title: "Category", visible: true },
  { key: "location", title: "Location", visible: true },
  { key: "status", title: "Status", visible: true, formatter: getStatusText },
]);

// Computed
const filteredTableData = computed(() => {
  let filtered = tableData.value;

  if (searchForm.itemId) {
    filtered = filtered.filter((item) =>
      item.itemId.toLowerCase().includes(searchForm.itemId.toLowerCase()),
    );
  }

  if (searchForm.description) {
    filtered = filtered.filter((item) =>
      item.description
        .toLowerCase()
        .includes(searchForm.description.toLowerCase()),
    );
  }

  if (searchForm.status) {
    filtered = filtered.filter((item) => item.status === searchForm.status);
  }

  pagination.total = filtered.length;

  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;

  return filtered.slice(startIndex, endIndex);
});

// Lifecycle
onMounted(() => {
  loadTableData();
});

// Data methods
const loadTableData = async () => {
  loading.value = true;
  try {
    // const response = await http.get('/linen', {
    //   page: pagination.currentPage,
    //   size: pagination.pageSize,
    //   ...searchForm
    // });
    // tableData.value = response.list;
    // pagination.total = response.total;

    await new Promise((resolve) => setTimeout(resolve, config.mockDelay));
    tableData.value = [
      {
        id: "1",
        itemId: "LIN-001",
        description: "Bed Sheet - King Size",
        onHand: 45,
        minStock: 50,
        maxStock: 200,
        category: "Bedding",
        location: "Warehouse A",
        status: "low_stock",
        lastUpdated: "2024-01-20T10:30:00Z",
        createdAt: "2024-01-15T10:30:00Z",
      },
      {
        id: "2",
        itemId: "LIN-002",
        description: "Pillow Case - Standard",
        onHand: 120,
        minStock: 50,
        maxStock: 300,
        category: "Bedding",
        location: "Warehouse B",
        status: "active",
        lastUpdated: "2024-01-20T09:15:00Z",
        createdAt: "2024-01-10T14:20:00Z",
      },
      {
        id: "3",
        itemId: "LIN-003",
        description: "Bath Towel - Large",
        onHand: 85,
        minStock: 40,
        maxStock: 200,
        category: "Bath",
        location: "Warehouse A",
        status: "active",
        lastUpdated: "2024-01-19T16:45:00Z",
        createdAt: "2024-01-12T11:30:00Z",
      },
    ];
    pagination.total = tableData.value.length;
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
    if (operationDialog.type === "inbound") {
      await linenApi.inbound(
        operationDialog.itemId,
        operationForm.quantity,
        operationForm.notes,
      );
    } else {
      await linenApi.outbound(
        operationDialog.itemId,
        operationForm.quantity,
        operationForm.notes,
      );
    }

    ElMessage.success(
      `${operationDialog.type === "inbound" ? "Inbound" : "Outbound"} operation completed successfully`,
    );
    handleOperationClose();
    refreshData();
  } catch (error) {
    ElMessage.error("Operation failed. Please try again.");
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
};

const handleReset = () => {
  searchForm.itemId = "";
  searchForm.description = "";
  searchForm.status = "";
  pagination.currentPage = 1;
};

const refreshData = () => {
  loadTableData();
};

// Action methods
const handleAddLinen = () => {
  ElMessage.info("Add linen functionality to be implemented");
};

const handleView = (row: LinenItem) => {
  ElMessage.info(`View linen: ${row.itemId} - ${row.description}`);
};

const handleEdit = (row: LinenItem) => {
  ElMessage.info(`Edit linen: ${row.itemId}`);
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

    await new Promise((resolve) => setTimeout(resolve, 300));
    tableData.value = tableData.value.filter((item) => item.id !== row.id);
    pagination.total = tableData.value.length;
    ElMessage.success("Linen item deleted successfully");
  } catch (error) {
    ElMessage.info("Delete canceled");
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    const selectedIds = selectedItems.value.map((item) => item.id);
    tableData.value = tableData.value.filter(
      (item) => !selectedIds.includes(item.id),
    );
    pagination.total = tableData.value.length;

    ElMessage.success(
      `${selectedItems.value.length} item(s) deleted successfully`,
    );
    clearSelection();
  } catch (error) {
    ElMessage.info("Delete canceled");
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
  Object.assign(pagination, newPagination);
};

// Helper methods
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    active: "success",
    inactive: "info",
    low_stock: "warning",
  };
  return types[status] || "info";
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    active: "Active",
    inactive: "Inactive",
    low_stock: "Low Stock",
  };
  return texts[status] || status;
};
</script>

<style scoped>
.linen-page {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header-left .page-title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
}

.batch-actions {
  margin-bottom: 20px;
}

.batch-actions-card {
  background-color: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
}

.batch-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.batch-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-color-primary);
  font-weight: 500;
}

.batch-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.search-card {
  margin-bottom: 20px;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* On-hand cell styles */
.on-hand-cell {
  display: flex;
  align-items: center;
  gap: 4px;
}

.on-hand-cell .low-stock {
  color: var(--el-color-warning);
  font-weight: 600;
}

.warning-icon {
  font-size: 14px;
}

/* Action buttons styles */
.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

.operation-dropdown {
  margin: 0 4px;
}

/* Responsive design */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
  }

  .batch-content {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }

  .batch-buttons {
    width: 100%;
    justify-content: flex-end;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-buttons .el-button {
    width: 100%;
  }
}
</style>
