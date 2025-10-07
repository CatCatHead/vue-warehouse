<template>
  <el-dialog
    v-model="dialogVisible"
    :title="dialogTitle"
    width="600px"
    :before-close="handleClose"
  >
    <GenericForm
      ref="formRef"
      :title="dialogTitle"
      :fields="formFields"
      :model-value="formData"
      :rules="formRules"
      :show-cancel="true"
      :submit-text="submitButtonText"
      @submit="handleSubmit"
      @cancel="handleClose"
    />
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import GenericForm from "@/components/common/Form/GenericForm.vue";
import type { FormField } from "@/components/common/Form/GenericForm.vue";
import type { FormRules } from "element-plus";

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

const formRef = ref();

// Form configuration
const formFields = reactive<FormField[]>([
  {
    type: "input",
    label: "Username",
    prop: "username",
    placeholder: "Please enter username",
    required: true,
    disabled: computed(() => props.mode === "edit").value,
    maxlength: 20,
    showWordLimit: true,
    colProps: { span: 24 },
  },
  {
    type: "input",
    label: "Email",
    prop: "email",
    placeholder: "Please enter email address",
    required: true,
    colProps: { span: 24 },
  },
  {
    type: "input",
    label: "Phone",
    prop: "phone",
    placeholder: "Please enter phone number",
    required: true,
    colProps: { span: 24 },
  },
  {
    type: "select",
    label: "Role",
    prop: "role",
    placeholder: "Please select role",
    required: true,
    options: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
      { label: "Viewer", value: "viewer" },
    ],
    colProps: { span: 12 },
  },
  {
    type: "input",
    label: "Department",
    prop: "department",
    placeholder: "Please enter department",
    required: true,
    colProps: { span: 12 },
  },
  {
    type: "password",
    label: "Password",
    prop: "password",
    placeholder: "Please enter password",
    required: computed(() => props.mode === "add").value,
    colProps: { span: 24 },
  },
  {
    type: "switch",
    label: "Status",
    prop: "status",
    activeText: "Active",
    inactiveText: "Inactive",
    colProps: { span: 24 },
  },
]);

// Form data
const formData = reactive({
  username: "",
  email: "",
  phone: "",
  role: "",
  department: "",
  password: "",
  status: "active",
});

// Form validation rules
const formRules = reactive<FormRules>({
  email: [
    { required: true, message: "Email is required", trigger: "blur" },
    {
      type: "email",
      message: "Please enter valid email address",
      trigger: "blur",
    },
  ],
  phone: [
    { required: true, message: "Phone is required", trigger: "blur" },
    {
      pattern: /^1[3-9]\d{9}$/,
      message: "Please enter valid phone number",
      trigger: "blur",
    },
  ],
  password: [
    {
      required: computed(() => props.mode === "add").value,
      message: "Password is required",
      trigger: "blur",
    },
    {
      min: 6,
      message: "Password must be at least 6 characters",
      trigger: "blur",
    },
  ],
});

// Computed properties
const dialogVisible = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value),
});

const dialogTitle = computed(() => {
  return props.mode === "add" ? "Add User" : "Edit User";
});

const submitButtonText = computed(() => {
  return props.mode === "add" ? "Create User" : "Update User";
});

// Watch for user data changes
watch(
  () => props.userData,
  (newUser) => {
    if (newUser) {
      Object.assign(formData, {
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        department: newUser.department,
        status: newUser.status,
        password: "",
      });
    } else {
      resetForm();
    }
  },
  { immediate: true },
);

// Methods
const resetForm = () => {
  Object.assign(formData, {
    username: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    password: "",
    status: "active",
  });
  formRef.value?.clearValidate();
};

const handleClose = () => {
  dialogVisible.value = false;
  resetForm();
};

const handleSubmit = async (submitData: any) => {
  try {
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    ElMessage.success(
      props.mode === "add"
        ? "User created successfully"
        : "User updated successfully",
    );

    emit("success");
    handleClose();
  } catch (error) {
    ElMessage.error("Operation failed");
  }
};
</script>
