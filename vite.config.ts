import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";
import fs from "fs";
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
      host: "0.0.0.0",
      port: 3000,
      //https: true,
      proxy: {
        "/api": {
          target: "http://192.168.1.73:8080",
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
        },
      },
    },
    build: {
      outDir: "dist",
      sourcemap: false,
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks: {
            "element-plus": ["element-plus"],
            echarts: ["echarts"],
            vendor: ["lodash-es", "file-saver", "xlsx"],
          },
        },
      },
    },
  };
});

// For public network setting
// bat
// netsh advfirewall firewall add rule name="Vite 3000" dir=in action=allow protocol=TCP localport=3000
// netsh advfirewall firewall add rule name="Backend 8080" dir=in action=allow protocol=TCP localport=8080
// import: run those commands with admin auth
