<!-- src/components/Dashboard/RealTimeStats.vue -->
<template>
  <el-card class="real-time-stats">
    <template #header>
      <div class="card-header">
        <span>Real data</span>
        <el-button link :icon="Refresh" @click="refresh">Refresh</el-button>
      </div>
    </template>

    <div class="stats-grid">
      <div v-for="stat in stats" :key="stat.label" class="stat-item">
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-trend" :class="stat.trend">
          <el-icon><TrendCharts /></el-icon>
          {{ stat.change }}
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Refresh, TrendCharts } from "@element-plus/icons-vue";

const stats = ref([
  { label: "Online user", value: "1,248", change: "+12.5%", trend: "up" },
  { label: "Today order", value: "356", change: "+8.3%", trend: "up" },
  { label: "Processing", value: "89", change: "-3.2%", trend: "down" },
  { label: "Response time", value: "128ms", change: "+2.1%", trend: "down" },
]);

let interval: number;

const refresh = () => {
  stats.value.forEach((stat) => {
    const change = Math.random() > 0.5 ? "+" : "-";
    const value = (Math.random() * 10).toFixed(1);
    stat.change = `${change}${value}%`;
    stat.trend = change === "+" ? "up" : "down";
  });
};

onMounted(() => {
  interval = window.setInterval(refresh, 10000);
});

onUnmounted(() => {
  clearInterval(interval);
});
</script>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stat-item {
  text-align: center;
  padding: 16px;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-text-color-primary);
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 4px 0;
}

.stat-trend {
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.stat-trend.up {
  color: var(--el-color-success);
}

.stat-trend.down {
  color: var(--el-color-error);
}
</style>
