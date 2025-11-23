<!-- src/components/common/Form/LinenForm.vue -->
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="120px"
    status-icon
  >
    <el-form-item label="Item ID" prop="itemId">
      <el-input
        v-model="form.itemId"
        placeholder="Enter item ID"
        clearable
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="Description" prop="description">
      <el-input
        v-model="form.description"
        placeholder="Enter description"
        clearable
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="Category" prop="category">
      <el-select
        v-model="form.category"
        placeholder="Select category"
        style="width: 100%"
        clearable
      >
        <el-option
          v-for="category in categoryOptions"
          :key="category.value"
          :label="category.label"
          :value="category.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="Location" prop="location">
      <el-input
        v-model="form.location"
        placeholder="Enter location"
        clearable
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="Current Stock" prop="onHand">
      <el-input-number
        v-model="form.onHand"
        :min="0"
        :max="10000"
        controls-position="right"
        style="width: 200px"
        placeholder="Enter current stock"
      />
    </el-form-item>

    <el-form-item label="Min Stock" prop="minStock">
      <el-input-number
        v-model="form.minStock"
        :min="0"
        :max="form.maxStock || 10000"
        controls-position="right"
        style="width: 200px"
        placeholder="Enter minimum stock"
      />
    </el-form-item>

    <el-form-item label="Max Stock" prop="maxStock">
      <el-input-number
        v-model="form.maxStock"
        :min="form.minStock || 0"
        :max="10000"
        controls-position="right"
        style="width: 200px"
        placeholder="Enter maximum stock"
      />
    </el-form-item>

    <div class="form-actions">
      <el-button :disabled="submitting" @click="onCancel">Cancel</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit">
        {{ isEdit ? "Update" : "Create" }}
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";

// Define props
const props = defineProps<{
  mode: "add" | "edit";
  initial?: {
    id?: string;
    itemId?: string;
    description?: string;
    onHand?: number;
    minStock?: number;
    maxStock?: number;
    category?: string;
    location?: string;
    status?: "ACTIVE" | "INACTIVE" | "LOW_STOCK";
    lastUpdated?: string;
    createdAt?: string;
  };
}>();

// Define emits
const emit = defineEmits<{
  (e: "close", payload?: { ok?: boolean; data?: any }): void;
}>();

// Local form state
const form = reactive({
  id: "" as string,
  itemId: "",
  description: "",
  onHand: 0,
  minStock: 0,
  maxStock: 0,
  category: "",
  location: "",
  status: "ACTIVE" as "ACTIVE" | "INACTIVE" | "LOW_STOCK",
});

// Options for dropdowns
const categoryOptions = [
  { label: "Bedding", value: "Bedding" },
  { label: "Bath", value: "Bath" },
  { label: "Table", value: "Table" },
  { label: "Kitchen", value: "Kitchen" },
  { label: "Cleaning", value: "Cleaning" },
  { label: "Other", value: "Other" },
];

const statusOptions = [
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
  { label: "LOW_STOCK", value: "LOW_STOCK" },
];

// Prefill form from props.initial
watch(
  () => props.initial,
  (val) => {
    if (!val) {
      // Reset form for add mode
      form.id = "";
      form.itemId = "";
      form.description = "";
      form.onHand = 0;
      form.minStock = 0;
      form.maxStock = 0;
      form.category = "";
      form.location = "";
      form.status = "ACTIVE";
      return;
    }

    // Fill form for edit mode
    form.id = val.id ?? "";
    form.itemId = val.itemId ?? "";
    form.description = val.description ?? "";
    form.onHand = val.onHand ?? 0;
    form.minStock = val.minStock ?? 0;
    form.maxStock = val.maxStock ?? 0;
    form.category = val.category ?? "";
    form.location = val.location ?? "";
    form.status =
      (val.status as "ACTIVE" | "INACTIVE" | "LOW_STOCK") ?? "ACTIVE";
  },
  { immediate: true },
);

// Validation rules
const rules = reactive<FormRules>({
  itemId: [
    { required: true, message: "Item ID is required", trigger: "blur" },
    { min: 2, max: 50, message: "2-50 characters", trigger: "blur" },
  ],
  description: [
    { required: true, message: "Description is required", trigger: "blur" },
    { min: 2, max: 200, message: "2-200 characters", trigger: "blur" },
  ],
  category: [
    { required: true, message: "Category is required", trigger: "change" },
  ],
  location: [
    { required: true, message: "Location is required", trigger: "blur" },
  ],
  onHand: [
    {
      required: true,
      message: "Current stock is required",
      trigger: "blur",
    },
    {
      validator: (rule, value, callback) => {
        if (value < 0) {
          callback(new Error("Stock cannot be negative"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  minStock: [
    {
      required: true,
      message: "Minimum stock is required",
      trigger: "blur",
    },
    {
      validator: (rule, value, callback) => {
        if (value < 0) {
          callback(new Error("Minimum stock cannot be negative"));
        } else if (form.maxStock > 0 && value > form.maxStock) {
          callback(new Error("Minimum stock cannot exceed maximum stock"));
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  maxStock: [
    {
      required: true,
      message: "Maximum stock is required",
      trigger: "blur",
    },
    {
      validator: (rule, value, callback) => {
        if (value < 0) {
          callback(new Error("Maximum stock cannot be negative"));
        } else if (value < form.minStock) {
          callback(
            new Error("Maximum stock cannot be less than minimum stock"),
          );
        } else {
          callback();
        }
      },
      trigger: "blur",
    },
  ],
  status: [
    { required: true, message: "Status is required", trigger: "change" },
  ],
});

// Form ref and submitting state
const formRef = ref<FormInstance>();
const submitting = ref(false);
const isEdit = computed(() => props.mode === "edit");

/**
 * Handle form submission
 */
async function onSubmit() {
  if (!formRef.value) return;

  try {
    submitting.value = true;

    // Validate form
    await formRef.value.validate();

    // Prepare form data
    const formData = {
      ...form,
      // Ensure numeric values
      onHand: Number(form.onHand),
      minStock: Number(form.minStock),
      maxStock: Number(form.maxStock),
    };

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Emit success with form data
    emit("close", {
      ok: true,
      data: formData,
    });
  } catch (error) {
    console.error("Form validation failed:", error);
    ElMessage.error("Please check the form for errors");
  } finally {
    submitting.value = false;
  }
}

/**
 * Handle cancel action
 */
function onCancel() {
  emit("close");
}

/**
 * Generate unique ID for new items
 */
function createId() {
  try {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return String(array[0]);
  } catch {
    return String(Date.now());
  }
}
</script>

<style scoped>
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
}
</style>
