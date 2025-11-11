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
  // Initialized status
  const user = ref<LoginUserInfo | null>(null);
  const isAuthenticated = ref(false);
  const perms = ref<Set<string>>(new Set());
  const isInitialized = ref(false); // add initialized status

  // retrieve data from localStorage
  function restoreFromStorage() {
    try {
      const userRaw = localStorage.getItem(USER_KEY);
      const permsRaw = localStorage.getItem(PERMS_KEY);
      const hasToken = !!AuthStorage.getAccessToken();

      if (userRaw && hasToken) {
        user.value = JSON.parse(userRaw) as LoginUserInfo;
        const permissions = JSON.parse(permsRaw || "[]") as string[];
        perms.value = new Set(permissions);
        isAuthenticated.value = true;
      } else {
        // clear status if without token and userinfo
        clearAuthState();
      }
    } catch (error) {
      console.error("Recover user status failed:", error);
      clearAuthState();
    }
  }

  // Clear status
  function clearAuthState() {
    user.value = null;
    isAuthenticated.value = false;
    perms.value = new Set();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PERMS_KEY);
  }

  async function login(
    username: string,
    password: string,
    rememberMe = false,
  ): Promise<boolean> {
    try {
      const response = await authApi.login(username, password, rememberMe);

      console.log("Login response:", response);

      if (!response.accessToken) {
        throw new Error("Can't detect token");
      }

      const storedToken = AuthStorage.getAccessToken();
      if (!storedToken) {
        throw new Error("Token save failed");
      }

      console.log("Token stored successfully:", !!storedToken);

      user.value = response.user;
      isAuthenticated.value = true;

      const permissions = response.user.permissions || [];
      perms.value = new Set(permissions);

      localStorage.setItem(USER_KEY, JSON.stringify(response.user));
      localStorage.setItem(PERMS_KEY, JSON.stringify(permissions));

      return true;
    } catch (error) {
      console.error("Login failed:", error);
      AuthStorage.clearAuth();
      clearAuthState();
      throw error;
    }
  }

  async function refreshToken(): Promise<boolean> {
    try {
      const refreshToken = AuthStorage.getRefreshToken();
      if (!refreshToken) {
        logout();
        return false;
      }

      const response = await authApi.refreshToken(refreshToken);
      AuthStorage.setTokens(response.accessToken, response.refreshToken, true);
      return true;
    } catch (error) {
      console.error("Refresh token failed:", error);
      logout();
      return false;
    }
  }

  function logout() {
    AuthStorage.clearAuth();
    clearAuthState();
    isInitialized.value = true; // log out also clear the status
  }

  async function fetchUserProfile(): Promise<boolean> {
    try {
      const profile = await authApi.getCurrentUser();

      user.value = profile;
      const permissions = profile.permissions || [];
      perms.value = new Set(permissions);
      isAuthenticated.value = true;

      // update localStorage
      localStorage.setItem(USER_KEY, JSON.stringify(profile));
      localStorage.setItem(PERMS_KEY, JSON.stringify(permissions));

      return true;
    } catch (error: any) {
      console.error("fetchUserProfile error:", error);

      // 401
      if (error.message?.includes("401") || error.response?.status === 401) {
        logout();
      } else {
        // clear status
        isAuthenticated.value = false;
      }
      return false;
    }
  }

  async function initializeAuth(): Promise<void> {
    if (isInitialized.value) return;

    try {
      const hasToken = !!AuthStorage.getAccessToken();
      const hasUserData = !!localStorage.getItem(USER_KEY);

      console.log("Initializing auth:", { hasToken, hasUserData });

      if (hasToken) {
        try {
          const success = await fetchUserProfile();
          if (success) {
            console.log("Auth initialized with fresh user data");
            return;
          }
        } catch (error) {
          console.warn(
            "Failed to fetch fresh user profile, using stored data:",
            error,
          );
        }

        if (hasUserData) {
          restoreFromStorage();
          console.log("Auth initialized with stored user data");
        } else {
          console.warn("No user data found, clearing auth");
          clearAuthState();
        }
      } else {
        console.log("No token found, clearing auth");
        clearAuthState();
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      clearAuthState();
    } finally {
      isInitialized.value = true;
      console.log("Auth initialization completed");
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
      clearAuthState();
    } else {
      user.value = info;
      const permissions = info.permissions || [];
      perms.value = new Set(permissions);
      isAuthenticated.value = true;

      localStorage.setItem(USER_KEY, JSON.stringify(info));
      localStorage.setItem(PERMS_KEY, JSON.stringify(permissions));
    }
  }

  const displayName = computed(getDisplayName);
  const userRole = computed(getUserRole);

  return {
    user,
    isAuthenticated,
    perms,
    isInitialized,
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
    initializeAuth,
    restoreFromStorage,
  };
});
