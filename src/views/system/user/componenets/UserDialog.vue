<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :before-close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      label-width="80px"
      label-position="right"
    >
      <el-form-item label="username" prop="username">
        <el-input
          v-model="formData.username"
          placeholder="Input username"
          :disabled="mode === 'edit'"
        />
      </el-form-item>

      <el-form-item label="email" prop="email">
        <el-input
          v-model="formData.email"
          placeholder="Input email address"
          type="email"
        />
      </el-form-item>

      <el-form-item label="phone" prop="phone">
        <el-input v-model="formData.phone" placeholder="Input phone number" />
      </el-form-item>

      <el-form-item label="role" prop="role">
        <el-select
          v-model="formData.role"
          placeholder="Select role"
          style="width: 100%"
        >
          <el-option label="admin" value="admin" />
          <el-option label="editor" value="editor" />
          <el-option label="viewer" value="viewer" />
        </el-select>
      </el-form-item>

      <el-form-item label="department" prop="department">
        <el-input
          v-model="formData.department"
          placeholder="input department"
        />
      </el-form-item>

      <el-form-item v-if="mode === 'add'" label="password" prop="password">
        <el-input
          v-model="formData.password"
          type="password"
          placeholder="Input password"
          show-password
        />
      </el-form-item>

      <el-form-item label="status">
        <el-switch
          v-model="formData.status"
          :active-value="'active'"
          :inactive-value="'inactive'"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          Confirm
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  department: string;
  phone: string;
  status: "active" | "inactive";
  password?: string;
}

interface Props {
  modelValue: boolean;
  userData?: User | null;
  mode: "add" | "edit";
}

const props = defineProps<Props>();
const emit = defineEmits(["update:modelValue", "success"]);

const formRef = ref<FormInstance>();
const loading = ref(false);

const formData = reactive({
  username: "",
  email: "",
  role: "",
  department: "",
  phone: "",
  status: "active" as "active" | "inactive",
  password: "",
});

const formRules: FormRules = {
  username: [
    { required: true, message: "Input username", trigger: "blur" },
    {
      min: 3,
      max: 20,
      message: "Username length is between 3 - 20",
      trigger: "blur",
    },
  ],
  email: [
    { required: true, message: "Input your email", trigger: "blur" },
    {
      type: "email",
      message: "Please correct your email address",
      trigger: "blur",
    },
  ],
  role: [{ required: true, message: "Select role", trigger: "change" }],
  department: [
    { required: true, message: "Input department", trigger: "blur" },
  ],
  phone: [
    { required: true, message: "Input phone number", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "Correct phone number",
      trigger: "blur",
    },
  ],
  password: [
    { required: true, message: "Please enter your password", trigger: "blur" },
    {
      min: 6,
      message: "Password length must be longer than 6 chars",
      trigger: "blur",
    },
  ],
};

const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const dialogTitle = computed(() => {
  return props.mode === "add" ? "Create user" : "Edit user";
});

const resetForm = () => {
  Object.assign(formData, {
    username: "",
    email: "",
    role: "",
    department: "",
    phone: "",
    status: "active",
    password: "",
  });
  formRef.value?.clearValidate();
};

watch(
  () => props.userData,
  (newUser) => {
    if (newUser) {
      Object.assign(formData, {
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        phone: newUser.phone,
        status: newUser.status,
        password: "",
      });
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

const handleClose = () => {
  dialogVisible.value = false;
  resetForm();
};

const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;

    await new Promise((resolve) => setTimeout(resolve, 1000));

    ElMessage.success(props.mode === "add" ? "User created!" : "User Updated!");
    emit("success");
    handleClose();
  } catch (error) {
    console.error("Form validated unsuccessfully:", error);
  } finally {
    loading.value = false;
  }
};
</script>
