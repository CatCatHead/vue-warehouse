export const Storage = {
  get<T = any>(key: string, defaultValue?: T): T {
    try {
      const item = localStorage.getItem(key);

      if (item) {
        try {
          const parsed = JSON.parse(item);
          return parsed;
        } catch (parseError) {
          return item as T;
        }
      } else {
        return defaultValue as T;
      }
    } catch (error) {
      return defaultValue as T;
    }
  },

  set(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("LocalStorage set error:", error);
    }
  },

  remove(key: string): void {
    localStorage.removeItem(key);
  },

  sessionGet<T = any>(key: string, defaultValue?: T): T {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue as T;
    }
  },

  sessionSet(key: string, value: any): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("SessionStorage set error:", error);
    }
  },

  sessionRemove(key: string): void {
    sessionStorage.removeItem(key);
  },
};
