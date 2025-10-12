// src/utils/request.ts
import axios, { AxiosError } from "axios";
import { ElMessage } from "element-plus";
import router from "@/router";
import { AuthStorage } from "@/utils/auth";

const BASE_URL =
  (import.meta as any).env?.VITE_APP_BASE_API ||
  (import.meta as any).env?.VITE_API_BASE ||
  "/api";

const service = axios.create({
  baseURL: BASE_URL,
  timeout: 20000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
});

// attach token (skip if caller sets Authorization: 'no-auth')
service.interceptors.request.use((config) => {
  const hdrs = (config.headers ||= {});
  if (hdrs.Authorization === "no-auth") {
    delete (hdrs as any).Authorization;
    return config;
  }
  const token = AuthStorage.getAccessToken();
  if (token) (hdrs as any).Authorization = `Bearer ${token}`;
  return config;
});

service.interceptors.response.use(
  (resp) => {
    // binary response passthrough
    if (
      resp.config.responseType === "blob" ||
      resp.config.responseType === "arraybuffer"
    ) {
      return resp;
    }
    const data: any = resp.data;
    // no envelope → return raw
    if (!data || typeof data !== "object" || !("code" in data)) return data;
    const ok = data.code === 0 || data.code === 200;
    if (ok) return data.data ?? data;
    ElMessage.error(data.message || "Request failed");
    return Promise.reject(data);
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401) {
      AuthStorage.clearAuth();
      const to = encodeURIComponent(router.currentRoute.value.fullPath);
      router.replace(`/login?redirect=${to}`).catch(() => {});
      return Promise.reject(error);
    }
    ElMessage.error(
      (error.response as any)?.data?.message ||
        error.message ||
        "Network error",
    );
    return Promise.reject(error);
  },
);

export default service;
export const http = service;
