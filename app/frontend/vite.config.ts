import { defineConfig, loadEnv, ServerOptions } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig(({ mode }) => {
  const server: ServerOptions = {};

  if (mode === "development") {
    const devEnv = loadEnv(mode, path.resolve(__dirname, "../"), "");

    const backendPort = Number(devEnv.SERVER_PORT) || 3000;
    const hmrFrontendPort = Number(devEnv.HMR_FRONTEND_PORT) || 5173;

    server.proxy = {
      "/api": {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
      },
      "/socket.io": {
        target: `http://localhost:${backendPort}`,
        changeOrigin: true,
        ws: true,
      },
    };

    server.port = hmrFrontendPort;
  }

  return {
    plugins: [vue()],
    server,
  };
});
