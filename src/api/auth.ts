// src/api/auth.ts
import { http } from "@/utils/request";

export interface LoginUserInfo {
  id: string;
  username: string;
  role: string;
  email?: string;
  avatar?: string;
  permissions: string[];
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
  expiresIn?: number;
  user: LoginUserInfo;
}

export interface RefreshResult {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  // Login
  login(username: string, password: string, rememberMe: boolean) {
    return http.post<LoginResult>("/auth/login", {
      username,
      password,
      rememberMe,
    });
  },

  // refresh token
  refreshToken(refreshToken: string) {
    return http.post<RefreshResult>("/auth/refresh", { refreshToken });
  },

  // get current logon user
  getCurrentUser() {
    return http.get<LoginUserInfo>("/auth/me");
  },

  // logout
  logout() {
    return http.post<void>("/auth/logout");
  },
};
