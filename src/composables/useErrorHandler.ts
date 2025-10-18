// src/composables/useErrorHandler.ts
import { ref } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

export function useErrorHandler() {
  const error = ref<string | null>(null);

  const handleError = (err: any, context = "Action") => {
    console.error(`${context}fail:`, err);

    let message = `${context}fail，try again`;
    if (err?.message) {
      message = err.message;
    } else if (typeof err === "string") {
      message = err;
    }

    error.value = message;
    ElMessage.error(message);
  };

  const handleNetworkError = () => {
    ElMessageBox.alert("Network error", "Internet connection failed", {
      confirmButtonText: "Retry",
      callback: () => {
        window.location.reload();
      },
    });
  };

  const clearError = () => {
    error.value = null;
  };

  return {
    error,
    handleError,
    handleNetworkError,
    clearError,
  };
}
