import { defineStore } from "pinia";
import { ref } from "vue";
import { AuthStorage } from "@/utils/auth";
import { ElMessage } from "element-plus";
import { useRouter } from "vue-router";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const accessToken = ref("");
  const refreshToken = ref("");
  const isAuthenticated = ref(false);
  const router = useRouter();

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

  const login = async (
    username: string,
    password: string,
    rememberMe: boolean = false,
  ): Promise<boolean> => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockAccessToken = "mock-access-token-" + Date.now();
      const mockRefreshToken = "mock-refresh-token-" + Date.now();
      const mockUser = {
        id: "1",
        username: username,
        email: `${username}@example.com`,
        role: "admin",
      };

      AuthStorage.setTokens(mockAccessToken, mockRefreshToken, rememberMe);

      accessToken.value = mockAccessToken;
      refreshToken.value = mockRefreshToken;
      user.value = mockUser;
      isAuthenticated.value = true;

      return true;
    } catch (error) {
      ElMessage.error(error?.response?.data?.message || "Login Failed");
      return false;
    }
  };
  const logout = async (): Promise<void> => {
    try {
      user.value = null;
      accessToken.value = "";
      refreshToken.value = "";
      isAuthenticated.value = false;

      AuthStorage.clearAuth();
    } catch (error) {
      console.log("logout failed");
    } finally {
      AuthStorage.clearAuth();
      router.replace("/login");
    }
  };
  initializeAuth();

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    logout,
  };
});

export default useAuthStore;
