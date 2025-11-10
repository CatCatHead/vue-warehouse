// src/utils/auth.ts
const ACCESS = "access_token";
const REFRESH = "refresh_token";
const REMEMBER = "remember_me";

const box = () =>
  localStorage.getItem(REMEMBER) === "1" ? localStorage : sessionStorage;
const other = () => (box() === localStorage ? sessionStorage : localStorage);

export const AuthStorage = {
  getAccessToken(): string {
    return box().getItem(ACCESS) || "";
  },
  getRefreshToken(): string {
    return box().getItem(REFRESH) || "";
  },
  setTokens(access: string, refresh?: string, rememberMe = false) {
    localStorage.setItem(REMEMBER, rememberMe ? "1" : "0");
    const b = box();
    b.setItem(ACCESS, access);
    if (refresh) b.setItem(REFRESH, refresh);
    other().removeItem(ACCESS);
    other().removeItem(REFRESH);
  },
  clearAuth() {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
    localStorage.removeItem(REMEMBER);
    sessionStorage.removeItem(ACCESS);
    sessionStorage.removeItem(REFRESH);
  },

  isTokenExpiring(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      return false;
    } catch {
      return true;
    }
  },
};
