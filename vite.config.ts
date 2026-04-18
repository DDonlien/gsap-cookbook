import { defineConfig } from "vite";

export default defineConfig({
  // 用相对路径，确保 GitHub Pages（/repo/）与本地预览都能正常加载资源
  base: "./"
});

