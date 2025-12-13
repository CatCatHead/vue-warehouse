<template>
  <div class="tracking-page">
    <!-- Search Card -->
    <el-card shadow="hover" class="search-card">
      <template #header>
        <div class="card-header">
          <span>Tracking Number Search</span>
          <div class="header-actions">
            <el-button type="primary" @click="handleSearch" :loading="loading">
              Search
            </el-button>
            <el-button @click="handleReset" :disabled="loading">
              Reset
            </el-button>
          </div>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="Tracking Number">
          <el-input
            v-model="searchForm.trackingNumber"
            placeholder="Enter tracking number"
            clearable
          />
        </el-form-item>

        <el-form-item label="Carrier Type">
          <el-select
            v-model="searchForm.carrierTypes"
            multiple
            clearable
            collapse-tags
            placeholder="Select carrier type"
            style="min-width: 220px"
          >
            <el-option label="UPS" value="UPS" />
            <el-option label="FedEx" value="FedEx" />
            <el-option label="DHL" value="DHL" />
            <el-option label="USPS" value="USPS" />
          </el-select>
        </el-form-item>

        <el-form-item label="Status">
          <el-select
            v-model="searchForm.status"
            clearable
            placeholder="Select status"
            style="min-width: 160px"
          >
            <el-option label="Active" value="Active" />
            <el-option label="Delivered" value="Delivered" />
            <el-option label="Cancelled" value="Cancelled" />
          </el-select>
        </el-form-item>

        <el-form-item label="Created Date">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="to"
            start-placeholder="Start date"
            end-placeholder="End date"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </el-form>
    </el-card>

    <!-- Table Card -->
    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span>Tracking Number List</span>
          <div class="header-actions">
            <el-button type="primary" @click="openCreateDialog">
              Add Tracking
            </el-button>
          </div>
        </div>
      </template>

      <el-table :data="tableData" v-loading="loading" border height="600">
        <el-table-column
          prop="trackingNumber"
          label="Tracking Number"
          min-width="200"
          show-overflow-tooltip
        />

        <el-table-column
          prop="carrierType"
          label="Carrier Type"
          min-width="150"
        />

        <el-table-column prop="createdAt" label="Created At" min-width="200">
          <template #default="{ row }">
            {{ formatDateTime(row.createdAt) }}
          </template>
        </el-table-column>

        <el-table-column prop="status" label="Status" min-width="140">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column label="Actions" fixed="right" width="220">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              size="small"
              @click="handleView(row)"
            >
              View
            </el-button>
            <el-button
              type="primary"
              link
              size="small"
              @click="openEditDialog(row)"
            >
              Edit
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="handleDelete(row)"
            >
              Delete
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next, jumper"
          :current-page="pagination.currentPage"
          :page-sizes="[10, 20, 50, 100]"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- Create / Edit Dialog -->
    <el-dialog
      v-model="dialog.visible"
      :title="
        dialog.mode === 'create'
          ? 'Add Tracking Number'
          : 'Edit Tracking Number'
      "
      width="520px"
      destroy-on-close
    >
      <el-form
        ref="dialogFormRef"
        :model="dialog.form"
        :rules="dialogRules"
        label-width="120px"
      >
        <el-form-item label="Tracking Number" prop="trackingNumber">
          <el-input
            v-model="dialog.form.trackingNumber"
            placeholder="Enter tracking number"
          />
        </el-form-item>

        <el-form-item label="Carrier Type" prop="carrierType">
          <el-select
            v-model="dialog.form.carrierType"
            placeholder="Select carrier type"
          >
            <el-option label="UPS" value="UPS" />
            <el-option label="FedEx" value="FedEx" />
            <el-option label="DHL" value="DHL" />
            <el-option label="USPS" value="USPS" />
          </el-select>
        </el-form-item>

        <el-form-item label="Status" prop="status">
          <el-select v-model="dialog.form.status" placeholder="Select status">
            <el-option label="Active" value="Active" />
            <el-option label="Delivered" value="Delivered" />
            <el-option label="Cancelled" value="Cancelled" />
          </el-select>
        </el-form-item>

        <el-form-item label="Created At">
          <el-date-picker
            v-model="dialog.form.createdAt"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ss"
            placeholder="Select created time"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="Note">
          <el-input
            v-model="dialog.form.note"
            type="textarea"
            rows="3"
            placeholder="Optional note"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialog.visible = false"> Cancel </el-button>
          <el-button
            type="primary"
            :loading="dialog.saving"
            @click="submitDialog"
          >
            Save
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from "vue";
import {
  ElMessage,
  ElMessageBox,
  type FormInstance,
  type FormRules,
} from "element-plus";
import {
  trackingApi,
  type TrackingNumber,
  type TrackingListParams,
} from "@/api/tracking";

const loading = ref(false);
const tableData = ref<TrackingNumber[]>([]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const searchForm = reactive({
  trackingNumber: "",
  carrierTypes: [] as string[],
  status: "",
  dateRange: [] as string[], // [start, end] in "YYYY-MM-DD"
});

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  // value is ISO string "YYYY-MM-DDTHH:mm:ss"
  return value.replace("T", " ");
};

const statusTagType = (status: string) => {
  switch (status) {
    case "Active":
      return "info";
    case "Delivered":
      return "success";
    case "Cancelled":
      return "danger";
    default:
      return "default";
  }
};

const buildListParams = (): TrackingListParams => {
  const params: TrackingListParams = {
    page: pagination.currentPage,
    size: pagination.pageSize,
  };

  if (searchForm.trackingNumber) {
    params.trackingNumber = searchForm.trackingNumber;
  }
  if (searchForm.carrierTypes.length > 0) {
    params.carrierType = searchForm.carrierTypes.join(",");
  }
  if (searchForm.status) {
    params.status = searchForm.status;
  }
  if (searchForm.dateRange.length === 2) {
    params.startDate = searchForm.dateRange[0];
    params.endDate = searchForm.dateRange[1];
  }

  return params;
};

const fetchTableData = async () => {
  loading.value = true;
  try {
    const params = buildListParams();
    const res = await trackingApi.getTrackingNumbers(params);
    tableData.value = res.list || [];
    pagination.total = res.total || 0;
  } catch (error) {
    console.error(error);
    ElMessage.error("Failed to load tracking numbers");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  pagination.currentPage = 1;
  fetchTableData();
};

const handleReset = () => {
  searchForm.trackingNumber = "";
  searchForm.carrierTypes = [];
  searchForm.status = "";
  searchForm.dateRange = [];
  pagination.currentPage = 1;
  fetchTableData();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  fetchTableData();
};

const handleCurrentChange = (page: number) => {
  pagination.currentPage = page;
  fetchTableData();
};

const handleView = (row: TrackingNumber) => {
  ElMessage.info(`Tracking: ${row.trackingNumber}`);
};

/**
 * Dialog state
 */
type DialogMode = "create" | "edit";

interface DialogForm {
  id?: string | number;
  trackingNumber: string;
  carrierType: string;
  status: string;
  createdAt?: string;
  note?: string;
}

const dialog = reactive({
  visible: false,
  mode: "create" as DialogMode,
  saving: false,
  form: {
    id: undefined,
    trackingNumber: "",
    carrierType: "",
    status: "",
    createdAt: "",
    note: "",
  } as DialogForm,
});

const dialogFormRef = ref<FormInstance>();

const dialogRules: FormRules<DialogForm> = {
  trackingNumber: [
    { required: true, message: "Tracking number is required", trigger: "blur" },
  ],
  carrierType: [
    { required: true, message: "Carrier type is required", trigger: "change" },
  ],
  status: [
    { required: true, message: "Status is required", trigger: "change" },
  ],
};

const resetDialogForm = () => {
  dialog.form.id = undefined;
  dialog.form.trackingNumber = "";
  dialog.form.carrierType = "";
  dialog.form.status = "";
  dialog.form.createdAt = "";
  dialog.form.note = "";
};

const openCreateDialog = () => {
  dialog.mode = "create";
  resetDialogForm();
  dialog.visible = true;
};

const openEditDialog = (row: TrackingNumber) => {
  dialog.mode = "edit";
  dialog.form.id = row.id;
  dialog.form.trackingNumber = row.trackingNumber;
  dialog.form.carrierType = row.carrierType;
  dialog.form.status = row.status;
  dialog.form.createdAt = row.createdAt;
  dialog.form.note = row.note;
  dialog.visible = true;
};

const submitDialog = () => {
  if (!dialogFormRef.value) return;
  dialogFormRef.value.validate(async (valid) => {
    if (!valid) return;
    dialog.saving = true;
    try {
      if (dialog.mode === "create") {
        await trackingApi.createTrackingNumber({
          trackingNumber: dialog.form.trackingNumber,
          carrierType: dialog.form.carrierType,
          status: dialog.form.status,
          createdAt: dialog.form.createdAt,
          note: dialog.form.note,
        });
        ElMessage.success("Tracking number created");
      } else {
        await trackingApi.updateTrackingNumber(dialog.form.id!, {
          trackingNumber: dialog.form.trackingNumber,
          carrierType: dialog.form.carrierType,
          status: dialog.form.status,
          createdAt: dialog.form.createdAt,
          note: dialog.form.note,
        });
        ElMessage.success("Tracking number updated");
      }
      dialog.visible = false;
      fetchTableData();
    } catch (error) {
      console.error(error);
      ElMessage.error("Failed to save tracking number");
    } finally {
      dialog.saving = false;
    }
  });
};

const handleDelete = async (row: TrackingNumber) => {
  try {
    await ElMessageBox.confirm(
      `Are you sure you want to delete tracking number "${row.trackingNumber}"?`,
      "Confirm Deletion",
      {
        type: "warning",
      },
    );
    await trackingApi.deleteTrackingNumber(row.id);
    ElMessage.success("Tracking number deleted");
    fetchTableData();
  } catch (error) {
    if (error !== "cancel") {
      console.error(error);
      ElMessage.error("Failed to delete tracking number");
    }
  }
};

onMounted(() => {
  fetchTableData();
});
</script>

<style scoped>
.tracking-page {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-card,
.table-card {
  width: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.search-form {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
