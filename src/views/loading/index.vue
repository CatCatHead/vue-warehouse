<template>
  <div class="loading-page">
    <el-card class="loading-card">
      <div class="loading-content">
        <el-icon class="loading-icon" :size="48"><Loading /></el-icon>
        <h3>Loading Page</h3>
        <p>Please wait while we prepare your page...</p>
        <el-progress :percentage="progress" :show-text="false" />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Loading } from "@element-plus/icons-vue";

const router = useRouter();
const progress = ref(0);
let progressInterval: number;

onMounted(() => {
  progressInterval = window.setInterval(() => {
    if (progress.value < 90) {
      progress.value += 10;
    }
  }, 200);
});

onUnmounted(() => {
  if (progressInterval) {
    clearInterval(progressInterval);
  }
});
</script>

<style scoped>
.loading-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 60vh;
  padding: 20px;
}

.loading-card {
  width: 400px;
  text-align: center;
}

.loading-content {
  padding: 40px 20px;
}

.loading-icon {
  color: var(--el-color-primary);
  margin-bottom: 20px;
  animation: spin 2s linear infinite;
}

.loading-content h3 {
  margin: 0 0 12px 0;
  color: var(--el-text-color-primary);
}

.loading-content p {
  margin: 0 0 24px 0;
  color: var(--el-text-color-regular);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
