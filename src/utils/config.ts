// src/utils/config.ts
export const config = {
  useMock: false,
  apiBaseUrl: "http://localhost:8080/api",
  mockDelay: 0,
  appTitle: "Warehouse Admin",
};

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const isMockMode = false;
