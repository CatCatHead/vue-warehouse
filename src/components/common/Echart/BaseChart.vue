<template>
  <v-chart
    class="base-chart"
    :option="option"
    :theme="theme"
    :autoresize="autoresize"
    @click="onClick"
    @finished="onFinished"
    ref="chartRef"
  />
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, LineChart, PieChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
import VChart from "vue-echarts";
use([
  CanvasRenderer,
  BarChart,
  LineChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
]);

//props

defineProps({
  option: { type: Object, required: true },
  theme: { type: String, default: "" },
  autoresize: { type: Boolean, default: true },
});

// Emits
const emit = defineEmits(["chart-ready", "chart-click", "chart-finished"]);

const chartRef = ref(null);

function onClick(params) {
  emit("chart-click", params);
}

function onFinished() {
  emit("chart-finished", chartRef.value);
  emit("chart-ready", chartRef.value);
}
</script>

<style scoped>
.base-chart {
  width: 100%;
  height: 400px;
}
</style>
