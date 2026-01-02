<template>
  <div class="pending-page">
    <!-- 搜索区域 -->
    <el-card shadow="never" class="search-card">
      <el-form
        ref="searchFormRef"
        :model="searchForm"
        inline
        label-width="90px"
        class="search-form"
      >
        <!-- Carrier -->
        <el-form-item label="Carrier">
          <el-select
            v-model="searchForm.carrier"
            placeholder="All carriers"
            clearable
            style="width: 200px"
          >
            <el-option label="All carriers" value="" />
            <el-option label="UPS" value="UPS" />
            <el-option label="FedEx" value="FEDEX" />
            <el-option label="USPS" value="USPS" />
            <!-- 按你的 TrackingCarrier 枚举再加 -->
          </el-select>
        </el-form-item>

        <!-- Tracking Number 模糊搜索 -->
        <el-form-item label="Tracking">
          <el-input
            v-model="searchForm.trackingNumber"
            placeholder="Fuzzy search"
            clearable
            style="width: 260px"
            @keyup.enter="handleEnter"
          />
        </el-form-item>

        <!-- Status -->
        <el-form-item label="Status">
          <el-select
            v-model="searchForm.status"
            placeholder="Status"
            style="width: 160px"
          >
            <el-option label="All" value="ALL" />
            <el-option label="New" value="NEW" />
            <el-option label="Confirmed" value="CONFIRMED" />
            <el-option label="Rejected" value="REJECTED" />
            <el-option label="Duplicate" value="DUPLICATE" />
          </el-select>
        </el-form-item>

        <!-- Scan Time 范围 -->
        <el-form-item label="Scan Time">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="datetimerange"
            range-separator="To"
            start-placeholder="Start"
            end-placeholder="End"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 420px"
          />
        </el-form-item>

        <!-- 按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleSearch">Search</el-button>
          <el-button @click="handleReset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 列表区域 -->
    <el-card shadow="never" class="table-card">
      <el-table
        :data="tableData"
        v-loading="loading"
        border
        stripe
        size="small"
      >
        <el-table-column type="index" label="#" width="60" />

        <el-table-column
          prop="carrier"
          label="Carrier"
          width="120"
          show-overflow-tooltip
        />

        <el-table-column
          prop="trackingNumber"
          label="Tracking Number"
          min-width="220"
          show-overflow-tooltip
        />

        <el-table-column label="Status" width="130">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="scanSource"
          label="Source"
          width="130"
          show-overflow-tooltip
        />

        <el-table-column
          prop="scannedAt"
          label="Scanned At"
          min-width="180"
          show-overflow-tooltip
        />

        <el-table-column
          prop="createdAt"
          label="Created At"
          min-width="180"
          show-overflow-tooltip
        />

        <el-table-column
          prop="createdBy"
          label="Created By"
          width="140"
          show-overflow-tooltip
        />

        <el-table-column label="Actions" fixed="right" width="200">
          <template #default="{ row }">
            <el-button
              type="success"
              size="small"
              link
              :disabled="row.status !== 'NEW'"
              @click="handleConfirm(row)"
            >
              Confirm
            </el-button>
            <el-button
              type="danger"
              size="small"
              link
              :disabled="row.status !== 'NEW'"
              @click="handleReject(row)"
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
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import type { FormInstance } from "element-plus";
import {
  trackingEntryApi,
  type TrackingEntry,
  type TrackingEntryListParams,
} from "@/api/trackingEntry";

const loading = ref(false);
const tableData = ref<TrackingEntry[]>([]);

const searchFormRef = ref<FormInstance | null>(null);

const searchForm = reactive({
  carrier: "" as string, // "" = All carriers
  trackingNumber: "" as string,
  status: "NEW" as string,
  dateRange: [] as string[], // [start, end]
});

const pagination = reactive({
  page: 1,
  size: 20,
  total: 0,
});

function buildQueryParams(): TrackingEntryListParams {
  const params: TrackingEntryListParams = {
    page: pagination.page,
    size: pagination.size,
  };

  if (searchForm.carrier && searchForm.carrier !== "ALL") {
    params.carrier = searchForm.carrier;
  }

  if (searchForm.trackingNumber.trim() !== "") {
    params.trackingNumber = searchForm.trackingNumber.trim();
  }

  if (searchForm.status && searchForm.status !== "ALL") {
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
    const res = await trackingEntryApi.getTrackingEntries(params);
    tableData.value = res.list;
    pagination.total = res.total;
  } catch (error: any) {
    console.error("getTrackingEntries error:", error);
    ElMessage.error(error?.message || "Failed to load pending entries");
  } finally {
    loading.value = false;
  }
}

async function handleSearch() {
  pagination.page = 1;
  await fetchList();
}

function handleEnter() {
  handleSearch();
}

async function handleReset() {
  if (searchFormRef.value) {
    searchFormRef.value.resetFields();
  }
  searchForm.carrier = "";
  searchForm.trackingNumber = "";
  searchForm.status = "NEW";
  searchForm.dateRange = [];
  pagination.page = 1;
  await fetchList();
}

function handleSizeChange(size: number) {
  pagination.size = size;
  pagination.page = 1;
  fetchList();
}

function handleCurrentChange(page: number) {
  pagination.page = page;
  fetchList();
}

function statusTagType(status?: string) {
  switch (status) {
    case "NEW":
      return "warning";
    case "CONFIRMED":
      return "success";
    case "REJECTED":
      return "info";
    case "DUPLICATE":
      return "danger";
    default:
      return "";
  }
}

// Confirm / Reject
async function handleConfirm(row: TrackingEntry) {
  try {
    await ElMessageBox.confirm(
      `Confirm tracking ${row.trackingNumber}?`,
      "Confirm",
      { type: "warning" },
    );
    await trackingEntryApi.confirmEntry(row.id);
    ElMessage.success("Confirmed");
    fetchList();
  } catch {}
}

async function handleReject(row: TrackingEntry) {
  try {
    await ElMessageBox.confirm(
      `Reject tracking ${row.trackingNumber}?`,
      "Reject",
      { type: "warning" },
    );
    await trackingEntryApi.rejectEntry(row.id);
    ElMessage.success("Rejected");
    fetchList();
  } catch {}
}

onMounted(() => {
  fetchList();
});
</script>

<style scoped>
.pending-page {
  padding: 16px;
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  row-gap: 8px;
}

.table-card {
  margin-top: 8px;
}

.pagination-wrapper {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
