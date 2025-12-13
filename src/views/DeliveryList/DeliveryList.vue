<template>
  <div class="delivery-list-page">
    <!-- Search Card -->
    <el-card shadow="hover" class="search-card">
      <template #header>
        <div class="card-header">
          <span>Delivery List Search</span>
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
        <el-form-item label="Delivery List ID">
          <el-input
            v-model="searchForm.deliveryListId"
            placeholder="Enter delivery list ID"
            clearable
          />
        </el-form-item>

        <el-form-item label="Department Code">
          <el-input
            v-model="searchForm.departmentCode"
            placeholder="Enter department code"
            clearable
          />
        </el-form-item>

        <el-form-item label="Item ID">
          <el-input
            v-model="searchForm.itemId"
            placeholder="Filter by item ID"
            clearable
          />
        </el-form-item>

        <el-form-item label="Item Description">
          <el-input
            v-model="searchForm.itemDescription"
            placeholder="Filter by item description"
            clearable
          />
        </el-form-item>

        <el-form-item label="Delivery Date">
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
          <span>Delivery List</span>
        </div>
      </template>

      <el-table
        :data="tableData"
        v-loading="loading"
        row-key="id"
        border
        default-expand-all
        :tree-props="{ children: 'items', hasChildren: 'hasItems' }"
        height="600"
      >
        <!-- Delivery ID / Item ID -->
        <el-table-column
          label="Delivery ID / Item ID"
          min-width="220"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.type === 'deliveryList'">
              {{ row.deliveryListId }}
            </span>
            <span v-else>
              {{ row.itemId }}
            </span>
          </template>
        </el-table-column>

        <!-- Department -->
        <el-table-column
          label="Department"
          min-width="220"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.type === 'deliveryList'">
              {{ row.departmentCode }}
              <span v-if="row.departmentName">
                - {{ row.departmentName }}
              </span>
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- Item Description / Line Count -->
        <el-table-column
          label="Item Description / Line Count"
          min-width="260"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <span v-if="row.type === 'item'">
              {{ row.itemDescription }}
            </span>
            <span v-else> {{ row.itemCount }} line(s) </span>
          </template>
        </el-table-column>

        <!-- Quantity -->
        <el-table-column label="Quantity" width="120" align="right">
          <template #default="{ row }">
            <span v-if="row.type === 'item'">
              {{ row.quantity }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- Unit Price -->
        <el-table-column label="Unit Price" width="140" align="right">
          <template #default="{ row }">
            <span v-if="row.type === 'item'">
              {{ formatPrice(row.unitPrice) }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- Amount (Line / Total) -->
        <el-table-column label="Amount" width="160" align="right">
          <template #default="{ row }">
            <span v-if="row.type === 'item'">
              {{ formatPrice(row.totalPrice) }}
            </span>
            <span v-else>
              {{ formatPrice(row.totalAmount) }}
            </span>
          </template>
        </el-table-column>

        <!-- Delivery Date -->
        <el-table-column label="Delivery Date" width="150">
          <template #default="{ row }">
            <span v-if="row.type === 'deliveryList'">
              {{ row.deliveryDate }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>

        <!-- Status -->
        <el-table-column label="Status" width="120">
          <template #default="{ row }">
            <el-tag
              v-if="row.type === 'deliveryList'"
              size="small"
              type="success"
            >
              {{ row.status }}
            </el-tag>
            <span v-else>-</span>
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
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
import axios from "axios";
import { ElMessage } from "element-plus";

/**
 * Backend DTO types – should match your DeliveryListCombineService DTOs.
 */
interface DeliveryItemDTO {
  id: number;
  itemID: string; // Note: using itemID (uppercase ID) based on previous discussion
  deliveryListId: string;
  quantity: number;
  price: number;
  note?: string;
}

interface DeliveryListDTO {
  id: number;
  deliveryListId: string;
  departmentId: string; // stores department code
  deliveryDate: string;
  note?: string;
  items?: DeliveryItemDTO[];
}

interface ItemDTO {
  id: number;
  itemId: string;
  itemDescription: string;
  unitOfPrice: number;
  unit: string;
  itemGraph?: string;
}

interface DepartmentDTO {
  id: number;
  departmentCode: string;
  departmentName: string;
  note?: string;
}

interface DeliveryListResponseDTO {
  deliveryList: DeliveryListDTO[];
  deliveryItem: DeliveryItemDTO[];
  item: ItemDTO[];
  department: DepartmentDTO[];
}

/**
 * Spring Data Page<DeliveryListResponseDTO> JSON structure.
 */
interface DeliveryListResponsePage {
  content: DeliveryListResponseDTO[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // 0-based page index
}

/**
 * Table row types.
 */
interface DeliveryItemRow {
  id: string; // "item-{id}"
  type: "item";
  parentId: string;
  itemId: string;
  itemDescription: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
}

interface DeliveryListRow {
  id: string; // "dl-{id}"
  type: "deliveryList";
  deliveryListId: string;
  departmentCode: string;
  departmentName: string;
  deliveryDate: string;
  totalAmount: number;
  itemCount: number;
  status: string;
  items: DeliveryItemRow[];
  hasItems: boolean;
}

type TableDataRow = DeliveryListRow | DeliveryItemRow;

/**
 * Component state.
 */
const loading = ref(false);
const tableData = ref<TableDataRow[]>([]);

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

const searchForm = reactive({
  deliveryListId: "",
  departmentCode: "",
  itemId: "",
  itemDescription: "",
  dateRange: [] as string[], // ["YYYY-MM-DD", "YYYY-MM-DD"]
});

// Axios instance – replace baseURL if your project uses a different config.
const api = axios.create({
  baseURL: "/api",
});

/**
 * Price formatter.
 */
const formatPrice = (value: number | undefined | null): string => {
  if (value == null || Number.isNaN(value)) return "-";
  return value.toFixed(2);
};

/**
 * Transform backend DTO into table rows for Element Plus tree table.
 */
const transformToTableRows = (res: DeliveryListResponseDTO): TableDataRow[] => {
  const rows: TableDataRow[] = [];

  // itemId -> ItemDTO
  const itemByItemId: Record<string, ItemDTO> = {};
  (res.item || []).forEach((it) => {
    if (it.itemId) {
      itemByItemId[it.itemId] = it;
    }
  });

  // departmentCode -> DepartmentDTO
  const deptByCode: Record<string, DepartmentDTO> = {};
  (res.department || []).forEach((dep) => {
    if (dep.departmentCode) {
      deptByCode[dep.departmentCode] = dep;
    }
  });

  (res.deliveryList || []).forEach((dl) => {
    // Use dl.items if already populated; otherwise filter from res.deliveryItem by deliveryListId
    const deliveryItems: DeliveryItemDTO[] =
      dl.items && dl.items.length > 0
        ? dl.items
        : (res.deliveryItem || []).filter(
            (di) => di.deliveryListId === dl.deliveryListId,
          );

    const childRows: DeliveryItemRow[] = deliveryItems.map((di) => {
      const item = itemByItemId[di.itemID];
      const unitPrice = di.price ?? item?.unitOfPrice ?? 0;
      const quantity = di.quantity ?? 0;
      const totalPrice = unitPrice * quantity;

      return {
        id: `item-${di.id}`,
        type: "item",
        parentId: dl.deliveryListId,
        itemId: item?.itemId ?? di.itemID,
        itemDescription: item?.itemDescription ?? "",
        quantity,
        unitPrice,
        totalPrice,
        note: di.note ?? "",
      };
    });

    const totalAmount = childRows.reduce(
      (sum, c) => sum + (c.totalPrice || 0),
      0,
    );

    const dept = deptByCode[dl.departmentId];

    const parentRow: DeliveryListRow = {
      id: `dl-${dl.id}`,
      type: "deliveryList",
      deliveryListId: dl.deliveryListId,
      departmentCode: dl.departmentId,
      departmentName: dept?.departmentName ?? "",
      deliveryDate: dl.deliveryDate,
      totalAmount,
      itemCount: childRows.length,
      status: "Completed", // replace with real status field if you have one
      items: childRows,
      hasItems: childRows.length > 0,
    };

    rows.push(parentRow);
  });

  return rows;
};

/**
 * Fetch data from backend.
 */
const fetchDeliveryLists = async () => {
  loading.value = true;
  try {
    const params: Record<string, any> = {
      page: pagination.currentPage,
      size: pagination.pageSize,
    };

    if (searchForm.deliveryListId) {
      params.deliveryListId = searchForm.deliveryListId;
    }
    if (searchForm.departmentCode) {
      params.departmentCode = searchForm.departmentCode;
    }
    if (searchForm.itemId) {
      params.itemId = searchForm.itemId;
    }
    if (searchForm.itemDescription) {
      params.itemDescription = searchForm.itemDescription;
    }
    if (
      Array.isArray(searchForm.dateRange) &&
      searchForm.dateRange.length === 2
    ) {
      const [start, end] = searchForm.dateRange;
      params.deliveryListDateStart = start;
      params.deliveryListDateEnd = end;
    }

    // Adjust path here if your controller uses a different mapping.
    const { data } = await api.get<DeliveryListResponsePage>(
      "/delivery-lists/combined",
      { params },
    );

    const pageDto = data.content && data.content[0];

    if (!pageDto) {
      tableData.value = [];
      pagination.total = 0;
      return;
    }

    pagination.total = data.totalElements ?? pageDto.deliveryList.length ?? 0;
    tableData.value = transformToTableRows(pageDto);
  } catch (error) {
    console.error(error);
    ElMessage.error("Failed to load delivery list data");
  } finally {
    loading.value = false;
  }
};

/**
 * Search handler.
 */
const handleSearch = () => {
  pagination.currentPage = 1;
  fetchDeliveryLists();
};

/**
 * Reset handler.
 */
const handleReset = () => {
  searchForm.deliveryListId = "";
  searchForm.departmentCode = "";
  searchForm.itemId = "";
  searchForm.itemDescription = "";
  searchForm.dateRange = [];
  pagination.currentPage = 1;
  fetchDeliveryLists();
};

/**
 * Page size change handler.
 */
const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.currentPage = 1;
  fetchDeliveryLists();
};

/**
 * Page change handler.
 */
const handleCurrentChange = (page: number) => {
  pagination.currentPage = page;
  fetchDeliveryLists();
};

onMounted(() => {
  fetchDeliveryLists();
});
</script>

<style scoped>
.delivery-list-page {
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
</style>
