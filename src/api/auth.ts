// src/api/auth.ts
import { http } from "@/utils/request";
import { AuthStorage } from "@/utils/auth";

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
  async login(username: string, password: string, rememberMe = false) {
    const response = await http.post<{
      accessToken: string;
      refreshToken: string;
      tokenType: string;
      expiresIn: number;
      user: LoginUserInfo;
    }>("/auth/login", {
      username,
      password,
      rememberMe,
    });

    // save token
    if (response.accessToken) {
      AuthStorage.setTokens(
        response.accessToken,
        response.refreshToken,
        rememberMe,
      );
    }

    return response;
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
