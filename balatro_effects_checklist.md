# 小丑牌（Balatro）风格：Web 游戏动效清单（建议）

下面按“你在做的小丑牌类卡牌游戏”常见交互/反馈场景整理动效点位。  
我已在本项目里先实现了其中一部分（标注为 **✅ 已实现（本项目 Demo）**）。

## A. 核心卡牌交互
- ✅ **发牌/入场（Deal / Entrance）**：从牌堆飞入手牌，带 stagger、弧形落点、轻微弹性
- ✅ **翻牌（Flip）**：3D 翻转，前后两面，点击触发
- ✅ **悬停倾斜（Hover Tilt）**：鼠标悬停卡面随指针倾斜 + 轻微光晕跟随
- ✅ 手牌扇形展开/收拢（Hand Fan）
- ✅ 选中态（Select）：卡牌上浮、描边/发光增强、其它卡轻微压暗
- ⬜ 拖拽换位（Drag Reorder）：拖动卡牌重排，其他卡让位（需要 pointer 交互 + tween）
- ⬜ 目标吸附（Snap）：拖动到槽位自动吸附，失败回弹
- ⬜ 牌堆洗牌（Shuffle）：多张牌快速交错位移/旋转（可循环）

## B. 反馈类（命中/伤害/加成/结算）
- ✅ 数值飘字（Floating Numbers）：+10 / x1.5 这类浮动上飘淡出
- ✅ 数字加法（滚动+闪烁+抖动）：适合加分/回血/加成结算
- ✅ 数字粒子转移（Transfer）：数字→粒子飞向另一个数字，并触发另一数字加/减
- ✅ **计分数字滚动（Counter）**：数字从旧值滚到新值（含 easing）
- ✅ **抖动/屏震（Shake）**：命中/暴击/大失败时的轻微屏幕抖动或卡牌抖动
- ✅ **爆炸/粒子（Burst）**：加成触发、金币飞溅、星星散开
- ⬜ 轨迹拖尾（Trail）：物体快速移动时的拖影（可用多层 clone + stagger）
- ✅ “大字提示”弹出（Banner Pop）：例如 “COMBO!”、“PERFECT!”

## C. 视觉质感（稀有度/材质/闪光）
- ✅ **稀有度扫描光（Shine Sweep）**：斜向扫过的高光条（可循环）
- ✅ 霓虹描边脉冲（Glow Pulse）
- ⬜ 纸张/镭射材质感（Holographic）：基于渐变/噪声的轻微流动（不依赖 WebGL 也能做）
- ⬜ 抽到稀有卡的“聚光灯”过场（Spotlight）

## D. UI 与控制
- ⬜ 按钮按下/回弹（Press / Spring）
- ⬜ Tab/面板切换（Slide / Fade / Crossfade）
- ⬜ Tooltip / 提示条出现（Fade + slight y）
- ⬜ 失败提示（Wiggle / Shake）

## E. 回合/流程过场
- ⬜ 回合开始/结束遮罩（Curtain / Wipe）
- ⬜ “结算面板”从下弹出并串行动画（Timeline）
- ⬜ 卡牌消失/焚毁（Burn / Dissolve）：缩小 + 透明 + 颗粒散开（可模拟）

## F. 多卡牌/多物体互动（PK/对抗类）
- ✅ 破碎消失（Shatter）：方块碎裂为多块并飞散淡出
- ✅ 融化消失（Melt）：软化/下坠/滴落并淡出
- ✅ 吞噬（Swallow）：一块冲过去吞掉另一块并回位
- ✅ 打飞/击退（Knockback）：前冲命中 + 目标击退 + 震屏回弹
- ✅ PK 抖动预设（Shake Pack）：命中/暴击/闪避/眩晕/重击等常用反馈

---

## 已在本项目实现的 Demo 列表（可直接在站点里找到）
- `CARD_DEAL`（发牌入场）
- `CARD_FLIP`（点击翻牌）
- `HOVER_TILT`（悬停倾斜 + 光晕）
- `HAND_FAN`（手牌扇形展开/收拢）
- `CARD_SELECT`（选中态：上浮 + 其它压暗）
- `RARITY_SHINE`（稀有度扫描光）
- `SCORE_COUNTER`（计分数字滚动）
- `SCREEN_SHAKE`（屏震/抖动）
- `PARTICLE_BURST`（爆炸/粒子）
- `FLOATING_NUMBERS`（数值飘字）
- `NUMBER_ADD_FX`（数字加法：滚动 + 闪烁 + 抖动）
- `NUMBER_TRANSFER`（数字粒子转移并触发另一数字加/减）
- `BANNER_POP`（大字提示弹出）
- `GLOW_PULSE`（霓虹描边脉冲）
- `BLOCK_SHATTER`（破碎消失）
- `BLOCK_MELT`（融化消失）
- `BLOCK_SWALLOW`（吞噬）
- `BLOCK_KNOCKBACK`（打飞/击退）
- `PK_SHAKE_PACK`（PK 类抖动预设）
