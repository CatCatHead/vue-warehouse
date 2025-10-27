<template>
  <el-dialog
    :model-value="props.visible"
    title="Export Data"
    width="500px"
    :before-close="handleClose"
    @update:model-value="handleDialogUpdate"
  >
    <el-form :model="form" label-width="120px">
      <!-- Export Format -->
      <el-form-item label="Export Format">
        <el-radio-group v-model="form.format">
          <el-radio label="csv">CSV</el-radio>
          <el-radio label="excel">Excel</el-radio>
          <el-radio label="pdf" disabled>PDF (Coming Soon)</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- Filename -->
      <el-form-item label="Filename">
        <el-input
          v-model="form.filename"
          placeholder="Enter filename"
          clearable
        >
          <template #append>
            .{{ form.format === "excel" ? "xlsx" : form.format }}
          </template>
        </el-input>
      </el-form-item>

      <!-- Scope -->
      <el-form-item label="Export Scope" v-if="props.showScopeOption">
        <el-radio-group v-model="form.scope">
          <el-radio label="all">All Data</el-radio>
          <el-radio label="selected" :disabled="!hasSelectedRows">
            Selected Rows ({{ selectedRowsCount }})
          </el-radio>
          <el-radio label="current">Current Page</el-radio>
        </el-radio-group>
      </el-form-item>

      <!-- Column Selection -->
      <el-form-item label="Columns to Export">
        <div class="columns-selection">
          <el-checkbox
            v-model="selectAllColumns"
            :indeterminate="isIndeterminate"
            @change="handleSelectAllColumns"
          >
            Select All
          </el-checkbox>

          <el-divider />

          <div class="columns-list">
            <el-checkbox
              v-for="column in availableColumns"
              :key="column.key"
              v-model="column.visible"
              class="column-checkbox"
            >
              {{ column.title }}
            </el-checkbox>
          </div>
        </div>
      </el-form-item>

      <!-- Include Headers -->
      <el-form-item label="Include Headers">
        <el-switch v-model="form.includeHeaders" />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button
          type="primary"
          :loading="exporting"
          @click="handleExport"
          :disabled="!canExport"
        >
          {{ exporting ? "Exporting..." : "Export Data" }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import type { ColumnDefinition } from "@/utils/export";
import { exportToCSV, exportToExcel, exportSelectedRows } from "@/utils/export";

interface ExportForm {
  format: "csv" | "excel" | "pdf";
  filename: string;
  scope: "all" | "selected" | "current";
  includeHeaders: boolean;
}

interface Props {
  visible: boolean;
  data: any[];
  selectedRows?: any[];
  columns: ColumnDefinition[];
  defaultFilename?: string;
  showScopeOption?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  selectedRows: () => [],
  defaultFilename: "export",
  showScopeOption: true,
});

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "export-complete"): void;
}>();

// Reactive state
const exporting = ref(false);
const form = reactive<ExportForm>({
  format: "excel",
  filename: props.defaultFilename,
  scope: "all",
  includeHeaders: true,
});

const availableColumns = ref<ColumnDefinition[]>([]);

// Computed properties
const hasSelectedRows = computed(() => props.selectedRows.length > 0);
const selectedRowsCount = computed(() => props.selectedRows.length);

const selectAllColumns = computed({
  get: () =>
    availableColumns.value.length > 0 &&
    availableColumns.value.every((col) => col.visible !== false),
  set: (value) => {
    availableColumns.value.forEach((col) => {
      col.visible = value;
    });
  },
});

const isIndeterminate = computed(() => {
  const visibleColumns = availableColumns.value.filter(
    (col) => col.visible !== false,
  ).length;
  return visibleColumns > 0 && visibleColumns < availableColumns.value.length;
});

const canExport = computed(() => {
  return (
    form.filename.trim() !== "" &&
    availableColumns.value.some((col) => col.visible !== false)
  );
});

// Initialize columns
watch(
  () => props.columns,
  (newColumns) => {
    availableColumns.value = newColumns.map((col) => ({
      ...col,
      visible: col.visible !== false,
    }));
  },
  { immediate: true, deep: true },
);

// Initialize filename
watch(
  () => props.defaultFilename,
  (newFilename) => {
    form.filename = newFilename;
  },
  { immediate: true },
);

/**
 * Handle dialog visibility update
 */
const handleDialogUpdate = (value: boolean) => {
  emit("update:visible", value);
};

/**
 * Handle select all columns
 */
const handleSelectAllColumns = (value: boolean) => {
  availableColumns.value.forEach((col) => {
    col.visible = value;
  });
};

/**
 * Handle export action
 */
const handleExport = async () => {
  if (!canExport.value) return;

  exporting.value = true;

  try {
    // Determine data to export based on scope
    let dataToExport = props.data;
    if (form.scope === "selected" && hasSelectedRows.value) {
      dataToExport = props.selectedRows;
    } else if (form.scope === "current") {
      // For current page, we assume the passed data is already filtered
      dataToExport = props.data;
    }

    // Filter columns based on selection
    const columnsToExport = availableColumns.value.filter(
      (col) => col.visible !== false,
    );

    // Perform export based on format
    switch (form.format) {
      case "csv":
        exportToCSV(dataToExport, columnsToExport, form.filename);
        break;
      case "excel":
        await exportToExcel(dataToExport, columnsToExport, form.filename);
        break;
      case "pdf":
        // PDF export would be implemented here
        ElMessage.warning("PDF export is not yet implemented");
        break;
    }

    ElMessage.success(
      `Data exported successfully as ${form.format.toUpperCase()}`,
    );
    emit("export-complete");
    handleClose();
  } catch (error) {
    console.error("Export failed:", error);
    ElMessage.error("Failed to export data. Please try again.");
  } finally {
    exporting.value = false;
  }
};

/**
 * Handle dialog close
 */
const handleClose = () => {
  emit("update:visible", false);
};
</script>

<style scoped>
.columns-selection {
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  padding: 12px;
  background: var(--el-fill-color-light);
}

.columns-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.column-checkbox {
  margin-right: 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-dialog__body) {
  padding-bottom: 0;
}
</style>
