# GSAP 特效展示站（Vite + TypeScript）

这是一个基于 **GSAP + TypeScript + Vite**（UI 仍使用 Tailwind CDN）的 demo 展示站，用于集中展示多个小型动画 demo，并支持：

- 卡片预览（自动播放，遵守 `prefers-reduced-motion`）
- 展开查看（Modal）
- 一键复制示例代码

## 运行方式

```bash
npm install
npm run dev
```

然后按终端输出地址访问即可。

## 部署到 GitHub Pages

本仓库已内置 GitHub Actions 工作流：`.github/workflows/deploy-pages.yml`，会在 `main` 分支更新时自动：

1. `npm ci`
2. `npm run build`
3. 部署 `dist/` 到 GitHub Pages

同时会把页面左上角的版本号写成当前 commit 的短 SHA。

你需要在 GitHub 仓库的 **Settings → Pages**：

- Source 选择 **GitHub Actions**

之后每次 push 到 `main`，Actions 跑完会更新 `https://<用户名>.github.io/<仓库名>/`。

## 目录结构

```
.
├─ index.html
├─ src/
│  ├─ main.ts
│  ├─ gsap.ts
│  ├─ types.ts
│  └─ demos/
│     ├─ index.ts
│     ├─ staggerMatrix01.ts
│     ├─ scalePulseV2.ts
│     ├─ scrollTriggerPin.ts
│     ├─ textReveal.ts
│     ├─ timelineOffsetSeq.ts
│     └─ gridWaveEffect.ts
└─ vite.config.ts
```

## 添加新 Demo

1. 在 `src/demos/` 新增一个 `xxx.ts`，导出 `Demo`
2. 在 `src/demos/index.ts` 里引入并加入 `demos` 数组
