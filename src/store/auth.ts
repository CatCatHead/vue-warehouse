// src/store/auth.ts
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { AuthStorage } from "@/utils/auth";

interface UserInfo {
  id: string;
  username: string;
  role: string;
  email?: string;
  avatar?: string;
}

const PERMS_KEY = "vaas-perms";
const USER_KEY = "vaas-user-info";

export const useAuthStore = defineStore("auth", () => {
  // ---------- state ----------
  const user = ref<UserInfo | null>(null);
  const isAuthenticated = ref(false);
  const perms = ref<Set<string>>(new Set()); //

  // ---------- lifecycle ----------
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

  // ---------- actions ----------
  async function login(
    username: string,
    _password: string,
    rememberMe = false,
  ): Promise<boolean> {
    const at = "mock-at-" + Date.now();
    const rt = "mock-rt-" + Date.now();

    const role = username === "admin" ? "admin" : "user";
    const profile: UserInfo = {
      id: "1",
      username,
      role,
      email: `${username}@example.com`,
    };

    const list =
      role === "admin"
        ? ["user:add", "user:edit", "user:delete"]
        : ["user:edit"];

    AuthStorage.setTokens(at, rt, rememberMe);
    localStorage.setItem(USER_KEY, JSON.stringify(profile));
    localStorage.setItem(PERMS_KEY, JSON.stringify(list));

    user.value = profile;
    isAuthenticated.value = true;
    perms.value = new Set(list);

    return true;
  }

  async function logout(): Promise<void> {
    AuthStorage.clearAuth();
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PERMS_KEY);
    user.value = null;
    isAuthenticated.value = false;
    perms.value = new Set();
  }

  // ---------- helpers ----------
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

  // bootstrap
  init();

  return {
    // state
    user,
    isAuthenticated,
    perms,
    // actions
    login,
    logout,
    setUser,
    // helpers
    getDisplayName,
    getUserRole,
    hasPerm,
    // optional computed
    displayName,
    userRole,
  };
});
