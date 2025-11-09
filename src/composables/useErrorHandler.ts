// src/composables/useErrorHandler.ts
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useAuthStore } from "@/store/auth";
import { useRouter } from "vue-router";

export function useErrorHandler() {
  const error = ref<string | null>(null);
  const authStore = useAuthStore();
  const router = useRouter();

  const handleError = (err: any, context = "Operation") => {
    console.error(`${context} failed:`, err);

    let message = `${context} failed, please try again`;

    if (err?.response?.data?.message) {
      message = err.response.data.message;
    } else if (err?.message) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    }

    error.value = message;
    ElMessage.error(message);
  };

  const handleNetworkError = () => {
    ElMessageBox.alert("Network connection error", "Network Error", {
      confirmButtonText: "Retry",
      callback: () => {
        window.location.reload();
      },
    });
  };

  const handleAuthError = () => {
    ElMessageBox.alert(
      "Authentication failed, please login again",
      "Authentication Error",
      {
        confirmButtonText: "Login",
        callback: () => {
          authStore.logout();
          router.push("/login");
        },
      },
    );
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    error,
    handleError,
    handleNetworkError,
    handleAuthError,
    clearError,
  };
}
