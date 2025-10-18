// src/utils/request.ts
import { ElMessage } from "element-plus";

const MAX_RETRY_COUNT = 2;
const RETRY_DELAY = 1000;

export const http = {
  async request<T>(config: any, retryCount = 0): Promise<T> {
    try {
      const response = await service.request(config);
      return response.data;
    } catch (error: any) {
      if (!error.response && retryCount < MAX_RETRY_COUNT) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
        return this.request(config, retryCount + 1);
      }
      throw error;
    }
  },

  get<T>(url: string, params?: any) {
    return this.request<T>({ method: "GET", url, params });
  },

  post<T>(url: string, data?: any) {
    return this.request<T>({ method: "POST", url, data });
  },

  put<T>(url: string, data?: any) {
    return this.request<T>({ method: "PUT", url, data });
  },

  delete<T>(url: string) {
    return this.request<T>({ method: "DELETE", url });
  },
};
