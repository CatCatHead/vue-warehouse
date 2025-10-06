<template>
  <div class="not-found">
    <div class="content">
      <h1>404</h1>
      <p>Ohhh, page flies away</p>
      <el-button type="primary" @click="goHome"> Dashboard </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  router.push("/");
};
</script>

<style scoped>
.not-found {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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
