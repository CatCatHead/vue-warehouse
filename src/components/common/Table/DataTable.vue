<template>
  <div class="data-table">
    <!-- Table Header with Search and Actions -->
    <div v-if="showHeader" class="table-header">
      <div class="header-left">
        <slot name="header-left">
          <h3 v-if="title" class="table-title">{{ title }}</h3>
        </slot>
      </div>
      <div class="header-right">
        <slot name="header-right">
          <!-- Default search and actions -->
          <el-input
            v-if="showSearch"
            v-model="searchText"
            placeholder="Search..."
            clearable
            style="width: 200px; margin-right: 12px"
            @input="handleSearch"
          />
          <el-button v-if="showRefresh" :icon="Refresh" @click="handleRefresh">
            Refresh
          </el-button>
        </slot>
      </div>
    </div>

    <!-- Data Table -->
    <el-table
      v-loading="loading"
      :data="tableData"
      :border="border"
      :stripe="stripe"
      :row-key="rowKey"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <!-- Selection Column -->
      <el-table-column v-if="showSelection" type="selection" width="55" />

      <!-- Index Column -->
      <el-table-column
        v-if="showIndex"
        type="index"
        :label="indexLabel"
        width="80"
      />

      <!-- Data Columns -->
      <template v-for="column in columns" :key="column.prop">
        <el-table-column v-bind="column" :min-width="column.minWidth || 120">
          <template #default="scope">
            <slot
              :name="`column-${column.prop}`"
              :row="scope.row"
              :index="scope.$index"
            >
              <!-- Default cell content -->
              <template v-if="column.formatter">
                {{ column.formatter(scope.row, column) }}
              </template>
              <template v-else>
                {{ scope.row[column.prop] }}
              </template>
            </slot>
          </template>
        </el-table-column>
      </template>

      <!-- Action Column -->
      <el-table-column
        v-if="showActions"
        :label="actionLabel"
        :width="actionWidth"
        :fixed="actionFixed"
      >
        <template #default="scope">
          <slot name="actions" :row="scope.row" :index="scope.$index">
            <!-- Default actions -->
            <el-button
              v-if="showEdit"
              size="small"
              :icon="Edit"
              @click="handleEdit(scope.row)"
            >
              Edit
            </el-button>
            <el-button
              v-if="showDelete"
              size="small"
              type="danger"
              :icon="Delete"
              @click="handleDelete(scope.row)"
            >
              Delete
            </el-button>
          </slot>
        </template>
      </el-table-column>
    </el-table>

    <!-- Pagination -->
    <div v-if="showPagination" class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { Refresh, Edit, Delete } from "@element-plus/icons-vue";

interface TableColumn {
  prop: string;
  label: string;
  width?: number;
  minWidth?: number;
  sortable?: boolean;
  formatter?: (row: any, column: TableColumn) => string;
  [key: string]: any;
}

interface Props {
  // Data
  data: any[];
  columns: TableColumn[];
  loading?: boolean;

  // Table configuration
  title?: string;
  rowKey?: string;
  border?: boolean;
  stripe?: boolean;

  // Header configuration
  showHeader?: boolean;
  showSearch?: boolean;
  showRefresh?: boolean;

  // Column configuration
  showSelection?: boolean;
  showIndex?: boolean;
  indexLabel?: string;
  showActions?: boolean;
  actionLabel?: string;
  actionWidth?: number;
  actionFixed?: "left" | "right";
  showEdit?: boolean;
  showDelete?: boolean;

  // Pagination configuration
  showPagination?: boolean;
  total?: number;
  page?: number;
  size?: number;
  pageSizes?: number[];
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  rowKey: "id",
  border: true,
  stripe: true,
  showHeader: true,
  showSearch: true,
  showRefresh: true,
  showSelection: false,
  showIndex: false,
  indexLabel: "No.",
  showActions: true,
  actionLabel: "Actions",
  actionWidth: 200,
  actionFixed: "right",
  showEdit: true,
  showDelete: true,
  showPagination: true,
  total: 0,
  page: 1,
  size: 10,
  pageSizes: () => [10, 20, 50, 100],
});

const emit = defineEmits<{
  search: [value: string];
  refresh: [];
  selectionChange: [selection: any[]];
  sortChange: [sort: any];
  edit: [row: any];
  delete: [row: any];
  pageChange: [page: number];
  sizeChange: [size: number];
}>();

// Reactive data
const searchText = ref("");
const currentPage = ref(props.page);
const pageSize = ref(props.size);
const selectedRows = ref<any[]>([]);

// Computed
const tableData = computed(() => props.data);

// Watchers
watch(
  () => props.page,
  (newPage) => {
    currentPage.value = newPage;
  },
);

watch(
  () => props.size,
  (newSize) => {
    pageSize.value = newSize;
  },
);

// Event handlers
const handleSearch = (value: string) => {
  emit("search", value);
};

const handleRefresh = () => {
  emit("refresh");
};

const handleSelectionChange = (selection: any[]) => {
  selectedRows.value = selection;
  emit("selectionChange", selection);
};

const handleSortChange = (sort: any) => {
  emit("sortChange", sort);
};

const handleEdit = (row: any) => {
  emit("edit", row);
};

const handleDelete = (row: any) => {
  emit("delete", row);
};

const handleSizeChange = (size: number) => {
  pageSize.value = size;
  emit("sizeChange", size);
};

const handleCurrentChange = (page: number) => {
  currentPage.value = page;
  emit("pageChange", page);
};

// Expose methods and data to parent component
defineExpose({
  selectedRows,
  clearSelection: () => {
    selectedRows.value = [];
  },
});
</script>

<style scoped>
.data-table {
  width: 100%;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 4px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.table-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding: 0 4px;
}

/* Responsive design */
@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .header-left,
  .header-right {
    justify-content: space-between;
  }
}
</style>
