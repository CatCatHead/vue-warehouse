// src/utils/request.ts
import { config } from "./config";
import { ElMessage } from "element-plus";
import { AuthStorage } from "./auth";

const realApiRequest = async (requestConfig: any) => {
  const { method, url, data, params } = requestConfig;

  let fullUrl = `${config.apiBaseUrl}${url}`;

  if (params && method?.toLowerCase() === "get") {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    if (queryString) {
      fullUrl += `?${queryString}`;
    }
  }

  console.log(`[API] ${method?.toUpperCase()} ${fullUrl}`, { data, params });

  const options: RequestInit = {
    method: method?.toUpperCase(),
    headers: {
      "Content-Type": "application/json",
    },
  };

  const token = AuthStorage.getAccessToken();
  if (token) {
    (options.headers as any)["Authorization"] = `Bearer ${token}`;
  }

  if (data && method?.toLowerCase() !== "get") {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(fullUrl, options);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      // Deal with the 401 error code
      if (response.status === 401) {
        ElMessage.error("Login failed. Session expired.");
        // Clear local token
        AuthStorage.clearAuth();
        // Jump to login page
        // router.push('/login');
      } else {
        // Display the error message from back-end
        ElMessage.error(errorMessage);
      }

      throw new Error(errorMessage);
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error("API request failed:", error);
    // Give hint if there is something wrong regarding with internet
    if (
      error instanceof TypeError &&
      error.message.includes("Failed to fetch")
    ) {
      ElMessage.error("Connect failed.");
    }
    throw error;
  }
};

export const http = {
  async request<T>(requestConfig: any): Promise<T> {
    return (await realApiRequest(requestConfig)) as T;
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
    const fullUrl = `${config.apiBaseUrl}${url}`;
    const token = AuthStorage.getAccessToken();

    const options: RequestInit = {
      method: "POST",
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      body: formData,
    };

    try {
      const response = await fetch(fullUrl, options);
      if (!response.ok) {
        // 401 while uploading
        if (response.status === 401) {
          ElMessage.error("Login failed. Session expired.");
          AuthStorage.clearAuth();
          // router.push('/login');
        }
        throw new Error(`Upload failed: ${response.status}`);
      }
      return (await response.json()) as T;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  },
};
