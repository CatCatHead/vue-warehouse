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

<style src="./NotFound.css" scoped></style>
