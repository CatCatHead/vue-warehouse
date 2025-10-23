<template>
  <BaseChart
    :option="chartOption"
    @chart-click="handleClick"
    @chart-ready="handleReady"
  />
</template>

<script lang="ts" setup>
import BaseChart from "@/components/common/Echart/BaseChart.vue";

const chartOption = {
  title: { text: "Tracking Carrier" },
  tooltip: {},
  xAxis: { data: ["FedEx Express", "FedEx Ground", "UPS", "Other"] },
  yAxis: {},
  series: [{ type: "bar", data: [50, 35, 20, 5] }],
};

function handleClick() {}

function handleReady() {}
</script>
