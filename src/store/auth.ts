import { defineStore } from "pinia";
import { ref } from "vue";
import { AuthStorage } from "@/utils/auth";

interface UserInfo {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  loginTime?: string;
}

export const useAuthStore = defineStore("auth", () => {
  const user = ref<UserInfo | null>(null);
  const accessToken = ref("");
  const refreshToken = ref("");
  const isAuthenticated = ref(false);

  const initializeAuth = () => {
    console.log("Initialized auth store...");

    const savedAccessToken = AuthStorage.getAccessToken();
    const savedRefreshToken = AuthStorage.getRefreshToken();

    if (savedAccessToken) {
      console.log("Detected access token, restore log status");
      accessToken.value = savedAccessToken;
      refreshToken.value = savedRefreshToken;
      isAuthenticated.value = true;

      const savedUser = localStorage.getItem("vaas-user-info");
      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser);
        } catch (error) {
          console.error("Failed to pull user info from localstorage:", error);
        }
      }
    } else {
      console.log("Can not find the token, user not logged in");
      isAuthenticated.value = false;
    }
  };

  const login = async (
    username: string,
    password: string,
    rememberMe: boolean = false,
  ): Promise<boolean> => {
    try {
      console.log("Login...", { username, rememberMe });

      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockAccessToken = "mock-access-token-" + Date.now();
      const mockRefreshToken = "mock-refresh-token-" + Date.now();
      const mockUser: UserInfo = {
        id: "1",
        username: username,
        email: `${username}@example.com`,
        avatar: "/src/assets/default-avatar.png",
        role: "admin",
        loginTime: new Date().toISOString(),
      };

      console.log("Logon, updated user info:", mockUser);

      AuthStorage.setTokens(mockAccessToken, mockRefreshToken, rememberMe);

      localStorage.setItem("vaas-user-info", JSON.stringify(mockUser));

      accessToken.value = mockAccessToken;
      refreshToken.value = mockRefreshToken;
      user.value = mockUser;
      isAuthenticated.value = true;

      console.log("Login successfully, Auth updated");
      return true;
    } catch (error) {
      console.error("Login in Failed:", error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log("Logining out");

      user.value = null;
      accessToken.value = "";
      refreshToken.value = "";
      isAuthenticated.value = false;

      AuthStorage.clearAuth();
      localStorage.removeItem("vaas-user-info");

      console.log("Log out successfully");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const getDisplayName = () => {
    return user.value?.username || "User";
  };

  const getUserRole = () => {
    return user.value?.role || "guest";
  };

  initializeAuth();

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,

    login,
    logout,
    getDisplayName,
    getUserRole,
  };
});
