import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "");
  const apiTarget = env.API_PROXY_TARGET || `http://localhost:${env.PORT || "3001"}`;

  return {
    root: "frontend",
    envDir: projectRoot,
    plugins: [react()],
    server: {
      fs: {
        allow: [projectRoot],
      },
      proxy: {
        "/api": apiTarget,
      },
    },
  };
});
