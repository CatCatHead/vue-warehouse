<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="140px"
    status-icon
  >
    <el-form-item label="Item ID" prop="itemId">
      <el-input
        v-model="form.itemId"
        placeholder="Enter item ID"
        clearable
        style="width: 100%"
        :disabled="isEdit"
      />
    </el-form-item>

    <el-form-item label="Item Description" prop="itemDescription">
      <el-input
        v-model="form.itemDescription"
        placeholder="Enter item description"
        clearable
        type="textarea"
        :rows="3"
        style="width: 100%"
        maxlength="200"
        show-word-limit
      />
    </el-form-item>

    <el-form-item label="Unit Price" prop="unitOfPrice">
      <el-input-number
        v-model="form.unitOfPrice"
        placeholder="Enter unit price"
        :min="0"
        :precision="2"
        :step="0.1"
        style="width: 100%"
        controls-position="right"
      />
    </el-form-item>

    <el-form-item label="Unit" prop="unit">
      <el-select
        v-model="form.unit"
        placeholder="Select unit"
        style="width: 100%"
        clearable
      >
        <el-option
          v-for="unit in unitOptions"
          :key="unit.value"
          :label="unit.label"
          :value="unit.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="Item Image">
      <div class="image-upload-section">
        <el-upload
          class="avatar-uploader"
          action="#"
          :show-file-list="false"
          :before-upload="beforeUpload"
          :http-request="handleUpload"
          :disabled="uploading"
        >
          <img v-if="form.itemGraph" :src="form.itemGraph" class="avatar" />
          <div v-else class="avatar-uploader-placeholder">
            <el-icon size="24"><Plus /></el-icon>
            <span class="upload-text">Upload Image</span>
          </div>
        </el-upload>

        <div class="upload-actions" v-if="form.itemGraph">
          <el-button
            type="danger"
            text
            size="small"
            @click="removeImage"
            :disabled="uploading"
          >
            Remove Image
          </el-button>
        </div>

        <div class="upload-tips">
          <p>Supported formats: JPG, PNG, GIF</p>
          <p>Max file size: 2MB</p>
          <p>Recommended size: 400x400 pixels</p>
        </div>
      </div>
    </el-form-item>

    <div class="form-actions">
      <el-button :disabled="submitting || uploading" @click="onCancel">
        Cancel
      </el-button>
      <el-button
        type="primary"
        :loading="submitting"
        @click="onSubmit"
        :disabled="uploading"
      >
        {{ isEdit ? "Update" : "Create" }}
      </el-button>
    </div>
  </el-form>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from "vue";
import type { FormInstance, FormRules } from "element-plus";
import { ElMessage } from "element-plus";
import { Plus } from "@element-plus/icons-vue";

interface ItemFormData {
  id?: string | number;
  itemId: string;
  itemDescription: string;
  unitOfPrice: number;
  unit: string;
  itemGraph: string;
}

const props = defineProps<{
  mode: "add" | "edit";
  initial?: ItemFormData;
}>();

const emit = defineEmits<{
  (e: "close", payload?: { ok?: boolean; data?: ItemFormData }): void;
}>();

// Unit options
const unitOptions = [
  { value: "pcs", label: "Pieces" },
  { value: "box", label: "Box" },
  { value: "kg", label: "Kilogram" },
  { value: "m", label: "Meter" },
  { value: "l", label: "Liter" },
  { value: "set", label: "Set" },
  { value: "pack", label: "Pack" },
  { value: "unit", label: "Unit" },
  { value: "pair", label: "Pair" },
  { value: "roll", label: "Roll" },
];

// Form data
const form = reactive<ItemFormData>({
  id: "",
  itemId: "",
  itemDescription: "",
  unitOfPrice: 0,
  unit: "",
  itemGraph: "",
});

// Form validation rules
const rules = reactive<FormRules>({
  itemId: [
    {
      required: true,
      message: "Item ID is required",
      trigger: "blur",
    },
    {
      min: 1,
      max: 50,
      message: "Length should be 1 to 50 characters",
      trigger: "blur",
    },
    {
      pattern: /^[A-Za-z0-9_-]+$/,
      message:
        "Item ID can only contain letters, numbers, hyphens and underscores",
      trigger: "blur",
    },
  ],
  itemDescription: [
    {
      required: true,
      message: "Item description is required",
      trigger: "blur",
    },
    {
      min: 1,
      max: 200,
      message: "Length should be 1 to 200 characters",
      trigger: "blur",
    },
  ],
  unitOfPrice: [
    {
      required: true,
      message: "Unit price is required",
      trigger: "blur",
    },
    {
      type: "number",
      min: 0,
      message: "Unit price must be greater than or equal to 0",
      trigger: "blur",
    },
  ],
  unit: [
    {
      required: true,
      message: "Unit is required",
      trigger: "change",
    },
  ],
});

// Refs
const formRef = ref<FormInstance>();
const submitting = ref(false);
const uploading = ref(false);

// Computed
const isEdit = computed(() => props.mode === "edit");

// Watch for initial data changes
watch(
  () => props.initial,
  (val) => {
    if (!val) {
      resetForm();
      return;
    }

    Object.assign(form, {
      id: val.id ?? "",
      itemId: val.itemId ?? "",
      itemDescription: val.itemDescription ?? "",
      unitOfPrice: val.unitOfPrice ?? 0,
      unit: val.unit ?? "",
      itemGraph: val.itemGraph ?? "",
    });
  },
  { immediate: true, deep: true },
);

// Methods
function resetForm() {
  form.id = "";
  form.itemId = "";
  form.itemDescription = "";
  form.unitOfPrice = 0;
  form.unit = "";
  form.itemGraph = "";

  if (formRef.value) {
    formRef.value.clearValidate();
  }
}

async function onSubmit() {
  if (!formRef.value) return;

  try {
    submitting.value = true;

    // Validate form
    await formRef.value.validate();

    // Prepare form data
    const formData: ItemFormData = {
      ...form,
    };

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Emit success
    emit("close", {
      ok: true,
      data: formData,
    });

    ElMessage.success(
      `Item ${isEdit.value ? "updated" : "created"} successfully`,
    );
  } catch (error) {
    console.error("Item form validation failed:", error);
    ElMessage.error("Please check the form for errors");
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  emit("close");
}

// Image upload methods
function beforeUpload(file: File) {
  const isValidType = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
  ].includes(file.type);
  const isValidSize = file.size / 1024 / 1024 < 2;

  if (!isValidType) {
    ElMessage.error("Image must be JPG, PNG or GIF format!");
    return false;
  }
  if (!isValidSize) {
    ElMessage.error("Image size cannot exceed 2MB!");
    return false;
  }
  return true;
}

function handleUpload(options: { file: File }) {
  const { file } = options;
  uploading.value = true;

  // Simulate upload process
  setTimeout(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      form.itemGraph = e.target?.result as string;
      uploading.value = false;
      ElMessage.success("Image uploaded successfully");
    };
    reader.onerror = () => {
      uploading.value = false;
      ElMessage.error("Failed to upload image");
    };
    reader.readAsDataURL(file);
  }, 1000);
}

function removeImage() {
  form.itemGraph = "";
  ElMessage.info("Image removed");
}

// Lifecycle
onMounted(() => {
  // Additional initialization if needed
});
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

.image-upload-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.avatar-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
  width: 148px;
  height: 148px;
}

.avatar-uploader:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--el-text-color-secondary);
}

.upload-text {
  margin-top: 8px;
  font-size: 12px;
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.upload-actions {
  display: flex;
  gap: 8px;
}

.upload-tips {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.4;
}

.upload-tips p {
  margin: 2px 0;
}

:deep(.el-upload) {
  width: 100%;
  height: 100%;
}

:deep(.el-upload-disabled) {
  cursor: not-allowed;
}

:deep(.el-upload-disabled:hover) {
  border-color: var(--el-border-color);
}
</style>
