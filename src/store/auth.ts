// src/store/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { AuthStorage } from "@/utils/auth";
import { http } from "@/utils/request";

interface UserInfo {
  id: string;
  username: string;
  role: string;
  email?: string;
  avatar?: string;
  permissions: string[];
}

const PERMS_KEY = "vaas-perms";
const USER_KEY = "vaas-user-info";

export const useAuthStore = defineStore("auth", () => {
  const user = ref<UserInfo | null>(null);
  const isAuthenticated = ref(false);
  const perms = ref<Set<string>>(new Set());

  function init() {
    isAuthenticated.value = !!AuthStorage.getAccessToken();

    const savedUser = localStorage.getItem(USER_KEY);
    if (savedUser) {
      try {
        user.value = JSON.parse(savedUser);
      } catch {}
    }

    const savedPerms = localStorage.getItem(PERMS_KEY);
    if (savedPerms) {
      try {
        perms.value = new Set(JSON.parse(savedPerms));
      } catch {
        perms.value = new Set();
      }
    }
  }

  async function login(
    username: string,
    password: string,
    rememberMe = false,
  ): Promise<boolean> {
    try {
      const response = await http.post("/auth/login", {
        username,
        password,
        rememberMe,
      });

      console.log("Login response:", response);

      const { accessToken, refreshToken, user: userInfo } = response;

      if (!accessToken || !userInfo) {
        throw new Error("Invalid response from server");
      }

      AuthStorage.setTokens(accessToken, refreshToken, rememberMe);
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo));

      const permissions = userInfo.permissions || [];
      localStorage.setItem(PERMS_KEY, JSON.stringify(permissions));

      user.value = userInfo;
      isAuthenticated.value = true;
      perms.value = new Set(permissions);

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  }

  async function refreshToken(): Promise<boolean> {
    try {
      const refreshToken = AuthStorage.getRefreshToken();
      if (!refreshToken) return false;

      const response = await http.post("/auth/refresh", { refreshToken });
      const { accessToken, refreshToken: newRefreshToken } = response;

      AuthStorage.setTokens(accessToken, newRefreshToken);
      return true;
    } catch (error) {
      console.error("Refresh token failed:", error);
      this.logout();
      return false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await http.post("/auth/logout");
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      AuthStorage.clearAuth();
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(PERMS_KEY);
      user.value = null;
      isAuthenticated.value = false;
      perms.value = new Set();
    }
  }

  async function fetchUserProfile(): Promise<void> {
    try {
      const userInfo = await http.get("/auth/me");
      user.value = userInfo;
      localStorage.setItem(USER_KEY, JSON.stringify(userInfo));

      if (userInfo.permissions) {
        perms.value = new Set(userInfo.permissions);
        localStorage.setItem(PERMS_KEY, JSON.stringify(userInfo.permissions));
      }
    } catch (error) {
      console.error("Fetch user profile failed:", error);
      throw error;
    }
  }

  function getDisplayName(): string {
    return user.value?.username || "User";
  }

  function getUserRole(): string {
    return user.value?.role || "guest";
  }

  function hasPerm(required: string | string[]): boolean {
    const need = Array.isArray(required) ? required : [required];
    return need.some((p) => perms.value.has(p));
  }

  function setUser(patch: Partial<UserInfo>) {
    if (!user.value) return;
    user.value = { ...user.value, ...patch };
    localStorage.setItem(USER_KEY, JSON.stringify(user.value));
  }

  const displayName = computed(getDisplayName);
  const userRole = computed(getUserRole);

  init();

  return {
    user,
    isAuthenticated,
    perms,
    login,
    logout,
    refreshToken,
    fetchUserProfile,
    setUser,
    getDisplayName,
    getUserRole,
    hasPerm,
    displayName,
    userRole,
  };
});
