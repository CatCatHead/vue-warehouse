<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="140px"
    status-icon
  >
    <el-form-item label="Department Code" prop="departmentCode">
      <el-input
        v-model="form.departmentCode"
        placeholder="Enter department code"
        clearable
        style="width: 100%"
      />
    </el-form-item>

    <el-form-item label="Department Name" prop="departmentName">
      <el-input
        v-model="form.departmentName"
        placeholder="Enter department name"
        clearable
        style="width: 100%"
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

const props = defineProps<{
  mode: "add" | "edit";
  initial?: {
    id?: string | number;
    departmentCode?: string;
    departmentName?: string;
  };
}>();

const emit = defineEmits<{
  (e: "close", payload?: { ok?: boolean; data?: any }): void;
}>();

const form = reactive({
  id: "" as string | number,
  departmentCode: "",
  departmentName: "",
});

watch(
  () => props.initial,
  (val) => {
    if (!val) {
      form.id = "";
      form.departmentCode = "";
      form.departmentName = "";
      return;
    }

    form.id = val.id ?? "";
    form.departmentCode = val.departmentCode ?? "";
    form.departmentName = val.departmentName ?? "";
  },
  { immediate: true },
);

const rules = reactive<FormRules>({
  departmentCode: [
    {
      required: true,
      message: "Department code is required",
      trigger: "blur",
    },
    {
      min: 1,
      max: 50,
      message: "Length should be 1 to 50 characters",
      trigger: "blur",
    },
  ],
  departmentName: [
    {
      required: true,
      message: "Department name is required",
      trigger: "blur",
    },
    {
      min: 1,
      max: 100,
      message: "Length should be 1 to 100 characters",
      trigger: "blur",
    },
  ],
});

const formRef = ref<FormInstance>();
const submitting = ref(false);
const isEdit = computed(() => props.mode === "edit");

async function onSubmit() {
  if (!formRef.value) return;

  try {
    submitting.value = true;

    await formRef.value.validate();

    const formData = {
      ...form,
    };

    await new Promise((resolve) => setTimeout(resolve, 300));

    emit("close", {
      ok: true,
      data: formData,
    });
  } catch (error) {
    console.error("Department form validation failed:", error);
    ElMessage.error("Please check the form for errors");
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  emit("close");
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
