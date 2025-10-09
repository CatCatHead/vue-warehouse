<!-- src/views/system/user/components/UserForm.vue -->
<template>
  <el-form
    ref="formRef"
    :model="form"
    :rules="rules"
    label-width="110px"
    status-icon
  >
    <el-form-item label="Username" prop="username">
      <el-input
        v-model="form.username"
        placeholder="Enter username"
        clearable
      />
    </el-form-item>

    <el-form-item :label="labelWithOptional('Email', true)" prop="email">
      <el-input v-model="form.email" placeholder="Enter email" clearable />
    </el-form-item>

    <el-form-item label="User Role" prop="role">
      <el-select
        v-model="form.role"
        placeholder="Select role"
        style="width: 220px"
      >
        <el-option
          v-for="opt in roleOptions"
          :key="opt.value"
          :label="opt.label"
          :value="opt.value"
        />
      </el-select>
    </el-form-item>

    <el-form-item label="Department" prop="department">
      <el-input
        v-model="form.department"
        placeholder="Enter department"
        clearable
      />
    </el-form-item>

    <el-form-item :label="labelWithOptional('Phone', true)" prop="phone">
      <el-input
        v-model="form.phone"
        placeholder="Enter phone number"
        clearable
      />
    </el-form-item>

    <el-form-item label="Status" prop="status">
      <el-switch
        v-model="form.status"
        :active-value="'active'"
        :inactive-value="'inactive'"
        active-text="Active"
        inactive-text="Inactive"
      />
    </el-form-item>

    <div class="form-actions">
      <el-button :disabled="submitting" @click="onCancel">Cancel</el-button>
      <el-button type="primary" :loading="submitting" @click="onSubmit"
        >Save</el-button
      >
    </div>
  </el-form>
</template>

<script setup lang="ts">
// Use English comments only
import { ref, reactive, watch, computed } from "vue";
import type { FormInstance, FormRules } from "element-plus";

/** Props from opener */
const props = defineProps<{
  mode: "add" | "edit";
  initial?: {
    id?: string;
    username?: string;
    email?: string;
    role?: "admin" | "editor" | "viewer" | string;
    department?: string;
    phone?: string;
    createTime?: string;
    status?: "active" | "inactive";
    avatar?: string;
  };
}>();

/** Emits a close event with optional payload */
const emit = defineEmits<{
  (e: "close", payload?: { ok?: boolean; data?: any }): void;
}>();

/** Local form state */
const form = reactive({
  id: "" as string,
  username: "",
  email: "",
  role: "" as "admin" | "editor" | "viewer" | "" | string,
  department: "",
  phone: "",
  status: "active" as "active" | "inactive",
});

/** Prefill from props.initial */
watch(
  () => props.initial,
  (val) => {
    if (!val) {
      form.id = "";
      form.username = "";
      form.email = "";
      form.role = "";
      form.department = "";
      form.phone = "";
      form.status = "active";
      return;
    }
    form.id = val.id ?? "";
    form.username = val.username ?? "";
    form.email = val.email ?? "";
    form.role = (val.role as any) ?? "";
    form.department = val.department ?? "";
    form.phone = val.phone ?? "";
    form.status = (val.status as any) ?? "active";
  },
  { immediate: true },
);

/** Options */
const roleOptions = [
  { label: "Admin", value: "admin" },
  { label: "Editor", value: "editor" },
  { label: "Viewer", value: "viewer" },
];

/** Safe regex for phone (optional): digits, space, +, (), - ; 6~20 length */
const PHONE_RE = /^[\d()+\s-]{6,20}$/;

/** Validation rules
 * - Only email & phone are optional:
 *   - If empty -> pass
 *   - If provided -> check format
 * - Others are required.
 */
const rules = reactive<FormRules>({
  username: [
    { required: true, message: "Username is required", trigger: "blur" },
    { min: 2, max: 20, message: "2-20 characters", trigger: "blur" },
  ],
  email: [
    // optional: only check format when provided
    {
      validator: (_r, v, cb) =>
        !v || /.+@.+\..+/.test(v) ? cb() : cb(new Error("Invalid email")),
      trigger: ["blur", "change"],
    },
  ],
  role: [{ required: true, message: "Role is required", trigger: "change" }],
  department: [
    { required: true, message: "Department is required", trigger: "blur" },
  ],
  phone: [
    // optional: only check format when provided
    {
      validator: (_r, v, cb) =>
        !v || PHONE_RE.test(v) ? cb() : cb(new Error("Invalid phone number")),
      trigger: ["blur", "change"],
    },
  ],
  status: [
    { required: true, message: "Status is required", trigger: "change" },
  ],
});

/** Helpers */
function labelWithOptional(text: string, optional: boolean) {
  return optional ? `${text} (optional)` : text;
}

/** Submit/Cancel */
const formRef = ref<FormInstance>();
const submitting = ref(false);
const isEdit = computed(() => props.mode === "edit");

async function onSubmit() {
  try {
    submitting.value = true;
    await formRef.value?.validate();
    await new Promise((r) => setTimeout(r, 400)); // simulate request
    emit("close", {
      ok: true,
      data: {
        ...form,
        id: isEdit.value ? form.id : createId(),
        createTime: isEdit.value
          ? (props.initial?.createTime ?? new Date().toISOString())
          : new Date().toISOString(),
      },
    });
  } finally {
    submitting.value = false;
  }
}

function onCancel() {
  emit("close");
}

function createId() {
  try {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return String(a[0]);
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
  margin-top: 8px;
}
</style>
