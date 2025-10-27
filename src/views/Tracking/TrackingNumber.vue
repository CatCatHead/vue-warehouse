<!-- tracking/TrackingNumber.vue -->
<template>
  <div class="tracking-page">
    <div class="page-header">
      <div class="header-left">
        <h1 class="page-title">Tracking Number Management</h1>
        <el-text type="info">Manage all tracking numbers in the system</el-text>
      </div>
      <div class="header-actions">
        <el-button type="primary" :icon="Plus" @click="handleAddTracking"
          >Add Tracking</el-button
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

    <el-card class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="Tracking Number">
          <el-input
            v-model="searchForm.trackingNumber"
            placeholder="Input tracking number"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="Carrier Type">
          <el-select
            v-model="searchForm.carrierType"
            placeholder="Select carrier(s)"
            multiple
            clearable
            collapse-tags
            collapse-tags-tooltip
            style="width: 300px"
          >
            <el-option label="FedEx" value="fedex" />
            <el-option label="FedEx Ground" value="fedex_ground" />
            <el-option label="UPS" value="ups" />
            <el-option label="Other" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="Created Time">
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

    <el-card>
      <template #header>
        <div class="table-header">
          <span>Tracking Number List</span>
          <div class="table-actions">
            <el-text type="info"
              >In total {{ tableData.length }} entries</el-text
            >
          </div>
        </div>
      </template>

      <GTable
        :columns="columns"
        :data="filteredTableData"
        :loading="loading"
        :pagination="pagination"
        :show-pagination="true"
        :selection="false"
        :index="true"
        :show-edit="true"
        :show-delete="true"
        @edit="handleEdit"
        @delete="handleDelete"
        @page-change="handlePageChange"
      >
        <template #carrierType="scope">
          <el-tag :type="getCarrierType(scope.row.carrierType)">{{
            getCarrierText(scope.row.carrierType)
          }}</el-tag>
        </template>

        <template #createdAt="scope">{{
          formatDate(scope.row.createdAt)
        }}</template>

        <template #actions="scope">
          <el-button
            size="small"
            :icon="View"
            @click.stop="handleView(scope.row)"
            >View</el-button
          >
          <el-button
            size="small"
            :icon="Edit"
            @click.stop="handleEdit(scope.row)"
            >Edit</el-button
          >
          <el-button
            size="small"
            :icon="Delete"
            type="danger"
            @click.stop="handleDelete(scope.row)"
            >Delete</el-button
          >
        </template>
      </GTable>
    </el-card>
    <!-- Export Dialog -->
    <ExportDialog
      :visible="exportDialogVisible"
      :data="tableData"
      :columns="exportColumns"
      :default-filename="tracking_numbers"
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
  View,
} from "@element-plus/icons-vue";
import GTable from "@/components/common/GTable/GTable.vue";

// Import export functionality
import ExportDialog from "@/components/common/ExportDialog/ExportDialog.vue";
import type { ColumnDefinition } from "@/utils/export";
import { formatDateForExport } from "@/utils/export";

// Export dialog state
const exportDialogVisible = ref(false);

// Export column definitions for tracking numbers
const exportColumns = computed<ColumnDefinition[]>(() => [
  { key: "trackingNumber", title: "Tracking Number", visible: true },
  {
    key: "carrierType",
    title: "Carrier Type",
    visible: true,
    formatter: getCarrierText,
  },
  {
    key: "createdAt",
    title: "Created At",
    visible: true,
    formatter: formatDateForExport,
  },
  { key: "status", title: "Status", visible: true },
]);

/**
 * Open export dialog
 */
const handleOpenExport = () => {
  exportDialogVisible.value = true;
};

/**
 * Handle export completion
 */
const handleExportComplete = () => {
  // Optional cleanup
};

interface TrackingNumber {
  id: string;
  trackingNumber: string;
  carrierType: string;
  createdAt: string;
  status?: string;
}

const searchForm = reactive({
  trackingNumber: "",
  carrierType: [] as string[],
  dateRange: [] as Date[],
});

const columns = [
  {
    prop: "trackingNumber",
    label: "Tracking Number",
    width: 200,
    sortable: true,
  },
  {
    prop: "carrierType",
    label: "Carrier Type",
    width: 150,
    slot: "carrierType",
  },
  {
    prop: "createdAt",
    label: "Created At",
    width: 180,
    slot: "createdAt",
    sortable: true,
  },
];

const tableData = ref<TrackingNumber[]>([]);
const loading = ref(false);
const pagination = reactive({ currentPage: 1, pageSize: 10, total: 0 });

const filteredTableData = computed(() => {
  let filtered = tableData.value;

  if (searchForm.trackingNumber) {
    filtered = filtered.filter((item) =>
      item.trackingNumber
        .toLowerCase()
        .includes(searchForm.trackingNumber.toLowerCase()),
    );
  }

  if (searchForm.carrierType && searchForm.carrierType.length > 0) {
    filtered = filtered.filter((item) =>
      searchForm.carrierType.includes(item.carrierType),
    );
  }

  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    const startDate = new Date(searchForm.dateRange[0]);
    const endDate = new Date(searchForm.dateRange[1]);
    endDate.setHours(23, 59, 59, 999); // 设置为当天结束时间

    filtered = filtered.filter((item) => {
      const itemDate = new Date(item.createdAt);
      return itemDate >= startDate && itemDate <= endDate;
    });
  }

  pagination.total = filtered.length;

  const startIndex = (pagination.currentPage - 1) * pagination.pageSize;
  const endIndex = startIndex + pagination.pageSize;

  return filtered.slice(startIndex, endIndex);
});

onMounted(() => {
  loadTableData();
});

const loadTableData = async () => {
  loading.value = true;
  try {
    await new Promise((resolve) => setTimeout(resolve, 500));

    tableData.value = [
      {
        id: "1",
        trackingNumber: "123456789012",
        carrierType: "fedex",
        createdAt: "2024-01-15T10:30:00Z",
        status: "active",
      },
      {
        id: "2",
        trackingNumber: "987654321098",
        carrierType: "ups",
        createdAt: "2024-01-16T14:20:00Z",
        status: "active",
      },
      {
        id: "3",
        trackingNumber: "456123789045",
        carrierType: "fedex_ground",
        createdAt: "2024-01-17T09:15:00Z",
        status: "inactive",
      },
      {
        id: "4",
        trackingNumber: "789012345678",
        carrierType: "other",
        createdAt: "2024-01-18T16:45:00Z",
        status: "active",
      },
      {
        id: "5",
        trackingNumber: "111222333444",
        carrierType: "fedex",
        createdAt: "2024-01-19T11:20:00Z",
        status: "active",
      },
      {
        id: "6",
        trackingNumber: "555666777888",
        carrierType: "ups",
        createdAt: "2024-01-20T13:10:00Z",
        status: "active",
      },
      {
        id: "7",
        trackingNumber: "999888777666",
        carrierType: "fedex_ground",
        createdAt: "2024-01-21T08:45:00Z",
        status: "inactive",
      },
    ];

    pagination.total = tableData.value.length;
  } catch (error) {
    ElMessage.error("Failed to load tracking numbers");
    console.error(error);
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.currentPage = 1;
  console.log("Search criteria:", searchForm);
};

const handleReset = () => {
  searchForm.trackingNumber = "";
  searchForm.carrierType = [];
  searchForm.dateRange = [];
  pagination.currentPage = 1;
};

const refreshData = () => {
  loadTableData();
};

const handleAddTracking = () => {
  ElMessage.info("Add tracking number functionality to be implemented");
};

const handleView = (row: TrackingNumber) => {
  ElMessage.info(`View tracking: ${row.trackingNumber}`);
};

const handleEdit = (row: TrackingNumber) => {
  ElMessage.info(`Edit tracking: ${row.trackingNumber}`);
};

const handleDelete = async (row: TrackingNumber) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure to delete tracking number: ${row.trackingNumber}?`,
      "Confirm Delete",
      {
        confirmButtonText: "Delete",
        cancelButtonText: "Cancel",
        type: "warning",
      },
    );

    await new Promise((resolve) => setTimeout(resolve, 300));
    ElMessage.success("Tracking number deleted successfully");
    loadTableData();
  } catch (error) {
    ElMessage.info("Delete canceled");
  }
};

const handlePageChange = (newPagination: any) => {
  Object.assign(pagination, newPagination);
};

const getCarrierType = (carrier: string) => {
  const types: { [key: string]: string } = {
    fedex: "danger",
    fedex_ground: "warning",
    ups: "success",
    other: "info",
  };
  return types[carrier] || "info";
};

const getCarrierText = (carrier: string) => {
  const texts: { [key: string]: string } = {
    fedex: "FedEx",
    fedex_ground: "FedEx Ground",
    ups: "UPS",
    other: "Other",
  };
  return texts[carrier] || carrier;
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("en-US");
};
</script>

<style scoped>
.tracking-page {
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
</style>
