<template>
  <div style="padding: 20px; border: 1px solid #ccc; margin: 20px">
    <h3>Mock Test</h3>
    <el-button @click="handleLogin" type="primary"> Mock Login </el-button>
    <el-button @click="handleLogout" type="danger"> Mock Logout </el-button>

    <div style="margin-top: 20px">
      <p>Current Status: {{ auth.isAuthenticated ? "Login" : "Not Login" }}</p>
      <p>Username: {{ auth.user?.username || "Not Login" }}</p>
      <p>Token: {{ auth.accessToken || "None" }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from "@/store/auth";

const auth = useAuthStore();

const handleLogin = async () => {
  const success = await auth.login("testuser", "password123", true);
  if (success) {
    console.log("Success！");
  } else {
    console.log("Failed！");
  }
};

const handleLogout = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("remember_me");
  window.location.reload();
};
</script>
