<!-- components/common/GTable.vue -->
<template>
  <div class="g-table">
    <el-table
      :data="tableData"
      v-loading="loading"
      :border="border"
      :stripe="stripe"
      :height="height"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
    >
      <el-table-column v-if="selection" type="selection" width="55" />

      <el-table-column
        v-if="index"
        type="index"
        width="60"
        label="No."
        align="center"
      />

      <template v-for="column in columns" :key="column.prop">
        <el-table-column
          v-bind="column"
          :prop="column.prop"
          :label="column.label"
          :align="column.align || 'left'"
        >
          <template #default="scope" v-if="column.slot">
            <slot
              :name="column.slot"
              :row="scope.row"
              :column="column"
              :index="scope.$index"
            ></slot>
          </template>
        </el-table-column>
      </template>

      <el-table-column
        v-if="showActions"
        label="Actions"
        :width="actionsWidth"
        fixed="right"
        align="center"
      >
        <template #default="scope">
          <div class="table-actions">
            <slot name="actions" :row="scope.row" :index="scope.$index">
              <el-button
                v-if="showEdit"
                size="small"
                :icon="Edit"
                @click.stop="handleEdit(scope.row)"
              >
                Edit
              </el-button>
              <el-button
                v-if="showDelete"
                size="small"
                :icon="Delete"
                type="danger"
                @click.stop="handleDelete(scope.row)"
              >
                Delete
              </el-button>
            </slot>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="table-pagination" v-if="showPagination && pagination">
      <el-pagination
        v-model:current-page="pagination.currentPage"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Edit, Delete } from "@element-plus/icons-vue";
import { computed } from "vue";

interface TableColumn {
  prop: string;
  label: string;
  width?: string | number;
  minWidth?: string | number;
  align?: "left" | "center" | "right";
  fixed?: "left" | "right";
  sortable?: boolean;
  slot?: string;
}

interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

interface Props {
  columns: TableColumn[];
  data: any[];
  loading?: boolean;
  pagination?: Pagination;
  showPagination?: boolean;
  border?: boolean;
  stripe?: boolean;
  height?: string | number;
  selection?: boolean;
  index?: boolean;
  showActions?: boolean;
  showEdit?: boolean;
  showDelete?: boolean;
  actionsWidth?: string | number;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  showPagination: true,
  border: true,
  stripe: true,
  selection: false,
  index: false,
  showActions: true,
  showEdit: true,
  showDelete: true,
  actionsWidth: 200,
});

const emit = defineEmits<{
  (e: "selection-change", selection: any[]): void;
  (e: "sort-change", sort: any): void;
  (e: "page-change", pagination: Pagination): void;
  (e: "edit", row: any): void;
  (e: "delete", row: any): void;
}>();

const tableData = computed(() => props.data);

const handleSelectionChange = (selection: any[]) => {
  emit("selection-change", selection);
};

const handleSortChange = (sort: any) => {
  emit("sort-change", sort);
};

const handleSizeChange = (size: number) => {
  if (props.pagination) {
    const newPagination = {
      ...props.pagination,
      pageSize: size,
      currentPage: 1,
    };
    emit("page-change", newPagination);
  }
};

const handleCurrentChange = (page: number) => {
  if (props.pagination) {
    const newPagination = { ...props.pagination, currentPage: page };
    emit("page-change", newPagination);
  }
};

const handleEdit = (row: any) => {
  emit("edit", row);
};

const handleDelete = (row: any) => {
  emit("delete", row);
};
</script>

<style scoped>
.g-table {
  width: 100%;
}

.table-pagination {
  margin-top: 16px;
  display: flex;
  justify-content: flex-end;
}

.table-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}
</style>
