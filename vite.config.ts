import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import path from "path";

export default defineConfig(({ mode }) => {
  // Load env vars for the current mode
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vue(),
      AutoImport({
        resolvers: [ElementPlusResolver()],
      }),
      Components({
        resolvers: [ElementPlusResolver()],
      }),
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "src"),
      },
    },
    server: {
      // Only for local dev to avoid CORS
      proxy: {
        // If you use /api as VITE_API_BASE during development
        "/api": {
          target: "http://localhost:5173", // your backend (Spring Boot?) local port
          changeOrigin: true,
          // remove '/api' prefix before forwarding to backend
          rewrite: (p) => p.replace(/^\/api/, ""),
        },
      },
    },
  };
});
