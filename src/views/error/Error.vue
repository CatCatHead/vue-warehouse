<template>
  <div class="error-page">
    <div class="content">
      <h1>500</h1>
      <p>Something went wrong</p>
      <el-button type="primary" @click="goHome">Go to Dashboard</el-button>
      <el-button @click="retry">Retry</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push("/");
};

const retry = () => {
  window.location.reload();
};
</script>

<style scoped>
.error-page {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
  color: white;
  text-align: center;
}

.content h1 {
  font-size: 120px;
  margin: 0;
  font-weight: bold;
}

.content p {
  font-size: 18px;
  margin: 20px 0 30px;
}
</style>
