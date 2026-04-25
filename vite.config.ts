import { defineConfig } from "vite";
import pkg from "./package.json";

export default defineConfig({
  // 用相对路径，确保 GitHub Pages（/repo/）与本地预览都能正常加载资源
  base: "./",
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version)
  }
});

