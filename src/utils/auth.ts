// src/utils/auth.ts
const ACCESS = "access_token";
const REFRESH = "refresh_token";
const REMEMBER = "remember_me";

export const AuthStorage = {
  getAccessToken(): string {
    const localToken = localStorage.getItem(ACCESS);
    const sessionToken = sessionStorage.getItem(ACCESS);
    const token = localToken || sessionToken || "";

    console.log("🔐 Get Access Token:", {
      fromLocalStorage: !!localToken,
      fromSessionStorage: !!sessionToken,
      rememberMe: localStorage.getItem(REMEMBER),
      tokenExists: !!token,
      tokenPreview: token ? `${token.substring(0, 10)}...` : "none",
    });

    return token;
  },

  getRefreshToken(): string {
    const localToken = localStorage.getItem(REFRESH);
    const sessionToken = sessionStorage.getItem(REFRESH);
    const token = localToken || sessionToken || "";

    console.log("🔐 Get Refresh Token:", {
      exists: !!token,
    });

    return token;
  },

  setTokens(access: string, refresh?: string, rememberMe = false) {
    console.log("🔐 Setting Tokens:", {
      rememberMe,
      accessTokenLength: access.length,
      refreshTokenLength: refresh?.length || 0,
      accessPreview: access.substring(0, 10) + "...",
    });

    // clear old token
    this.clearTokens();

    // rememberMe storage area
    const storage = rememberMe ? localStorage : sessionStorage;

    console.log(
      "🔐 Using storage:",
      rememberMe ? "localStorage" : "sessionStorage",
    );

    storage.setItem(ACCESS, access);
    if (refresh) {
      storage.setItem(REFRESH, refresh);
    }

    // record user's choice
    localStorage.setItem(REMEMBER, rememberMe ? "1" : "0");

    // 验证存储
    const storedAccess = storage.getItem(ACCESS);
    const storedRefresh = refresh ? storage.getItem(REFRESH) : null;

    console.log("🔐 Storage verification:", {
      accessStored: !!storedAccess,
      refreshStored: !!storedRefresh,
      storedAccessLength: storedAccess?.length,
    });
  },

  clearTokens() {
    console.log("🔐 Clearing all tokens");
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    sessionStorage.removeItem(ACCESS);
    sessionStorage.removeItem(REFRESH);
    localStorage.removeItem(REMEMBER);
  },

  clearAuth() {
    this.clearTokens();
  },

  isRememberMe(): boolean {
    return localStorage.getItem(REMEMBER) === "1";
  },

  hasToken(): boolean {
    return !!this.getAccessToken();
  },
};
