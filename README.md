# GSAP 特效展示站（Vite + TypeScript）

这是一个基于 **GSAP + TypeScript + Vite**（UI 仍使用 Tailwind CDN）的 demo 展示站，用于集中展示多个小型动画 demo，并支持：

- 卡片预览（自动播放，遵守 `prefers-reduced-motion`）
- 展开查看（Modal）
- 一键复制示例代码

## 设计与交互规范（更新：2026-04-19 00:06）

### 视觉风格（Design System）
- **0 圆角**：所有容器/按钮默认无圆角（靠 border 与排版建立质感）。
- **细边框**：优先使用 `border-[0.5px] border-outline-variant` 作为分割线。
- **高对比 hover**：hover 多用 `bg-on-surface text-surface` 或 `bg-surface-container-high`，保持“工业标本库”气质。
- **密度优先**：卡片网格、顶栏按钮、筛选条尽量“铺满”区域，少用多余 padding/gap。

### 布局断点（Responsive）
- **半屏宽度（>=520px）**：
  - Gallery：卡片 **2 列**。
  - Modal：`stage | params` **左右两列**，`code` 在下方跨两列（避免预览过小）。

### 文案与语言（I18N）
- 站点支持中英文切换（左侧顶部按钮），默认中文。
- 新增 UI 文案需：
  - `index.html`：使用 `data-i18n` / `data-i18n-placeholder` 标注
  - `src/main.ts`：在 `I18N` 字典中补齐中/英两份文案
- 避免“中英混排”的按钮/标题（除非是 demo 的固定英文代号）。

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
│     ├─ cardDeal.ts
│     ├─ cardFlip.ts
│     ├─ hoverTilt.ts
│     ├─ dropShadow.ts
│     ├─ rarityShine.ts
│     ├─ scoreCounter.ts
│     ├─ screenShake.ts
│     ├─ particleBurst.ts
│     └─ ...（更多 demo 以实际目录为准）
└─ vite.config.ts
```

## 添加新 Demo

1. 在 `src/demos/` 新增一个 `xxx.ts`，导出 `Demo`
2. 在 `src/demos/index.ts` 里引入并加入 `demos` 数组

## Demo 与特效制作规范（更新：2026-04-19 00:06）

### Demo 结构（必须）
- 每个 demo 必须导出一个 `Demo`：
  - `id/title/subtitle/tags/defaults/controls/mount()`
- `mount(el, opts)` 必须返回 cleanup 函数：
  - 使用 `gsap.context(() => { ... }, el)` 并在 cleanup 中 `ctx.revert()`
  - 所有 `addEventListener` 都要在 cleanup 中移除（避免内存泄漏）

### Tag 约定（用于筛选）
- `tags.playback`：`once | loop | interactive`
- `tags.type`：动画类型（如 `card / deal / flip / hover / feedback / particles / shine / counter` 等）
- `tags.related`：关联主题（如 `mouse / scroll / text` 等，可为空）

### 可调参与可复用性
- demo 应尽量暴露关键参数（controls），确保能“快速复用到游戏里”：
  - duration/ease/强度/数量/距离/方向等
- `getCode(params)` 输出的示例代码应尽量独立可拷贝（少依赖站点内部工具函数）。

### Demo 卡牌制作规范（UI/内容）（新增：2026-04-19）
> 这部分约束主要针对 **“卡牌类 demo”**（如 hover/shine/shadow/feedback 等），也推荐其他 demo 参考执行。

#### 0) 演示对象默认保持最简单
- **除非效果验证必须**，demo 的主体对象应尽量使用最基础形态：
  - 方块就用纯方块
  - 卡牌就用基础卡片
  - 文字就用纯文字
- 避免为了“更像某个游戏物件”而额外加入装饰、编号、说明文案、徽记等无关信息。
- 如果确实需要附加结构，也只能服务于效果验证本身，不能喧宾夺主。

#### 1) 非必要不添加背景色
- **除非效果验证必须**，demo 的 `stage`/`wrap` 不要主动加大面积背景色/渐变色。
- 默认使用站点的 `bg-surface` / `bg-background` 体系即可；若需要对比，请优先：
  - 加边框/辅助线/小面积参考块
  - 或仅在卡牌内部增加低透明纹理（而不是整屏换底色）

#### 2) 测试/操作按钮位置约定
- demo 内部尽量**不要自己画按钮**（避免每个 demo 风格不一致）。
- 操作优先通过：
  1) **窗口下巴（底部工具条）**：用于 “开始/暂停/重播/下一步” 这类动作
  2) **详情 popup 顶栏**：用于 “重播/复制/关闭” 这类全局动作（站点层已有）
- 如果确实需要额外动作：优先做成 `controls`（select/range/toggle），其次才考虑新增按钮。

#### 3) 参数必须有双语描述文件（强约束）
- 每个 demo 的所有参数（`controls`）必须提供 **中英双语**：
  - 参数名（label）
  - 必要时的参数说明（description：解释用途/单位/取值含义）
- 推荐文件路径与结构（可按需扩展字段）：
  - `src/demos/i18n/<demoId>.json`
  - 示例：
    ```json
    {
      "title": { "zh": "悬停倾斜", "en": "Hover tilt" },
      "subtitle": { "zh": "鼠标倾斜/高光", "en": "Mouse tilt / glow" },
      "controls": {
        "maxTilt": {
          "label": { "zh": "最大倾角(°)", "en": "Max tilt (deg)" },
          "desc": { "zh": "鼠标移动时的最大旋转角度", "en": "Maximum rotation when moving the pointer" }
        }
      }
    }
    ```
- 站点展示时：若缺失描述文件，视为不合规（后续会补上校验/提示）。

#### 4) 交互提示的展示规范
- 对 `interactive` demo：如果用户**看不出来怎么操作**，需要提供提示文案。
- 提示以**纯文字**形式叠加在窗口上方居中（而不是箭头/图标），例如：
  - 中文：`移动鼠标以倾斜卡牌`
  - 英文：`Move your mouse to tilt the card`
- 推荐样式（示例 class，可按需微调）：
  ```html
  <div class="demo-hint absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono tracking-widest text-outline">
    MOVE MOUSE TO TILT
  </div>
  ```

### 动画实现原则（Best Practices）
- 优先使用 `transform`（x/y/scale/rotation/opacity），避免频繁触发布局（top/left/width/height）。
- 统一遵守 `prefers-reduced-motion`：
  - `reduceMotion === true` 时，不循环/不高频闪烁；必要时直接展示最终态。
- “一次性动画（once）”建议支持重播：
  - 卡片底部与 Modal 顶栏会出现重播按钮（站点层已实现），demo 侧需保证 mount 可重复调用且可清理。
