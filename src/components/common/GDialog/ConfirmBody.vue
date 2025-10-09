<template>
  <div class="p-2">
    <div class="text-sm leading-6 whitespace-pre-line">{{ message }}</div>
    <div class="flex justify-end gap-2 mt-4">
      <el-button @click="emit('close')">{{ cancelTextComputed }}</el-button>
      <el-button type="primary" @click="emit('close', { ok: true })">
        {{ confirmTextComputed }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
// Use English comments only
const props = defineProps<{
  message: string;
  confirmText?: string;
  cancelText?: string;
}>();

const confirmTextComputed = props.confirmText ?? "Confirm";
const cancelTextComputed = props.cancelText ?? "Cancel";

const emit = defineEmits<{
  (e: "close", payload?: { ok?: boolean }): void;
}>();
</script>
