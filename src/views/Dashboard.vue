<template>
  <div class="dashboard">
    <h1>Dashboard</h1>
    <p>Welcome to your VaaS admin dashboard</p>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-statistic title="Total Users" :value="1254" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="Active Sessions" :value="86" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="Storage Used" :value="76.5" suffix="%" />
      </el-col>
      <el-col :span="6">
        <el-statistic title="Uptime" :value="99.8" suffix="%" />
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
// Dashboard page with statistics
</script>

<style scoped>
.dashboard {
  padding: 20px;
}
.stats-row {
  margin-top: 30px;
}
</style>