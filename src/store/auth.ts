import { defineStore } from "pinia";
import { ref } from "vue";
import { AuthStorage } from "@/utils/auth";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const accessToken = ref("");
  const refreshToken = ref("");
  const isAuthenticated = ref(false);

  const initializeAuth = () => {
    const savedAccessToken = AuthStorage.getAccessToken();
    const savedRefreshToken = AuthStorage.getRefreshToken();

    if (savedAccessToken) {
      accessToken.value = savedAccessToken;
      refreshToken.value = savedRefreshToken;
      isAuthenticated.value = true;
    } else {
      isAuthenticated.value = false;
    }
  };

  initializeAuth();

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
  };
});

export default useAuthStore;
