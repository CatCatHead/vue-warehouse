// Use English comments only
import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { ElMessage } from "element-plus";
import router from "@/router"; // if no router yet, replace with a simple redirect
import { AuthStorage } from "./auth";

/** Change to your backend envelope if needed */
export interface ApiResp<T = any> {
  code: number; // e.g. 0 success / 200 success / your own code
  message: string; // error or success message
  data: T; // payload
}

const BASE_URL = import.meta.env.VITE_API_BASE || "/api";

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

/** ===== Request: attach access token ===== */
http.interceptors.request.use((config) => {
  const token = AuthStorage.getAccessToken();
  if (token) {
    config.headers = config.headers || {};
    (config.headers as Record<string, any>).Authorization = `Bearer ${token}`;
  }
  return config;
});

/** ===== Refresh token queue (optional but recommended) ===== */
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

async function doRefreshToken(): Promise<string> {
  // Implement your refresh endpoint here
  const refreshToken = AuthStorage.getRefreshToken();
  if (!refreshToken) throw new Error("NO_REFRESH_TOKEN");

  const resp = await axios.post<
    ApiResp<{ accessToken: string; refreshToken?: string }>
  >(`${BASE_URL}/auth/refresh`, { refreshToken }, { timeout: 10000 });

  // adapt to your backend's success code
  const ok = resp.data && (resp.data.code === 0 || resp.data.code === 200);
  if (!ok) throw new Error(resp.data?.message || "REFRESH_FAILED");

  const newAT = resp.data.data.accessToken;
  const newRT = resp.data.data.refreshToken;
  AuthStorage.setAccessToken(newAT);
  if (newRT) AuthStorage.setRefreshToken(newRT);
  return newAT;
}

function processQueue(error: any, token?: string) {
  pendingQueue.forEach(({ resolve, reject, config }) => {
    if (token) {
      // retry original request with new token
      config.headers = config.headers || {};
      (config.headers as Record<string, any>).Authorization = `Bearer ${token}`;
      http.request(config).then(resolve).catch(reject);
    } else {
      reject(error);
    }
  });
  pendingQueue = [];
}

/** ===== Response: unwrap & handle 401 ===== */
http.interceptors.response.use(
  // success path
  (response) => {
    // If your backend doesn't wrap, just return response.data directly
    const data = response.data as ApiResp<any>;
    // adapt success condition
    const ok = data && (data.code === 0 || data.code === 200);
    if (ok) return data.data ?? data; // prefer payload
    // not ok -> show message and reject
    ElMessage.error(data?.message || "Request failed");
    return Promise.reject(data);
  },

  // error path
  async (error: AxiosError) => {
    const original = error.config!;
    const status = error.response?.status;

    // 401 handling with refresh queue
    if (status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        // push to queue and wait
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject, config: original });
        });
      }

      isRefreshing = true;
      try {
        const newToken = await doRefreshToken();
        processQueue(null, newToken);
        return http.request(original);
      } catch (e) {
        processQueue(e, undefined);
        AuthStorage.clear();
        // go to login with redirect
        const to = encodeURIComponent(router.currentRoute.value.fullPath);
        router.replace(`/login?redirect=${to}`).catch(() => {});
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }

    // other errors: show message
    const msg =
      (error.response?.data as any)?.message ||
      error.message ||
      "Network error";
    ElMessage.error(msg);
    return Promise.reject(error);
  },
);

// Optional helper for GET/POST with typed payload
export const get = <T>(url: string, params?: any, cfg?: AxiosRequestConfig) =>
  http.get<ApiResp<T>>(url, { params, ...cfg });

export const post = <T>(url: string, data?: any, cfg?: AxiosRequestConfig) =>
  http.post<ApiResp<T>>(url, data, cfg);
