<!-- src/views/tracking/TrackingPending.vue -->
<template>
  <div class="page-container">
    <el-card class="search-card" shadow="never">
      <el-form
        :model="searchForm"
        :inline="true"
        label-width="110px"
        @keyup.enter.native="handleSearch"
      >
        <el-form-item label="Carrier">
          <el-select
            v-model="searchForm.carrier"
            placeholder="All carriers"
            clearable
            style="width: 200px"
          >
            <el-option label="All" :value="undefined" />
            <el-option label="FedEx Express" value="FEDEX_EXPRESS" />
            <el-option label="FedEx Ground" value="FEDEX_GROUND" />
            <el-option label="UPS" value="UPS" />
            <el-option label="Other" value="OTHER" />
          </el-select>
        </el-form-item>

        <el-form-item label="Tracking Number">
          <el-input
            v-model="searchForm.trackingNumber"
            placeholder="Fuzzy search"
            clearable
            style="width: 260px"
          />
        </el-form-item>

        <el-form-item label="Scan Time">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            start-placeholder="Start"
            end-placeholder="End"
            range-separator="To"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 380px"
          />
        </el-form-item>

        <el-form-item label="Status">
          <el-select
            v-model="searchForm.status"
            placeholder="Status"
            clearable
            style="width: 160px"
          >
            <el-option label="New" value="NEW" />
            <el-option label="Confirmed" value="CONFIRMED" />
            <el-option label="Rejected" value="REJECTED" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card class="table-card" shadow="never">
      <div class="table-toolbar">
        <div>
          <el-button
            type="primary"
            :disabled="multipleSelection.length === 0"
            @click="handleBatchConfirm"
            v-permission="'tracking:manage'"
          >
            Confirm Selected
          </el-button>
          <el-button
            type="danger"
            plain
            :disabled="multipleSelection.length === 0"
            @click="handleBatchReject"
            v-permission="'tracking:manage'"
          >
            Reject Selected
          </el-button>
        </div>
        <div>
          <el-button link @click="fetchList">
            <el-icon><refresh-right /></el-icon>
            Refresh
          </el-button>
        </div>
      </div>

      <el-table
        v-loading="loading"
        :data="tableData"
        border
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="48" />

        <el-table-column prop="id" label="ID" width="80" />

        <el-table-column prop="carrier" label="Carrier" width="140">
          <template #default="{ row }">
            {{ renderCarrier(row.carrier) }}
          </template>
        </el-table-column>

        <el-table-column
          prop="trackingNumber"
          label="Tracking Number"
          min-width="200"
        />

        <el-table-column prop="scanSource" label="Source" width="120" />

        <el-table-column prop="scannedAt" label="Scanned At" min-width="180">
          <template #default="{ row }">
            {{ row.scannedAt || row.createdAt || "-" }}
          </template>
        </el-table-column>

        <el-table-column prop="createdBy" label="User" width="140" />

        <el-table-column prop="status" label="Status" width="120">
          <template #default="{ row }">
            <el-tag
              v-if="row.status"
              :type="statusTagType(row.status)"
              size="small"
            >
              {{ row.status }}
            </el-tag>
            <span v-else>NEW</span>
          </template>
        </el-table-column>

        <el-table-column label="Actions" fixed="right" width="220">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleConfirm(row)"
              v-permission="'tracking:manage'"
            >
              Confirm
            </el-button>
            <el-button
              type="danger"
              size="small"
              plain
              @click="handleReject(row)"
              v-permission="'tracking:manage'"
            >
              Reject
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pageSize"
          :current-page="currentPage"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { RefreshRight } from "@element-plus/icons-vue";

import {
  fetchTrackingEntries,
  confirmTrackingEntry,
  rejectTrackingEntry,
  type TrackingEntry,
} from "@/api/trackingEntry";

const loading = ref(false);
const tableData = ref<TrackingEntry[]>([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(20);
const multipleSelection = ref<TrackingEntry[]>([]);

const searchForm = reactive<{
  carrier?: string;
  trackingNumber?: string;
  status?: string;
  dateRange?: string[];
}>({
  carrier: undefined,
  trackingNumber: "",
  status: "NEW",
  dateRange: [],
});

function buildQueryParams() {
  const params: any = {
    page: currentPage.value,
    size: pageSize.value,
  };

  if (searchForm.carrier) {
    params.carrier = searchForm.carrier;
  }
  if (searchForm.trackingNumber) {
    params.trackingNumber = searchForm.trackingNumber;
  }
  if (searchForm.status) {
    params.status = searchForm.status;
  }
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    params.startTime = searchForm.dateRange[0];
    params.endTime = searchForm.dateRange[1];
  }

  return params;
}

async function fetchList() {
  loading.value = true;
  try {
    const params = buildQueryParams();
    const { list, total: totalCount } = await fetchTrackingEntries(params);
    tableData.value = list || [];
    total.value = totalCount || 0;
  } catch (error) {
    console.error("Failed to fetch tracking entries:", error);
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  currentPage.value = 1;
  fetchList();
}

function handleReset() {
  searchForm.carrier = undefined;
  searchForm.trackingNumber = "";
  searchForm.status = "NEW";
  searchForm.dateRange = [];
  currentPage.value = 1;
  fetchList();
}

function handleSelectionChange(val: TrackingEntry[]) {
  multipleSelection.value = val;
}

function handleSizeChange(size: number) {
  pageSize.value = size;
  currentPage.value = 1;
  fetchList();
}

function handleCurrentChange(page: number) {
  currentPage.value = page;
  fetchList();
}

function renderCarrier(carrier?: string) {
  switch (carrier) {
    case "FEDEX_EXPRESS":
      return "FedEx Express";
    case "FEDEX_GROUND":
      return "FedEx Ground";
    case "UPS":
      return "UPS";
    case "OTHER":
      return "Other";
    default:
      return carrier || "-";
  }
}

function statusTagType(status?: string) {
  switch (status) {
    case "NEW":
      return "info";
    case "CONFIRMED":
      return "success";
    case "REJECTED":
      return "danger";
    default:
      return "info";
  }
}

async function doConfirm(row: TrackingEntry) {
  await confirmTrackingEntry(row.id);
}

async function doReject(row: TrackingEntry) {
  await rejectTrackingEntry(row.id);
}

async function handleConfirm(row: TrackingEntry) {
  try {
    await ElMessageBox.confirm(
      `Confirm tracking number "${row.trackingNumber}" ?`,
      "Confirm Entry",
      {
        type: "warning",
      },
    );
    await doConfirm(row);
    ElMessage.success("Confirmed");
    fetchList();
  } catch (e) {
    if (e !== "cancel") {
      console.error(e);
    }
  }
}

async function handleReject(row: TrackingEntry) {
  try {
    await ElMessageBox.confirm(
      `Mark tracking number "${row.trackingNumber}" as invalid?`,
      "Reject Entry",
      {
        type: "warning",
      },
    );
    await doReject(row);
    ElMessage.success("Rejected");
    fetchList();
  } catch (e) {
    if (e !== "cancel") {
      console.error(e);
    }
  }
}

async function handleBatchConfirm() {
  try {
    await ElMessageBox.confirm(
      `Confirm ${multipleSelection.value.length} selected entries?`,
      "Batch Confirm",
      {
        type: "warning",
      },
    );
    for (const row of multipleSelection.value) {
      await doConfirm(row);
    }
    ElMessage.success("Batch confirm finished");
    fetchList();
  } catch (e) {
    if (e !== "cancel") {
      console.error(e);
    }
  }
}

async function handleBatchReject() {
  try {
    await ElMessageBox.confirm(
      `Reject ${multipleSelection.value.length} selected entries?`,
      "Batch Reject",
      {
        type: "warning",
      },
    );
    for (const row of multipleSelection.value) {
      await doReject(row);
    }
    ElMessage.success("Batch reject finished");
    fetchList();
  } catch (e) {
    if (e !== "cancel") {
      console.error(e);
    }
  }
}

onMounted(() => {
  fetchList();
});
</script>

<style scoped>
.page-container {
  padding: 16px;
}

.search-card {
  margin-bottom: 16px;
}

.table-card {
  margin-bottom: 16px;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.pagination-wrapper {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
