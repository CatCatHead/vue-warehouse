<!-- src/views/Receipt/Receipts.vue -->
<template>
  <div class="receipts-page">
    <!-- Page Header -->
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Receipt Management</h1>
        <el-text type="info">Manage all receipts and their items</el-text>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAddReceipt"
          >Add Receipt</el-button
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

    <!-- Search Card -->
    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="Receipt ID">
          <el-input
            v-model="searchForm.receiptId"
            placeholder="Enter receipt ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="Customer ID">
          <el-input
            v-model="searchForm.customerId"
            placeholder="Enter customer ID"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="Customer Name">
          <el-input
            v-model="searchForm.customerName"
            placeholder="Enter customer name"
            clearable
            style="width: 250px"
          />
        </el-form-item>

        <el-form-item label="Date Range">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="To"
            start-placeholder="Start date"
            end-placeholder="End date"
            style="width: 240px"
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

    <!-- Receipts Table -->
    <el-card>
      <template #header>
        <div class="table-header">
          <span>Receipts List</span>
          <div class="table-actions">
            <el-text type="info">Total {{ totalReceipts }} receipts</el-text>
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

      <!-- Tree Table for Receipts and Items -->
      <el-table
        :data="filteredTableData"
        v-loading="loading"
        style="width: 100%"
        row-key="id"
        :tree-props="{ children: 'items', hasChildren: 'hasItems' }"
        :border="true"
        stripe
        @selection-change="handleSelectionChange"
      >
        <!-- Selection Column -->
        <el-table-column type="selection" width="55" />

        <!-- Index Column -->
        <el-table-column type="index" width="60" label="No." align="center" />

        <!-- Receipt ID / Item ID Column -->
        <el-table-column prop="id" label="ID" width="180">
          <template #default="scope">
            <div
              class="id-cell"
              :class="{ 'item-row': scope.row.type === 'item' }"
            >
              <span class="id-text">{{ scope.row.id }}</span>
              <el-tag
                v-if="scope.row.type === 'item'"
                size="small"
                type="info"
                class="item-tag"
              >
                Item
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <!-- Customer ID / Item Description -->
        <el-table-column
          prop="customerId"
          label="Customer ID / Description"
          min-width="200"
        >
          <template #default="scope">
            <template v-if="scope.row.type === 'receipt'">
              {{ scope.row.customerId }}
            </template>
            <template v-else>
              <div class="item-description">
                {{ scope.row.itemDescription }}
              </div>
            </template>
          </template>
        </el-table-column>

        <!-- Customer Name / Qty Shipped -->
        <el-table-column
          prop="customerName"
          label="Customer Name / Qty"
          width="180"
        >
          <template #default="scope">
            <template v-if="scope.row.type === 'receipt'">
              {{ scope.row.customerName }}
            </template>
            <template v-else>
              <span class="qty-text">{{ scope.row.qtyShipped }}</span>
            </template>
          </template>
        </el-table-column>

        <!-- Document ID (Only for items) -->
        <el-table-column prop="documentId" label="Document ID" width="150">
          <template #default="scope">
            <template v-if="scope.row.type === 'item'">
              {{ scope.row.documentId }}
            </template>
            <template v-else>
              <span class="empty-cell">-</span>
            </template>
          </template>
        </el-table-column>

        <!-- Total Price (Only for items) -->
        <el-table-column
          prop="totalPrice"
          label="Total Price"
          width="120"
          align="right"
        >
          <template #default="scope">
            <template v-if="scope.row.type === 'item'">
              <span class="price-text">
                ${{ formatPrice(scope.row.totalPrice) }}
              </span>
            </template>
            <template v-else>
              <span class="empty-cell">-</span>
            </template>
          </template>
        </el-table-column>

        <!-- Unit Price (Only for items) -->
        <el-table-column
          prop="unitPrice"
          label="Unit Price"
          width="120"
          align="right"
        >
          <template #default="scope">
            <template v-if="scope.row.type === 'item'">
              <span class="price-text">
                ${{ formatPrice(scope.row.unitPrice) }}
              </span>
            </template>
            <template v-else>
              <span class="empty-cell">-</span>
            </template>
          </template>
        </el-table-column>

        <!-- Receipt Date / Created Date -->
        <el-table-column prop="receiptDate" label="Date" width="120">
          <template #default="scope">
            {{ formatDate(scope.row.receiptDate || scope.row.createdDate) }}
          </template>
        </el-table-column>

        <!-- Status -->
        <el-table-column prop="status" label="Status" width="100">
          <template #default="scope">
            <template v-if="scope.row.type === 'receipt'">
              <el-tag :type="getReceiptStatusType(scope.row.status)">
                {{ getReceiptStatusText(scope.row.status) }}
              </el-tag>
            </template>
            <template v-else>
              <el-tag size="small" type="info"> Item </el-tag>
            </template>
          </template>
        </el-table-column>

        <!-- Actions -->
        <el-table-column label="Actions" width="200" fixed="right">
          <template #default="scope">
            <div class="action-buttons">
              <template v-if="scope.row.type === 'receipt'">
                <!-- Receipt Actions -->
                <el-button
                  size="small"
                  :icon="View"
                  @click.stop="handleViewReceipt(scope.row)"
                >
                  View
                </el-button>
                <el-button
                  size="small"
                  :icon="Edit"
                  type="primary"
                  @click.stop="handleEditReceipt(scope.row)"
                >
                  Edit
                </el-button>
                <el-button
                  size="small"
                  :icon="Delete"
                  type="danger"
                  @click.stop="handleDeleteReceipt(scope.row)"
                >
                  Delete
                </el-button>
              </template>
              <template v-else>
                <!-- Item Actions -->
                <el-button
                  size="small"
                  :icon="View"
                  @click.stop="handleViewItem(scope.row)"
                >
                  View
                </el-button>
                <el-button
                  size="small"
                  :icon="Edit"
                  type="primary"
                  @click.stop="handleEditItem(scope.row)"
                >
                  Edit
                </el-button>
              </template>
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

    <!-- Export Dialog -->
    <ExportDialog
      :visible="exportDialogVisible"
      :data="tableData"
      :columns="exportColumns"
      default-filename="receipts"
      @update:visible="exportDialogVisible = $event"
      @export-complete="handleExportComplete"
    />
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
} from "@element-plus/icons-vue";

// Components
import ExportDialog from "@/components/common/ExportDialog/ExportDialog.vue";

// Types
interface ReceiptItem {
  id: string;
  type: "item";
  itemId: string;
  itemDescription: string;
  qtyShipped: number;
  documentId: string;
  totalPrice: number;
  unitPrice: number;
  createdDate: string;
}

interface Receipt {
  id: string;
  type: "receipt";
  receiptId: string;
  customerId: string;
  customerName: string;
  receiptDate: string;
  status: "pending" | "completed" | "cancelled";
  totalAmount: number;
  items: ReceiptItem[];
  hasItems?: boolean;
}

type TableData = Receipt | ReceiptItem;

// Reactive data
const searchForm = reactive({
  receiptId: "",
  customerId: "",
  customerName: "",
  dateRange: [] as Date[],
});

const tableData = ref<TableData[]>([]);
const selectedItems = ref<TableData[]>([]);
const loading = ref(false);
const exportDialogVisible = ref(false);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// Computed
const totalReceipts = computed(() => {
  return tableData.value.filter((item) => item.type === "receipt").length;
});

const filteredTableData = computed(() => {
  let filtered = tableData.value;

  if (searchForm.receiptId) {
    filtered = filtered.filter((item) =>
      item.id.toLowerCase().includes(searchForm.receiptId.toLowerCase()),
    );
  }

  if (searchForm.customerId) {
    filtered = filtered.filter((item) => {
      if (item.type === "receipt") {
        return item.customerId
          .toLowerCase()
          .includes(searchForm.customerId.toLowerCase());
      }
      return false;
    });
  }

  if (searchForm.customerName) {
    filtered = filtered.filter((item) => {
      if (item.type === "receipt") {
        return item.customerName
          .toLowerCase()
          .includes(searchForm.customerName.toLowerCase());
      }
      return false;
    });
  }

  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const startDate = new Date(searchForm.dateRange[0]);
    const endDate = new Date(searchForm.dateRange[1]);
    endDate.setHours(23, 59, 59, 999);

    filtered = filtered.filter((item) => {
      const itemDate = new Date(
        item.type === "receipt" ? item.receiptDate : item.createdDate,
      );
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  pagination.total = filtered.length;

  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;

  return filtered.slice(startIndex, endIndex);
});

// Export Columns
const exportColumns = computed(() => [
  { key: "id", title: "ID", visible: true },
  { key: "type", title: "Type", visible: true },
  { key: "customerId", title: "Customer ID", visible: true },
  { key: "customerName", title: "Customer Name", visible: true },
  { key: "itemDescription", title: "Item Description", visible: true },
  { key: "qtyShipped", title: "Qty Shipped", visible: true },
  { key: "documentId", title: "Document ID", visible: true },
  { key: "totalPrice", title: "Total Price", visible: true },
  { key: "unitPrice", title: "Unit Price", visible: true },
  {
    key: "receiptDate",
    title: "Receipt Date",
    visible: true,
    formatter: formatDateForExport,
  },
  {
    key: "status",
    title: "Status",
    visible: true,
    formatter: getReceiptStatusText,
  },
]);

// Lifecycle
onMounted(() => {
  loadTableData();
});

// Data methods
const loadTableData = async () => {
  loading.value = true;
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock data with tree structure
    tableData.value = [
      {
        id: "REC-001",
        type: "receipt",
        receiptId: "REC-001",
        customerId: "CUST-001",
        customerName: "John Doe",
        receiptDate: "2024-01-20T10:30:00Z",
        status: "completed",
        totalAmount: 450.0,
        hasItems: true,
        items: [
          {
            id: "REC-001-ITEM-001",
            type: "item",
            itemId: "ITEM-001",
            itemDescription: "Laptop Computer - Dell XPS 15",
            qtyShipped: 2,
            documentId: "DOC-001",
            totalPrice: 800.0,
            unitPrice: 400.0,
            createdDate: "2024-01-20T10:30:00Z",
          },
          {
            id: "REC-001-ITEM-002",
            type: "item",
            itemId: "ITEM-002",
            itemDescription: "Wireless Mouse - Logitech MX",
            qtyShipped: 3,
            documentId: "DOC-001",
            totalPrice: 150.0,
            unitPrice: 50.0,
            createdDate: "2024-01-20T10:30:00Z",
          },
        ],
      },
      {
        id: "REC-002",
        type: "receipt",
        receiptId: "REC-002",
        customerId: "CUST-002",
        customerName: "Jane Smith",
        receiptDate: "2024-01-19T14:20:00Z",
        status: "pending",
        totalAmount: 1250.5,
        hasItems: true,
        items: [
          {
            id: "REC-002-ITEM-001",
            type: "item",
            itemId: "ITEM-003",
            itemDescription: "Office Chair - Ergonomic",
            qtyShipped: 5,
            documentId: "DOC-002",
            totalPrice: 1250.5,
            unitPrice: 250.1,
            createdDate: "2024-01-19T14:20:00Z",
          },
        ],
      },
      {
        id: "REC-003",
        type: "receipt",
        receiptId: "REC-003",
        customerId: "CUST-001",
        customerName: "John Doe",
        receiptDate: "2024-01-18T09:15:00Z",
        status: "completed",
        totalAmount: 89.99,
        hasItems: true,
        items: [
          {
            id: "REC-003-ITEM-001",
            type: "item",
            itemId: "ITEM-004",
            itemDescription: "USB-C Cable - 2m",
            qtyShipped: 10,
            documentId: "DOC-003",
            totalPrice: 89.99,
            unitPrice: 8.99,
            createdDate: "2024-01-18T09:15:00Z",
          },
        ],
      },
    ];

    pagination.total = tableData.value.length;
  } catch (error) {
    ElMessage.error("Failed to load receipts");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

// Selection methods
const handleSelectionChange = (selection: TableData[]) => {
  selectedItems.value = selection;
};

// Search methods
const handleSearch = () => {
  pagination.currentPage = 1;
};

const handleReset = () => {
  searchForm.receiptId = "";
  searchForm.customerId = "";
  searchForm.customerName = "";
  searchForm.dateRange = [];
  pagination.currentPage = 1;
};

const refreshData = () => {
  loadTableData();
};

// Action methods
const handleAddReceipt = () => {
  ElMessage.info("Add receipt functionality to be implemented");
};

const handleViewReceipt = (receipt: Receipt) => {
  ElMessage.info(`View receipt: ${receipt.receiptId}`);
};

const handleEditReceipt = (receipt: Receipt) => {
  ElMessage.info(`Edit receipt: ${receipt.receiptId}`);
};

const handleDeleteReceipt = async (receipt: Receipt) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure to delete receipt: ${receipt.receiptId}? This will also delete all associated items.`,
      "Confirm Delete",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 300));
    tableData.value = tableData.value.filter((item) => item.id !== receipt.id);
    pagination.total = tableData.value.length;
    ElMessage.success("Receipt deleted successfully");
  } catch (error) {
    ElMessage.info("Delete canceled");
  }
};

const handleViewItem = (item: ReceiptItem) => {
  ElMessage.info(`View item: ${item.itemId}`);
};

const handleEditItem = (item: ReceiptItem) => {
  ElMessage.info(`Edit item: ${item.itemId}`);
};

// Export methods
const handleOpenExport = () => {
  exportDialogVisible.value = true;
};

const handleQuickExport = async () => {
  try {
    ElMessage.info("Quick export functionality to be implemented");
  } catch (error) {
    console.error("Quick export failed:", error);
    ElMessage.error("Failed to export receipts");
  }
};

const handleExportComplete = () => {
  // Optional cleanup after export
};

// Pagination
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
};

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page;
};

// Helper methods
const getReceiptStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: "warning",
    completed: "success",
    cancelled: "danger",
  };
  return types[status] || "info";
};

const getReceiptStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: "Pending",
    completed: "Completed",
    cancelled: "Cancelled",
  };
  return texts[status] || status;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatDateForExport = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US");
};

const formatPrice = (price: number) => {
  return price.toFixed(2);
};
</script>

<style scoped>
.receipts-page {
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

/* Tree table specific styles */
.id-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.id-cell.item-row {
  padding-left: 24px; /* Indent items */
}

.id-text {
  font-weight: 500;
}

.item-tag {
  font-size: 10px;
  height: 18px;
}

.item-description {
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.qty-text {
  font-weight: 600;
  color: var(--el-color-primary);
}

.price-text {
  font-weight: 600;
  color: var(--el-color-success);
}

.empty-cell {
  color: var(--el-text-color-placeholder);
  font-style: italic;
}

/* Action buttons */
.action-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}

/* Pagination */
.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* Responsive design */
@media (max-width: 1200px) {
  .search-card .el-form {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-card .el-form-item {
    margin-bottom: 12px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    gap: 16px;
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
