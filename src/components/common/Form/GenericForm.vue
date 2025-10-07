<template>
  <div class="generic-form">
    <!-- Form Header -->
    <div v-if="title || $slots.header" class="form-header">
      <slot name="header">
        <h3 v-if="title" class="form-title">{{ title }}</h3>
      </slot>
    </div>

    <!-- Main Form -->
    <el-form
      ref="formRef"
      :model="formData"
      :rules="formRules"
      :label-width="labelWidth"
      :label-position="labelPosition"
      :disabled="disabled"
      @submit.prevent="handleSubmit"
    >
      <el-row :gutter="rowGutter">
        <template v-for="field in fields" :key="field.prop">
          <el-col v-bind="getColProps(field)">
            <el-form-item
              :label="field.label"
              :prop="field.prop"
              :required="field.required"
            >
              <!-- Input Field -->
              <el-input
                v-if="field.type === 'input' || field.type === 'password'"
                v-model="formData[field.prop]"
                :type="field.type"
                :placeholder="
                  field.placeholder || `Please select ${field.label}`
                "
                :clearable="field.clearable"
                :show-password="field.type === 'password'"
                :disabled="field.disabled"
                :maxlength="field.maxlength"
                :show-word-limit="field.showWordLimit"
              />

              <!-- Number Input -->
              <el-input-number
                v-else-if="field.type === 'number'"
                v-model="formData[field.prop]"
                :placeholder="field.placeholder"
                :controls-position="field.controlsPosition || 'right'"
                :min="field.min"
                :max="field.max"
                :step="field.step"
                :precision="field.precision"
                :disabled="field.disabled"
                style="width: 100%"
              />

              <!-- Select -->
              <el-select
                v-else-if="field.type === 'select'"
                v-model="formData[field.prop]"
                :placeholder="
                  field.placeholder || `Please select ${field.label}`
                "
                :clearable="field.clearable !== false"
                :multiple="field.multiple"
                :filterable="field.filterable"
                :disabled="field.disabled"
                style="width: 100%"
              >
                <el-option
                  v-for="option in field.options"
                  :key="getOptionValue(option, field.valueKey)"
                  :label="getOptionLabel(option, field.labelKey)"
                  :value="getOptionValue(option, field.valueKey)"
                />
              </el-select>

              <!-- Date Picker -->
              <el-date-picker
                v-else-if="field.type === 'date'"
                v-model="formData[field.prop]"
                type="date"
                :placeholder="
                  field.placeholder || `Please select ${field.label}`
                "
                :clearable="field.clearable !== false"
                :value-format="field.valueFormat || 'YYYY-MM-DD'"
                :disabled="field.disabled"
                style="width: 100%"
              />

              <!-- DateTime Picker -->
              <el-date-picker
                v-else-if="field.type === 'datetime'"
                v-model="formData[field.prop]"
                type="datetime"
                :placeholder="
                  field.placeholder || `Please select ${field.label}`
                "
                :clearable="field.clearable !== false"
                :value-format="field.valueFormat || 'YYYY-MM-DD HH:mm:ss'"
                :disabled="field.disabled"
                style="width: 100%"
              />

              <!-- Time Picker -->
              <el-time-picker
                v-else-if="field.type === 'time'"
                v-model="formData[field.prop]"
                :placeholder="
                  field.placeholder || `Please select ${field.label}`
                "
                :clearable="field.clearable !== false"
                :value-format="field.valueFormat || 'HH:mm:ss'"
                :disabled="field.disabled"
                style="width: 100%"
              />

              <!-- Switch -->
              <el-switch
                v-else-if="field.type === 'switch'"
                v-model="formData[field.prop]"
                :active-text="field.activeText"
                :inactive-text="field.inactiveText"
                :disabled="field.disabled"
              />

              <!-- Radio Group -->
              <el-radio-group
                v-else-if="field.type === 'radio'"
                v-model="formData[field.prop]"
                :disabled="field.disabled"
              >
                <el-radio
                  v-for="option in field.options"
                  :key="getOptionValue(option, field.valueKey)"
                  :label="getOptionValue(option, field.valueKey)"
                >
                  {{ getOptionLabel(option, field.labelKey) }}
                </el-radio>
              </el-radio-group>

              <!-- Checkbox Group -->
              <el-checkbox-group
                v-else-if="field.type === 'checkbox'"
                v-model="formData[field.prop]"
                :disabled="field.disabled"
              >
                <el-checkbox
                  v-for="option in field.options"
                  :key="getOptionValue(option, field.valueKey)"
                  :label="getOptionValue(option, field.valueKey)"
                >
                  {{ getOptionLabel(option, field.labelKey) }}
                </el-checkbox>
              </el-checkbox-group>

              <!-- Textarea -->
              <el-input
                v-else-if="field.type === 'textarea'"
                v-model="formData[field.prop]"
                type="textarea"
                :placeholder="
                  field.placeholder || `Please input ${field.label}`
                "
                :rows="field.rows || 4"
                :clearable="field.clearable"
                :disabled="field.disabled"
                :maxlength="field.maxlength"
                :show-word-limit="field.showWordLimit"
              />

              <!-- Custom Slot -->
              <slot
                v-else-if="field.type === 'custom'"
                :name="`field-${field.prop}`"
                :field="field"
                :form-data="formData"
              />

              <!-- Default to Input -->
              <el-input
                v-else
                v-model="formData[field.prop]"
                :placeholder="
                  field.placeholder || `Please input ${field.label}`
                "
                :clearable="field.clearable"
                :disabled="field.disabled"
              />
            </el-form-item>
          </el-col>
        </template>
      </el-row>

      <!-- Form Actions -->
      <div v-if="showActions" class="form-actions">
        <slot name="actions" :form-data="formData" :valid="formValid">
          <el-button
            type="primary"
            :loading="submitLoading"
            @click="handleSubmit"
          >
            {{ submitText }}
          </el-button>
          <el-button @click="handleReset">Reset</el-button>
          <el-button v-if="showCancel" @click="handleCancel">Cancel</el-button>
        </slot>
      </div>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, nextTick } from "vue";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";

// Field type definitions
interface FormField {
  type:
    | "input"
    | "password"
    | "number"
    | "select"
    | "date"
    | "datetime"
    | "time"
    | "switch"
    | "radio"
    | "checkbox"
    | "textarea"
    | "custom";
  label: string;
  prop: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  // Layout
  colProps?: { [key: string]: any };
  // Input specific
  maxlength?: number;
  showWordLimit?: boolean;
  // Number input specific
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  controlsPosition?: "right" | "";
  // Select/Radio/Checkbox specific
  options?: any[];
  valueKey?: string;
  labelKey?: string;
  multiple?: boolean;
  filterable?: boolean;
  // Date/Time specific
  valueFormat?: string;
  // Switch specific
  activeText?: string;
  inactiveText?: string;
  // Textarea specific
  rows?: number;
  // Validation rules (can be extended from FormRules)
  rules?: FormRules[string];
}

interface Props {
  // Form configuration
  title?: string;
  fields: FormField[];
  modelValue?: { [key: string]: any };
  rules?: FormRules;
  labelWidth?: string;
  labelPosition?: "left" | "right" | "top";
  rowGutter?: number;
  defaultColProps?: { [key: string]: any };
  // Actions
  showActions?: boolean;
  showCancel?: boolean;
  submitText?: string;
  // State
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: "100px",
  labelPosition: "right",
  rowGutter: 20,
  defaultColProps: () => ({ xs: 24, sm: 24, md: 12, lg: 8, xl: 8 }),
  showActions: true,
  showCancel: false,
  submitText: "提交",
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  "update:modelValue": [value: { [key: string]: any }];
  submit: [formData: { [key: string]: any }];
  reset: [];
  cancel: [];
  validate: [valid: boolean];
}>();

// Refs
const formRef = ref<FormInstance>();
const submitLoading = ref(false);

// Form data
const formData = reactive<{ [key: string]: any }>({ ...props.modelValue });

// Form rules
const formRules = computed<FormRules>(() => {
  const rules: FormRules = { ...props.rules };

  // Auto-generate required rules for fields with required flag
  props.fields.forEach((field) => {
    if (field.required && !rules[field.prop]) {
      rules[field.prop] = [
        {
          required: true,
          message: `${field.label} can't be empty`,
          trigger: field.type === "select" ? "change" : "blur",
        },
      ];
    }

    // Merge field-specific rules
    if (field.rules) {
      rules[field.prop] = [
        ...(rules[field.prop] || []),
        ...(Array.isArray(field.rules) ? field.rules : [field.rules]),
      ];
    }
  });

  return rules;
});

// Form validation state
const formValid = ref(false);

// Computed
const getColProps = (field: FormField) => {
  return field.colProps || props.defaultColProps;
};

// Methods
const getOptionLabel = (option: any, labelKey?: string): string => {
  if (typeof option === "string") return option;
  return (
    option[labelKey || "label"] || option.name || option.title || String(option)
  );
};

const getOptionValue = (option: any, valueKey?: string): any => {
  if (typeof option === "string") return option;
  return option[valueKey || "value"] || option.id || option.key || option;
};

// Form operations
const validate = async (): Promise<boolean> => {
  if (!formRef.value) return false;

  try {
    await formRef.value.validate();
    formValid.value = true;
    emit("validate", true);
    return true;
  } catch (error) {
    formValid.value = false;
    emit("validate", false);
    return false;
  }
};

const resetFields = () => {
  formRef.value?.resetFields();
  emit("reset");
};

const clearValidate = () => {
  formRef.value?.clearValidate();
};

const getFormData = () => {
  return { ...formData };
};

const setFormData = (data: { [key: string]: any }) => {
  Object.keys(data).forEach((key) => {
    if (key in formData) {
      formData[key] = data[key];
    }
  });
};

// Event handlers
const handleSubmit = async () => {
  submitLoading.value = true;

  try {
    const isValid = await validate();
    if (isValid) {
      emit("submit", getFormData());
    }
  } catch (error) {
    console.error("Form validation failed:", error);
  } finally {
    submitLoading.value = false;
  }
};

const handleReset = () => {
  resetFields();
};

const handleCancel = () => {
  emit("cancel");
};

// Watch for modelValue changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      setFormData(newValue);
    }
  },
  { deep: true },
);

// Initialize form data
const initializeFormData = () => {
  props.fields.forEach((field) => {
    if (formData[field.prop] === undefined) {
      // Set default values based on field type
      switch (field.type) {
        case "number":
          formData[field.prop] = 0;
          break;
        case "select":
        case "radio":
          formData[field.prop] = field.multiple ? [] : "";
          break;
        case "checkbox":
          formData[field.prop] = [];
          break;
        case "switch":
          formData[field.prop] = false;
          break;
        default:
          formData[field.prop] = "";
      }
    }
  });
};

// Expose methods to parent component
defineExpose({
  validate,
  resetFields,
  clearValidate,
  getFormData,
  setFormData,
});

// Initialize
nextTick(() => {
  initializeFormData();
});
</script>

<style scoped>
.generic-form {
  width: 100%;
}

.form-header {
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.form-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.form-actions {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-light);
  text-align: right;
}

/* Responsive design */
@media (max-width: 768px) {
  .form-actions {
    text-align: center;
  }

  .form-actions .el-button {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>
