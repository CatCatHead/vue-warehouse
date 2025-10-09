<!-- components/CommonTable.vue -->
<template>
  <div class="common-table">
    <el-table
      ref="tableRef"
      :data="tableData"
      v-loading="loading"
      :border="border"
      :stripe="stripe"
      :height="height"
      :max-height="maxHeight"
      :row-key="rowKey"
      style="width: 100%"
      @selection-change="handleSelectionChange"
      @sort-change="handleSortChange"
      @row-click="handleRowClick"
    >
      <el-table-column
        v-if="selection"
        type="selection"
        :width="50"
        :reserve-selection="true"
      />

      <el-table-column
        v-if="index"
        type="index"
        :width="60"
        label="index"
        align="center"
      />

      <el-table-column v-if="expand" type="expand" :width="60">
        <template #default="scope">
          <slot name="expand" :row="scope.row"></slot>
        </template>
      </el-table-column>

      <template v-for="column in columns" :key="column.prop">
        <el-table-column
          v-bind="getColumnProps(column)"
          :prop="column.prop"
          :label="column.label"
          :align="column.align || 'left'"
          :sortable="column.sortable"
        >
          <template #header v-if="column.headerSlot">
            <slot :name="column.headerSlot" :column="column"></slot>
          </template>

          <template #default="scope" v-if="column.slot || column.render">
            <template v-if="column.render">
              <component
                :is="column.render(scope)"
                v-if="typeof column.render === 'function'"
              />
            </template>

            <slot
              v-else-if="column.slot"
              :name="column.slot"
              :row="scope.row"
              :column="column"
              :index="scope.$index"
            ></slot>

            <template v-else>
              {{ scope.row[column.prop] }}
            </template>
          </template>
        </el-table-column>
      </template>

      <el-table-column
        v-if="hasActionColumn"
        label="action"
        :width="actionWidth"
        fixed="right"
        align="center"
      >
        <template #default="scope">
          <div class="table-actions">
            <slot name="actions" :row="scope.row" :index="scope.$index">
              <el-button
                v-if="showEdit"
                size="small"
                type="primary"
                link
                @click.stop="handleEdit(scope.row)"
              >
                Edit
              </el-button>
              <el-button
                v-if="showDelete"
                size="small"
                type="danger"
                link
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
import { computed, ref } from "vue";
import type {
  TableColumn,
  TableProps,
  TableEmits,
  Pagination,
} from "@/types/table";

interface CommonTableProps extends TableProps {
  showEdit?: boolean;
  showDelete?: boolean;
  actionWidth?: string | number;
}

const props = withDefaults(defineProps<CommonTableProps>(), {
  loading: false,
  showPagination: true,
  border: true,
  stripe: true,
  rowKey: "id",
  selection: false,
  index: false,
  expand: false,
  showEdit: true,
  showDelete: true,
  actionWidth: 180,
});

const emit = defineEmits<TableEmits>();

const tableRef = ref();

const tableData = computed(() => props.data);

const hasActionColumn = computed(() => {
  return (
    props.showEdit ||
    props.showDelete ||
    !!props.columns.find((col) => col.type === "action")
  );
});

const getColumnProps = (column: TableColumn) => {
  const { render, slot, headerSlot, ...columnProps } = column;
  return columnProps;
};

const handleSelectionChange = (selection: any[]) => {
  emit("selection-change", selection);
};

const handleSortChange = (sort: { prop: string; order: string }) => {
  emit("sort-change", sort);
};

const handleRowClick = (row: any, column: any, event: Event) => {
  emit("row-click", row, column, event);
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

defineExpose({
  clearSelection: () => tableRef.value?.clearSelection(),
  toggleRowSelection: (row: any, selected?: boolean) =>
    tableRef.value?.toggleRowSelection(row, selected),
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
});
</script>

<style scoped>
.common-table {
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
