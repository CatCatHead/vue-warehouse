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
        const existingLink = document.getElementById("dark-theme-style");
        if (!existingLink) {
          const link = document.createElement("link");
          link.id = "dark-theme-style";
          link.rel = "stylesheet";
          link.href =
            "/node_modules/element-plus/theme-chalk/dark/css-vars.css";
          document.head.appendChild(link);
        }
      } else {
        html.classList.remove("dark");
        const darkStyle = document.getElementById("dark-theme-style");
        if (darkStyle) {
          darkStyle.remove();
        }
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
