# GSAP 特效展示站（H5 / 无构建）

这是一个基于 **GSAP + Tailwind（CDN）** 的“特效标本库”示例站点，用于集中展示多个小型动画 demo，并支持：

- 卡片预览（自动播放，遵守 `prefers-reduced-motion`）
- 展开查看（Modal）
- 一键复制示例代码

## 运行方式

### 方式 1：直接打开

直接用浏览器打开 `index.html` 即可（需要网络访问 cdnjs / Google Fonts）。

### 方式 2：本地起一个静态服务器（推荐）

任选其一：

```bash
npx serve .
```

或：

```bash
python3 -m http.server 5173
```

然后访问终端输出的地址，打开 `index.html`。

## 部署到 GitHub Pages

本仓库已内置 GitHub Actions 工作流：`.github/workflows/deploy-pages.yml`，会在 `main` 分支更新时自动部署到 GitHub Pages。

你需要在 GitHub 仓库的 **Settings → Pages**：

- Source 选择 **GitHub Actions**

之后每次 push 到 `main`，Actions 跑完会更新 `https://<用户名>.github.io/<仓库名>/`。

## 目录结构

```
.
├─ index.html
└─ js/
   ├─ app.js
   └─ demos/
      ├─ index.js
      ├─ staggerMatrix01.js
      ├─ scalePulseV2.js
      ├─ scrollTriggerPin.js
      ├─ textReveal.js
      ├─ timelineOffsetSeq.js
      └─ gridWaveEffect.js
```

## 添加新 Demo

1. 在 `js/demos/` 新增一个 `xxx.js`，导出 `{ id, title, subtitle, tags, code, mount() }`
2. 在 `js/demos/index.js` 里引入并加入 `demos` 数组
