import { defineStore } from "pinia";

export type ThemeMode = "light" | "dark";

export const useThemeStore = defineStore("theme", {
  state: () => ({
    currentTheme: "light" as ThemeMode,
  }),

  getters: {
    isDark: (state) => state.currentTheme === "dark",
  },

  actions: {
    toggleTheme() {
      this.currentTheme = this.currentTheme === "light" ? "dark" : "light";
      this.applyTheme();
    },

    setTheme(theme: ThemeMode) {
      this.currentTheme = theme;
      this.applyTheme();
    },

    applyTheme() {
      const html = document.documentElement;
      if (this.currentTheme === "dark") {
        html.classList.add("dark");

        import("element-plus/theme-chalk/dark/css-vars.css");
      } else {
        html.classList.remove("dark");
      }

      localStorage.setItem("vaas-theme", this.currentTheme);
    },

    loadTheme() {
      const savedTheme = localStorage.getItem("vaas-theme") as ThemeMode;
      if (savedTheme) {
        this.setTheme(savedTheme);
      } else {
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          this.setTheme("dark");
        }
      }
    },
  },
});
