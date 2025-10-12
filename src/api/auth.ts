// src/api/auth.ts
import { http } from "@/utils/request";

// NOTE: server should return { code, message, data: { accessToken, refreshToken } }
export function loginApi(body: { username: string; password: string }) {
  return http.post("/auth/login", body, {
    headers: { Authorization: "no-auth" },
  });
}

export function refreshApi(refreshToken: string) {
  return http.post(
    "/auth/refresh",
    { refreshToken },
    { headers: { Authorization: "no-auth" } },
  );
}

export function getProfileApi() {
  // server returns { code, message, data: { id, username, role, ... } }
  return http.get("/auth/me");
}
