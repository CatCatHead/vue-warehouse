// src/utils/config.ts
export const config = {
  useMock: false,
  apiBaseUrl: "http://192.168.1.73:8080/api",
  mockDelay: 0,
  appTitle: "Warehouse Admin",
};

export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;
export const isMockMode = false;
