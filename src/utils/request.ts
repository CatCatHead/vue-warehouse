// src/utils/request.ts
import { config, isMockMode } from "./config";
import { mockAdapter } from "./mockAdapter";
import { ElMessage } from "element-plus";
import { AuthStorage } from "./auth";

const isRealApiRequest = (config: any) => {
  if (config.data instanceof FormData) return true;
  if (config.useMock === false) return false;
  return isMockMode;
};

export const http = {
  async request<T>(requestConfig: any): Promise<T> {
    const useMock = isRealApiRequest(requestConfig);

    try {
      if (useMock) {
        const response = await mockAdapter.request({
          ...requestConfig,
          mockDelay: config.mockDelay,
        });
        return response as T;
      } else {
        console.warn(
          `[Real API] ${requestConfig.method?.toUpperCase()} ${requestConfig.url} - Backend not available, falling back to Mock`,
        );

        const response = await mockAdapter.request({
          ...requestConfig,
          mockDelay: config.mockDelay,
        });
        return response as T;
      }
    } catch (error) {
      console.error("Request failed:", error);
      throw error;
    }
  },

  get<T>(url: string, params?: any) {
    return this.request<T>({
      method: "GET",
      url,
      params,
    });
  },

  post<T>(url: string, data?: any) {
    return this.request<T>({
      method: "POST",
      url,
      data,
    });
  },

  put<T>(url: string, data?: any) {
    return this.request<T>({
      method: "PUT",
      url,
      data,
    });
  },

  delete<T>(url: string) {
    return this.request<T>({
      method: "DELETE",
      url,
    });
  },

  async upload<T>(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void,
  ): Promise<T> {
    console.warn("File upload would use real API when backend is available");

    if (onProgress) {
      for (let progress = 0; progress <= 100; progress += 10) {
        setTimeout(() => onProgress(progress), progress * 10);
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      id: "mock-file-" + Date.now(),
      filename: "uploaded-file",
      url: "https://example.com/mock-file",
      size: formData.get("file")?.size || 0,
    } as T;
  },
};
