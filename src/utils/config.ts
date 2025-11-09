// src/utils/config.ts
export const config = {
  useMock: import.meta.env.VITE_USE_MOCK === "true",
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || "/api",
  mockDelay: parseInt(import.meta.env.VITE_MOCK_DELAY || "300"),
  appTitle: import.meta.env.VITE_APP_TITLE || "Warehouse Admin",
};

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

export const isMockMode = config.useMock && isDevelopment;
