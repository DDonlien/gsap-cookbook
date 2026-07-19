import type { Demo } from "../types";
import { gsap } from "../gsap";

type Entry = "left" | "right" | "top" | "bottom";
type Order = "matrixFirst" | "excessFirst" | "simultaneous";
type Morph = "before" | "after";

const CELL = 64;
const GAP = 8;
const PITCH = CELL + GAP;
const VIEW = CELL * 3 + GAP * 2;
const FLY_EXTRA = PITCH * 2;
const FADE_EASE = "sine.inOut";

const KEEP_CLASS = "cell absolute border border-outline-variant bg-surface-container-high";
const INCOMING_CLASS = "cell absolute border border-primary bg-primary/70";
const EXIT_CLASS = "cell absolute border border-tertiary bg-tertiary/50";

function getLayout(entry: Entry) {
  switch (entry) {
    case "left":
      return { axis: "x" as const, sign: 1, enterIndex: -1, exitIndex: 2 };
    case "right":
      return { axis: "x" as const, sign: -1, enterIndex: 3, exitIndex: 0 };
    case "top":
      return { axis: "y" as const, sign: 1, enterIndex: -1, exitIndex: 2 };
    case "bottom":
    default:
      return { axis: "y" as const, sign: -1, enterIndex: 3, exitIndex: 0 };
  }
}

function cellStyle(row: number, col: number) {
  return `position:absolute;width:${CELL}px;height:${CELL}px;left:${col * PITCH}px;top:${row * PITCH}px;`;
}

// 1x3 / 3x1 条：作为单个矩形元素渲染，而不是三个各自独立的小格子
function stripStyle(axis: "x" | "y", index: number) {
  if (axis === "x") {
    return `position:absolute;width:${CELL}px;height:${VIEW}px;left:${index * PITCH}px;top:0px;`;
  }
  return `position:absolute;width:${VIEW}px;height:${CELL}px;left:0px;top:${index * PITCH}px;`;
}

function axisVars(axis: "x" | "y", value: number | string): gsap.TweenVars {
  return axis === "x" ? { x: value } : { y: value };
}

function makeStripCells(viewport: HTMLElement, axis: "x" | "y", index: number, className: string) {
  const cells: HTMLElement[] = [];
  for (let i = 0; i < 3; i++) {
    const row = axis === "x" ? i : index;
    const col = axis === "x" ? index : i;
    const cell = document.createElement("div");
    cell.className = className;
    cell.style.cssText = cellStyle(row, col);
    viewport.appendChild(cell);
    cells.push(cell);
  }
  return cells;
}

function makeCard(viewport: HTMLElement, axis: "x" | "y", index: number, className: string) {
  const card = document.createElement("div");
  card.className = className;
  card.style.cssText = stripStyle(axis, index);
  viewport.appendChild(card);
  return card;
}

export const demoMoveMatrix: Demo = {
  id: "move_matrix",
  title: "MOVE_MATRIX",
  subtitle: "3x3 ATTACH → BLEND → SHIFT → BLEND → EXIT",
  defaults: {
    entry: "left",
    order: "matrixFirst",
    morph: "after",
    duration: 0.6,
    ease: "power2.inOut",
    tilt: 16
  },
  controls: [
    {
      key: "entry",
      label: "entry",
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" },
        { label: "Top", value: "top" },
        { label: "Bottom", value: "bottom" }
      ]
    },
    {
      key: "order",
      label: "order",
      type: "select",
      options: [
        { label: "Matrix First", value: "matrixFirst" },
        { label: "Excess First", value: "excessFirst" },
        { label: "Simultaneous", value: "simultaneous" }
      ]
    },
    {
      key: "morph",
      label: "exit morph",
      type: "select",
      options: [
        { label: "Move First", value: "after" },
        { label: "Morph First", value: "before" }
      ]
    },
    { key: "duration", label: "duration", type: "range", min: 0.2, max: 1.5, step: 0.05 },
    {
      key: "ease",
      label: "ease",
      type: "select",
      options: [
        { label: "power2.inOut", value: "power2.inOut" },
        { label: "power3.inOut", value: "power3.inOut" },
        { label: "back.out(1.4)", value: "back.out(1.4)" },
        { label: "none", value: "none" }
      ]
    },
    { key: "tilt", label: "tilt(deg)", type: "range", min: 0, max: 45, step: 1 }
  ],
  getCode(params) {
    const entry = String(params.entry);
    const order = String(params.order);
    const morph = String(params.morph);
    const duration = Number(params.duration);
    const ease = String(params.ease);
    const tilt = Number(params.tilt);

    // order 决定「矩阵位移」与「离场卡牌单独移走」的先后关系（matrixFirst / excessFirst / simultaneous）。
    // exit 的合并（格子→卡牌）用真正的交叉淡入淡出，而不是瞬间切换；
    // morph = "before" 时它和贴入条一起、在位移前合并；morph = "after"（默认）时要等矩阵位移完全结束才合并。
    const moveCode =
      order === "excessFirst"
        ? morph === "before"
          ? `tl.to(exitCard, { ...shiftVars, rotation: layout.sign * ${tilt}, autoAlpha: 0, duration: ${duration}, ease: "${ease}" })
  .to([...keepCells, ...incomingCells], { ...shiftVars, duration: ${duration}, ease: "${ease}" });`
          : `tl.to(exitCells, { ...shiftVars, duration: ${duration}, ease: "${ease}" })
  .to([...keepCells, ...incomingCells], { ...shiftVars, duration: ${duration}, ease: "${ease}" });`
        : order === "simultaneous" && morph === "before"
          ? `tl.to([...keepCells, ...incomingCells], { ...shiftVars, duration: ${duration}, ease: "${ease}" }, "shift")
  .to(exitCard, { ...shiftVars, rotation: layout.sign * ${tilt}, duration: ${duration}, ease: "${ease}" }, "shift")
  .set(exitCard, { autoAlpha: 0 });`
          : morph === "before"
            ? `tl.to([...keepCells, ...incomingCells, exitCard], { ...shiftVars, duration: ${duration}, ease: "${ease}" });

tl.to(exitCard, { ...flourishVars, rotation: layout.sign * ${tilt}, autoAlpha: 0, duration: ${duration} * 0.6, ease: "${ease}" });`
            : `tl.to([...keepCells, ...incomingCells, ...exitCells], { ...shiftVars, duration: ${duration}, ease: "${ease}" });`;

    return `// MOVE_MATRIX（3x3 位移换位）
// 1) 贴入条从画面外飞入（带倾斜角度）
// 2) 贴入条与旧矩阵交叉淡入淡出，融合成普通格子（不是瞬间切换）
// 3) 矩阵整体位移 1 格（order 决定它与「离场卡牌单独移走」的先后关系）
// 4) 多余的一列淡入淡出，合并成一整块卡牌（morph 决定这一步在位移前还是位移后发生，默认「位移后」）
// 5) 合并出的卡牌带着倾斜角度飞走
const CELL = ${CELL}, GAP = ${GAP}, PITCH = CELL + GAP, VIEW = CELL * 3 + GAP * 2, FLY_EXTRA = PITCH * 2;
const FADE_DUR = Math.min(0.35, ${duration} * 0.5);

const layout = {
  left:   { axis: "x", sign:  1, enterIndex: -1, exitIndex: 2 },
  right:  { axis: "x", sign: -1, enterIndex:  3, exitIndex: 0 },
  top:    { axis: "y", sign:  1, enterIndex: -1, exitIndex: 2 },
  bottom: { axis: "y", sign: -1, enterIndex:  3, exitIndex: 0 }
}["${entry}"];

const viewport = document.querySelector(".matrix-viewport");
viewport.style.cssText = \`position:relative;width:\${VIEW}px;height:\${VIEW}px;\`;

const cellStyle = (row, col) =>
  \`position:absolute;width:\${CELL}px;height:\${CELL}px;left:\${col * PITCH}px;top:\${row * PITCH}px;\`;
const stripStyle = (axis, index) =>
  axis === "x"
    ? \`position:absolute;width:\${CELL}px;height:\${VIEW}px;left:\${index * PITCH}px;top:0px;\`
    : \`position:absolute;width:\${VIEW}px;height:\${CELL}px;left:0px;top:\${index * PITCH}px;\`;
const makeStripCells = (axis, index, cls) => {
  const cells = [];
  for (let i = 0; i < 3; i++) {
    const row = axis === "x" ? i : index;
    const col = axis === "x" ? index : i;
    const el = document.createElement("div");
    el.className = cls;
    el.style.cssText = cellStyle(row, col);
    viewport.appendChild(el);
    cells.push(el);
  }
  return cells;
};
const makeCard = (axis, index, cls) => {
  const el = document.createElement("div");
  el.className = cls;
  el.style.cssText = stripStyle(axis, index);
  viewport.appendChild(el);
  return el;
};

// 矩阵始终待在原位的 6 个普通格子（跳过将要离场的那一列/行）
const keepCells = [];
for (let row = 0; row < 3; row++) {
  for (let col = 0; col < 3; col++) {
    const groupKey = layout.axis === "x" ? col : row;
    if (groupKey === layout.exitIndex) continue;
    const el = document.createElement("div");
    el.className = "cell";
    el.style.cssText = cellStyle(row, col);
    viewport.appendChild(el);
    keepCells.push(el);
  }
}

// 贴入条：飞入时是卡牌；落位后立刻和普通格子交叉淡入淡出，永远在矩阵位移之前完成融合
const incomingCard = makeCard(layout.axis, layout.enterIndex, "cell cell-incoming");
const incomingCells = makeStripCells(layout.axis, layout.enterIndex, "cell");
gsap.set(incomingCells, { autoAlpha: 0 });

// 离场条：平时是矩阵里的 3 个普通格子；合并后变成一整块卡牌（合并时机由 morph 决定）
const exitCells = makeStripCells(layout.axis, layout.exitIndex, "cell");
const exitCard = makeCard(layout.axis, layout.exitIndex, "cell cell-exit");
gsap.set(exitCard, { autoAlpha: 0 });

gsap.set(incomingCard, {
  ...(layout.axis === "x" ? { x: -layout.sign * FLY_EXTRA } : { y: -layout.sign * FLY_EXTRA }),
  rotation: -layout.sign * ${tilt}
});

const shiftDelta = layout.sign * PITCH;
const shiftVars = layout.axis === "x" ? { x: \`+=\${shiftDelta}\` } : { y: \`+=\${shiftDelta}\` };
const flourishVars = layout.axis === "x" ? { x: \`+=\${layout.sign * PITCH * 0.6}\` } : { y: \`+=\${layout.sign * PITCH * 0.6}\` };

const tl = gsap.timeline();

// 阶段一：贴入条整体带着倾斜角度从画面外飞入并转正，贴合成 4x3（矩阵本身完全静止，参考 DEAL & FAN 的发牌手感）
tl.to(incomingCard, { x: 0, y: 0, rotation: 0, duration: ${duration}, ease: "${ease}" });

// 阶段二：贴入条与普通格子交叉淡入淡出（真正的渐变，不是瞬间切换），永远发生在位移之前
tl.to(incomingCard, { autoAlpha: 0, duration: FADE_DUR, ease: "${FADE_EASE}" }, "blendIn")
  .to(incomingCells, { autoAlpha: 1, duration: FADE_DUR, ease: "${FADE_EASE}" }, "blendIn");

${
  morph === "before"
    ? `// morph = before：多余的格子这时也一起交叉淡入淡出合并成卡牌
tl.to(exitCells, { autoAlpha: 0, duration: FADE_DUR, ease: "${FADE_EASE}" }, "blendIn")
  .to(exitCard, { autoAlpha: 1, duration: FADE_DUR, ease: "${FADE_EASE}" }, "blendIn");

`
    : ""
}// 阶段三：矩阵整体位移
${moveCode}
${
  morph === "after"
    ? `
// 阶段四：位移完全结束后，多余的一列才交叉淡入淡出合并成卡牌
tl.set(exitCard, { ...shiftVars })
  .to(exitCells, { autoAlpha: 0, duration: FADE_DUR, ease: "${FADE_EASE}" }, "blendOut")
  .to(exitCard, { autoAlpha: 1, duration: FADE_DUR, ease: "${FADE_EASE}" }, "blendOut");

// 阶段五：合并出的卡牌带着倾斜角度飞走
tl.to(exitCard, {
  ...flourishVars,
  rotation: layout.sign * ${tilt},
  autoAlpha: 0,
  duration: ${duration} * 0.6,
  ease: "${ease}"
});`
    : ""
}`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoMoveMatrix.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const entry = String(p.entry) as Entry;
    const order = String(p.order) as Order;
    const morph = String(p.morph) as Morph;
    const duration = Number(p.duration);
    const ease = String(p.ease);
    const tilt = Number(p.tilt);

    const ctx = gsap.context(() => {
      const layout = getLayout(entry);

      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center">
          <div class="matrix-viewport" style="position:relative;width:${VIEW}px;height:${VIEW}px;"></div>
        </div>
      `;
      const viewport = el.querySelector(".matrix-viewport") as HTMLElement;

      // 矩阵始终待在原位的 6 个普通格子（跳过将要离场的那一列/行）
      const keepCells: HTMLElement[] = [];
      for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
          const groupKey = layout.axis === "x" ? col : row;
          if (groupKey === layout.exitIndex) continue;
          const cell = document.createElement("div");
          cell.className = KEEP_CLASS;
          cell.style.cssText = cellStyle(row, col);
          viewport.appendChild(cell);
          keepCells.push(cell);
        }
      }

      // 贴入条：飞入阶段是一整块卡牌；落位后立刻和矩阵交叉淡入淡出，融合过程永远发生在位移之前
      const incomingCard = makeCard(viewport, layout.axis, layout.enterIndex, INCOMING_CLASS);
      const incomingCells = makeStripCells(viewport, layout.axis, layout.enterIndex, KEEP_CLASS);
      gsap.set(incomingCells, { autoAlpha: 0 });

      // 离场条：平时是矩阵里普通的 3 个格子；合并后变成一整块卡牌再离场（合并时机由 morph 决定）
      const exitCells = makeStripCells(viewport, layout.axis, layout.exitIndex, KEEP_CLASS);
      const exitCard = makeCard(viewport, layout.axis, layout.exitIndex, EXIT_CLASS);
      gsap.set(exitCard, { autoAlpha: 0 });

      const shiftDelta = layout.sign * PITCH;
      const shiftVars = axisVars(layout.axis, `+=${shiftDelta}`);
      const flourishVars = axisVars(layout.axis, `+=${layout.sign * PITCH * 0.6}`);
      const FADE_DUR = Math.min(0.35, duration * 0.5);

      if (reduceMotion) {
        gsap.set(incomingCard, { autoAlpha: 0 });
        gsap.set(exitCells, { autoAlpha: 0 });
        gsap.set(exitCard, { autoAlpha: 0 });
        gsap.set(keepCells, shiftVars);
        gsap.set(incomingCells, { autoAlpha: 1, ...shiftVars });
        return;
      }

      // 飞入前先把贴入条推得更远（画面外）并转一个角度，只作为动画起点，不改变它的「贴合槽位」基准
      gsap.set(incomingCard, {
        ...axisVars(layout.axis, -layout.sign * FLY_EXTRA),
        rotation: -layout.sign * tilt
      });

      const tl = gsap.timeline();

      // 阶段一：贴入条整体带着倾斜角度从画面外飞入并转正，贴合成 4x3（矩阵本身完全静止，参考 DEAL & FAN 的发牌手感）
      tl.to(incomingCard, { x: 0, y: 0, rotation: 0, duration, ease });

      // 阶段二：贴入条与普通格子交叉淡入淡出（真正的渐变，不是瞬间切换），永远发生在位移之前
      tl.to(incomingCard, { autoAlpha: 0, duration: FADE_DUR, ease: FADE_EASE }, "blendIn").to(
        incomingCells,
        { autoAlpha: 1, duration: FADE_DUR, ease: FADE_EASE },
        "blendIn"
      );

      if (morph === "before") {
        // 多余的格子这时也一起交叉淡入淡出合并成卡牌（在位移之前完成）
        tl.to(exitCells, { autoAlpha: 0, duration: FADE_DUR, ease: FADE_EASE }, "blendIn").to(
          exitCard,
          { autoAlpha: 1, duration: FADE_DUR, ease: FADE_EASE },
          "blendIn"
        );
      }

      // 阶段三：矩阵整体位移。order 决定它与「离场卡牌单独移走」的先后关系
      if (order === "excessFirst") {
        if (morph === "before") {
          tl.to(exitCard, {
            ...shiftVars,
            rotation: layout.sign * tilt,
            autoAlpha: 0,
            duration,
            ease
          }).to([...keepCells, ...incomingCells], { ...shiftVars, duration, ease });
        } else {
          tl.to(exitCells, { ...shiftVars, duration, ease }).to([...keepCells, ...incomingCells], {
            ...shiftVars,
            duration,
            ease
          });
        }
      } else if (order === "simultaneous" && morph === "before") {
        tl.to([...keepCells, ...incomingCells], { ...shiftVars, duration, ease }, "shift")
          .to(exitCard, { ...shiftVars, rotation: layout.sign * tilt, duration, ease }, "shift")
          .set(exitCard, { autoAlpha: 0 });
      } else if (morph === "before") {
        // matrixFirst：矩阵（含贴入条与尚未离场的卡牌）先整体平移，卡牌随后再单独补一段带角度的离场
        tl.to([...keepCells, ...incomingCells, exitCard], { ...shiftVars, duration, ease });
        tl.to(exitCard, {
          ...flourishVars,
          rotation: layout.sign * tilt,
          autoAlpha: 0,
          duration: duration * 0.6,
          ease
        });
      } else {
        // matrixFirst / simultaneous 在「尚未合并」这个阶段是同一回事：都还是普通格子，一起平移
        tl.to([...keepCells, ...incomingCells, ...exitCells], { ...shiftVars, duration, ease });
      }

      if (morph === "after") {
        // 阶段四：位移完全结束后，多余的一列才交叉淡入淡出合并成卡牌（不与位移重叠）
        tl.set(exitCard, shiftVars)
          .to(exitCells, { autoAlpha: 0, duration: FADE_DUR, ease: FADE_EASE }, "blendOut")
          .to(exitCard, { autoAlpha: 1, duration: FADE_DUR, ease: FADE_EASE }, "blendOut");

        // 阶段五：合并出的卡牌带着倾斜角度飞走
        tl.to(exitCard, {
          ...flourishVars,
          rotation: layout.sign * tilt,
          autoAlpha: 0,
          duration: duration * 0.6,
          ease
        });
      }
    }, el);

    return () => ctx.revert();
  }
};
