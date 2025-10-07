<template>
  <WaveBackground />
  <div class="login-page">
    <el-card class="login-card">
      <template #header>
        <div class="login-header">
          <h2>Warehouse Admin</h2>
        </div>
      </template>

      <el-form :model="loginForm" :rules="loginRules" ref="loginFormRef">
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="Username"
            size="large"
            :prefix-icon="User"
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="password"
            size="large"
            :prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item>
          <el-checkbox v-model="loginForm.rememberMe">
            Remember Me
          </el-checkbox>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            @click="handleLogin"
            style="width: 100%"
          >
            {{ loading ? "Logining..." : "Logon" }}
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage, type FormInstance, type FormRules } from "element-plus";
import { User, Lock } from "@element-plus/icons-vue";
import { useAuthStore } from "@/store/auth.ts";
import WaveBackground from "@/styles/WaveBackground.vue";
import { useThemeStore } from "@/store/theme.ts";

const router = useRouter();
const authStore = useAuthStore();
const loginFormRef = ref<FormInstance>();
const loading = ref(false);

const loginForm = reactive({
  username: "",
  password: "",
  rememberMe: false,
});

const loginRules: FormRules = {
  username: [
    { required: true, message: "Please input username", trigger: "blur" },
  ],
  password: [
    { required: true, message: "Please input password", trigger: "blur" },
  ],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  try {
    await loginFormRef.value.validate();
    loading.value = true;

    const success = await authStore.login(
      loginForm.username,
      loginForm.password,
      loginForm.rememberMe,
    );

    if (success) {
      ElMessage.success("Successfully logged in！");
      router.push("/");
    } else {
      ElMessage.error("Failed, please try again");
    }
  } catch (error) {
    console.error("Login error:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  padding: 20px;
}

.login-card {
  width: 400px;
  max-width: 90vw;
}

.login-header {
  text-align: center;
}

.login-header h2 {
  margin: 0;
  color: #409eff;
}
</style>
