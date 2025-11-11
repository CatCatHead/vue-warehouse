// src/store/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { AuthStorage } from "@/utils/auth";
import { authApi, type LoginUserInfo } from "@/api/auth";

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
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? (JSON.parse(raw) as LoginUserInfo) : null;
    } catch {
      return null;
    }
  })();

  const storedPerms = (() => {
    try {
      const raw = localStorage.getItem(PERMS_KEY);
      return raw ? (JSON.parse(raw) as string[]) : [];
    } catch {
      return [];
    }
  })();

  const user = ref<LoginUserInfo | null>(storedUser);
  const isAuthenticated = ref(!!AuthStorage.getAccessToken() && !!storedUser);
  const perms = ref<Set<string>>(new Set(storedPerms));

  async function login(
    username: string,
    password: string,
    rememberMe = false,
  ): Promise<boolean> {
    try {
      const response = await authApi.login(username, password, rememberMe);

      console.log("Login response:", response);

      user.value = response.user;
      isAuthenticated.value = true;

      const permissions = response.user.permissions || [];
      perms.value = new Set(permissions);

      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      localStorage.setItem(PERMS_KEY, JSON.stringify(permissions));

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

      const response = await authApi.refreshToken(refreshToken);
      AuthStorage.setTokens(response.accessToken, response.refreshToken, true);
      return true;
    } catch (error) {
      console.error("Refresh token failed:", error);
      this.logout();
      return false;
    }
  }

  function logout() {
    AuthStorage.clearAuth();
    user.value = null;
    isAuthenticated.value = false;
    perms.value = new Set();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PERMS_KEY);
  }

  async function fetchUserProfile(): Promise<void> {
    try {
      const profile = await authApi.getCurrentUser();
      user.value = profile;

      const permissions = profile.permissions || [];
      perms.value = new Set(permissions);

      localStorage.setItem(USER_KEY, JSON.stringify(profile));
      localStorage.setItem(PERMS_KEY, JSON.stringify(permissions));
    } catch (e) {
      console.error("fetchUserProfile error:", e);
      logout();
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

  function setUser(info: LoginUserInfo | null) {
    user.value = info;
    if (!info) {
      localStorage.removeItem(USER_KEY);
      perms.value = new Set();
      localStorage.removeItem(PERMS_KEY);
      isAuthenticated.value = false;
    } else {
      localStorage.setItem(USER_KEY, JSON.stringify(info));
      const permissions = info.permissions || [];
      perms.value = new Set(permissions);
      localStorage.setItem(PERMS_KEY, JSON.stringify(permissions));
      isAuthenticated.value = true;
    }
  }

  const displayName = computed(getDisplayName);
  const userRole = computed(getUserRole);

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
