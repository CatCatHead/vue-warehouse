// src/constants/app.ts
export const APP_CONFIG = {
  TITLE: import.meta.env.VITE_APP_TITLE || "Warehouse Admin",
  VERSION: "1.0.0",
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "/api",
};

export const USER_INFO = {
  name: "Admin",
};
