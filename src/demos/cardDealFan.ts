import type { Demo } from "../types";
import { gsap } from "../gsap";

function clampInt(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, Math.round(n)));
}

const CARD_W = 120;
const CARD_H = 170;

type YProfileAnchor = "top" | "center" | "bottom";
type SpacingBasis = "center" | "edge";
type SpacingUnit = "px" | "percent";

function getProfileY(t: number, yProfile: string, lift: number, yAmount: number) {
  const baseLift = -Math.abs(t) * lift;

  let f = 0;
  if (yProfile === "arc") f = Math.abs(t);
  else if (yProfile === "sin") f = Math.sin(Math.abs(t) * Math.PI / 2);
  else if (yProfile === "cap") f = -Math.abs(t);
  else if (yProfile === "random") f = Math.sin(t * 12.9898 + 78.233) * 0.8;

  return baseLift - f * yAmount;
}

function getAnchorLocalY(anchor: YProfileAnchor) {
  if (anchor === "top") return -CARD_H / 2;
  if (anchor === "bottom") return CARD_H / 2;
  return 0;
}

function resolveSpacing(spacing: number, unit: SpacingUnit) {
  return unit === "percent" ? CARD_W * (spacing / 100) : spacing;
}

function makeCurveLayout(
  count: number,
  spacing: number,
  spacingUnit: SpacingUnit,
  spacingBasis: SpacingBasis,
  yProfileAnchor: YProfileAnchor,
  lift: number,
  yProfile: string,
  yAmount: number,
  spread: number,
  open01: number
) {
  const center = (count - 1) / 2;
  const spacingPx = resolveSpacing(spacing, spacingUnit);
  const centerStep = spacingBasis === "edge" ? spacingPx + CARD_W : spacingPx;
  const halfDistance = centerStep * center;
  const halfRange = Math.max(1, halfDistance);
  const samples = 240;
  const curve = Array.from({ length: samples + 1 }, (_, i) => {
    const t = -1 + (i / samples) * 2;
    return {
      t,
      x: t * halfRange,
      y: getProfileY(t, yProfile, lift, yAmount)
    };
  });
  const lengths = [0];
  for (let i = 1; i < curve.length; i += 1) {
    const dx = curve[i].x - curve[i - 1].x;
    const dy = curve[i].y - curve[i - 1].y;
    lengths[i] = lengths[i - 1] + Math.hypot(dx, dy);
  }
  const centerLength = lengths[lengths.length - 1] / 2;

  const pointAtLength = (target: number) => {
    const clamped = Math.min(lengths[lengths.length - 1], Math.max(0, target));
    let hi = lengths.findIndex((len) => len >= clamped);
    if (hi <= 0) return curve[0];
    const lo = hi - 1;
    const span = Math.max(0.0001, lengths[hi] - lengths[lo]);
    const a = (clamped - lengths[lo]) / span;
    return {
      t: curve[lo].t + (curve[hi].t - curve[lo].t) * a,
      x: curve[lo].x + (curve[hi].x - curve[lo].x) * a,
      y: curve[lo].y + (curve[hi].y - curve[lo].y) * a
    };
  };

  const anchorLocalY = getAnchorLocalY(yProfileAnchor);

  return Array.from({ length: count }, (_, i) => {
    const point = pointAtLength(centerLength + (i - center) * centerStep);
    const rotation = (i - center) * (spread / Math.max(count - 1, 1));
    const rad = (rotation * Math.PI) / 180;
    const rotatedAnchorY = Math.cos(rad) * anchorLocalY;
    return {
      x: point.x * open01,
      y: (point.y - rotatedAnchorY + anchorLocalY) * open01,
      rotation: rotation * open01
    };
  });
}

export const demoCardDealFan: Demo = {
  id: "card_deal_fan",
  title: "DEAL & FAN",
  subtitle: "STAGGER / FAN / HOVER",
  defaults: {
    count: 7,
    sourceX: 0,
    sourceY: 240,
    open: 1,
    spread: 60,
    spacing: 50,
    spacingUnit: "px",
    spacingBasis: "center",
    lift: 20,
    yProfile: "arc",
    yProfileAnchor: "bottom",
    yAmount: 20,
    duration: 0.6,
    stagger: 0.05,
    ease: "power3.out"
  },
  controls: [
    { key: "count", label: "count", type: "range", min: 3, max: 12, step: 1 },
    { key: "sourceX", label: "sourceX(px)", type: "range", min: -360, max: 360, step: 10 },
    { key: "sourceY", label: "sourceY(px)", type: "range", min: -240, max: 240, step: 10 },
    { key: "open", label: "open(0..1)", type: "range", min: 0, max: 1, step: 0.01 },
    { key: "spread", label: "spread(deg)", type: "range", min: 0, max: 90, step: 1 },
    { key: "spacing", label: "spacing", type: "range", min: 10, max: 120, step: 1 },
    {
      key: "spacingUnit",
      label: "spacingUnit",
      type: "select",
      options: [
        { label: "px(固定值)", value: "px" },
        { label: "% card width", value: "percent" }
      ]
    },
    {
      key: "spacingBasis",
      label: "spacingFrom",
      type: "select",
      options: [
        { label: "center to center", value: "center" },
        { label: "edge to edge", value: "edge" }
      ]
    },
    { key: "lift", label: "lift(px)", type: "range", min: 0, max: 60, step: 1 },
    {
      key: "yProfile",
      label: "yProfile",
      type: "select",
      options: [
        { label: "arc(圆弧)", value: "arc" },
        { label: "sin(正弦)", value: "sin" },
        { label: "cap(反向拱起)", value: "cap" },
        { label: "flat(全平)", value: "flat" },
        { label: "random(随机)", value: "random" }
      ]
    },
    {
      key: "yProfileAnchor",
      label: "yAlign",
      type: "select",
      options: [
        { label: "top center", value: "top" },
        { label: "card center", value: "center" },
        { label: "bottom center", value: "bottom" }
      ]
    },
    { key: "yAmount", label: "yAmount(px)", type: "range", min: 0, max: 60, step: 1 },
    { key: "duration", label: "duration", type: "range", min: 0.2, max: 1.5, step: 0.05 },
    { key: "stagger", label: "stagger", type: "range", min: 0, max: 0.2, step: 0.01 },
    {
      key: "ease",
      label: "ease",
      type: "select",
      options: [
        { label: "power3.out", value: "power3.out" },
        { label: "power2.out", value: "power2.out" },
        { label: "expo.out", value: "expo.out" },
        { label: "back.out(1.5)", value: "back.out(1.5)" }
      ]
    }
  ],
  getCode(params) {
    const count = Number(params.count);
    const sourceX = Number(params.sourceX);
    const sourceY = Number(params.sourceY);
    const open = Number(params.open);
    const spread = Number(params.spread);
    const spacing = Number(params.spacing);
    const spacingUnit = String(params.spacingUnit) as SpacingUnit;
    const spacingBasis = String(params.spacingBasis) as SpacingBasis;
    const lift = Number(params.lift);
    const yProfile = String(params.yProfile);
    const yProfileAnchor = String(params.yProfileAnchor) as YProfileAnchor;
    const yAmount = Number(params.yAmount);
    const duration = Number(params.duration);
    const stagger = Number(params.stagger);
    const ease = String(params.ease);

    return `// DEAL & FAN（发牌并展开）
const cards = document.querySelectorAll(".card");
const count = ${count};
const open = ${open}; // 0..1
const cardW = ${CARD_W};
const cardH = ${CARD_H};
const spacingPx = "${spacingUnit}" === "percent" ? cardW * (${spacing} / 100) : ${spacing};
const centerStep = "${spacingBasis}" === "edge" ? spacingPx + cardW : spacingPx;
const anchorY = { top: -cardH / 2, center: 0, bottom: cardH / 2 }["${yProfileAnchor}"];

function profileY(t) {
  const baseLift = -Math.abs(t) * ${lift};
  let f = 0;
  if ("${yProfile}" === "arc") f = Math.abs(t);
  else if ("${yProfile}" === "sin") f = Math.sin(Math.abs(t) * Math.PI / 2);
  else if ("${yProfile}" === "cap") f = -Math.abs(t);
  else if ("${yProfile}" === "random") f = Math.sin(t * 12.9898 + 78.233) * 0.8;
  return baseLift - f * ${yAmount};
}

function curveLayout(open01) {
  const center = (count - 1) / 2;
  const halfRange = Math.max(1, centerStep * center);
  const samples = 240;
  const curve = Array.from({ length: samples + 1 }, (_, i) => {
    const t = -1 + (i / samples) * 2;
    return { t, x: t * halfRange, y: profileY(t) };
  });
  const lengths = [0];
  for (let i = 1; i < curve.length; i++) {
    lengths[i] = lengths[i - 1] + Math.hypot(curve[i].x - curve[i - 1].x, curve[i].y - curve[i - 1].y);
  }
  const pointAt = (target) => {
    const clamped = Math.min(lengths[lengths.length - 1], Math.max(0, target));
    const hi = Math.max(1, lengths.findIndex((len) => len >= clamped));
    const lo = hi - 1;
    const a = (clamped - lengths[lo]) / Math.max(0.0001, lengths[hi] - lengths[lo]);
    return {
      x: curve[lo].x + (curve[hi].x - curve[lo].x) * a,
      y: curve[lo].y + (curve[hi].y - curve[lo].y) * a
    };
  };
  const centerLength = lengths[lengths.length - 1] / 2;
  return Array.from({ length: count }, (_, i) => {
    const point = pointAt(centerLength + (i - center) * centerStep);
    const rotation = (i - center) * (${spread} / Math.max(count - 1, 1));
    const rotatedAnchorY = Math.cos(rotation * Math.PI / 180) * anchorY;
    return {
      x: point.x * open01,
      y: (point.y - rotatedAnchorY + anchorY) * open01,
      rotation: rotation * open01
    };
  });
}

// 发牌起点
gsap.set(cards, { x: ${sourceX}, y: ${sourceY}, rotation: -20, scale: 0.9, transformOrigin: "50% 120%" });

// 飞到扇形位置
const layout = curveLayout(open);
gsap.to(cards, {
  x: (i) => layout[i].x,
  y: (i) => layout[i].y,
  rotation: (i) => layout[i].rotation,
  scale: 1,
  duration: ${duration},
  stagger: ${stagger},
  ease: "${ease}"
});`;
  },
  mount(el, { reduceMotion, params, mode } = {}) {
    const p = { ...(demoCardDealFan.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const count = clampInt(Number(p.count), 3, 12);
    const sourceX = Number(p.sourceX);
    const sourceY = Number(p.sourceY);
    const open = Number(p.open);
    const spread = Number(p.spread);
    const spacing = Number(p.spacing);
    const spacingUnit = String(p.spacingUnit) as SpacingUnit;
    const spacingBasis = String(p.spacingBasis) as SpacingBasis;
    const lift = Number(p.lift);
    const yProfile = String(p.yProfile);
    const yProfileAnchor = String(p.yProfileAnchor) as YProfileAnchor;
    const yAmount = Number(p.yAmount);
    const duration = Number(p.duration);
    const stagger = Number(p.stagger);
    const ease = String(p.ease);

    // 独立计算坐标的方法，用于 hover 恢复或 open 调整
    const layoutTo = (cards: HTMLElement[], open01: number, dur = 0.3, dEase = "power2.out", stg = 0) => {
      const layout = makeCurveLayout(
        count,
        spacing,
        spacingUnit,
        spacingBasis,
        yProfileAnchor,
        lift,
        yProfile,
        yAmount,
        spread,
        open01
      );
      return gsap.to(cards, {
        x: (i) => layout[i].x,
        y: (i) => layout[i].y,
        rotation: (i) => layout[i].rotation,
        scale: 1,
        duration: reduceMotion ? 0 : dur,
        ease: dEase,
        stagger: stg
      });
    };

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-6">
          <div class="relative w-full max-w-[560px] h-[260px]">
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest text-outline">
              ${mode === "preview" ? "AUTO DEAL" : "DRAG SLIDER / HOVER"}
            </div>
            <div class="hand absolute inset-0 flex items-end justify-center pb-10">
              <div class="relative w-[520px] h-[200px]">
                ${Array.from({ length: count })
                  .map(
                    (_, i) => `
                      <div
                        class="card absolute left-1/2 bottom-0 w-[120px] h-[170px] -translate-x-1/2 border border-outline-variant bg-surface shadow-sm overflow-hidden"
                        style="transform-origin: 50% 120%;"
                        data-i="${i}"
                      >
                        <div class="absolute inset-0 opacity-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNhZGIzYjAiLz48L3N2Zz4=')]"></div>
                        <div class="absolute top-2 left-2 text-[10px] font-mono tracking-widest text-outline">J${i + 1}</div>
                        <div class="absolute bottom-2 right-2 text-[10px] font-mono tracking-widest text-outline">♣</div>
                      </div>
                    `
                  )
                  .join("")}
              </div>
            </div>
          </div>
        </div>
      `;

      const cards = gsap.utils.toArray<HTMLElement>(".card", el);

      // 1. 初始化位置（发牌源）
      gsap.set(cards, {
        x: sourceX,
        y: sourceY,
        rotation: -20,
        scale: 0.9
      });

      // 2. 发牌动画（飞到最终扇形位置）
      if (reduceMotion) {
        layoutTo(cards, open, 0);
      } else {
        layoutTo(cards, open, duration, ease, stagger);
      }

      // 3. Hover 交互（轻微上浮 + 亮度）
      if (!reduceMotion) {
        const onEnter = (e: PointerEvent) => {
          const card = (e.target as Element | null)?.closest(".card") as HTMLElement | null;
          if (!card) return;
          gsap.to(card, { y: "-=10", duration: 0.18, ease: "power2.out", overwrite: "auto" });
          gsap.to(card, { boxShadow: "0 10px 30px rgba(16,73,241,0.18)", duration: 0.18 });
        };
        const onLeave = (e: PointerEvent) => {
          const card = (e.target as Element | null)?.closest(".card") as HTMLElement | null;
          if (!card) return;
          // 重新按当前 open 布局一次（只影响这一个卡牌的 y，这里用一个小技巧直接触发全局布局但不影响其他）
          const i = Number(card.dataset.i);
          const layout = makeCurveLayout(
            count,
            spacing,
            spacingUnit,
            spacingBasis,
            yProfileAnchor,
            lift,
            yProfile,
            yAmount,
            spread,
            Number(p.open)
          );
          gsap.to(card, {
            y: layout[i].y,
            duration: 0.2,
            ease: "power2.out",
            overwrite: "auto"
          });
          gsap.to(card, { boxShadow: "0 2px 0 rgba(0,0,0,0)", duration: 0.2 });
        };

        cards.forEach((c) => {
          c.addEventListener("pointerenter", onEnter);
          c.addEventListener("pointerleave", onLeave);
        });

        (el as any).__cleanupEvents = () => {
          cards.forEach((c) => {
            c.removeEventListener("pointerenter", onEnter);
            c.removeEventListener("pointerleave", onLeave);
          });
        };
      }

      // 4. 画廊预览时的循环展示
      let tl: gsap.core.Timeline | null = null;
      if (mode === "preview" && !reduceMotion) {
        // 重置状态
        gsap.set(cards, { x: sourceX, y: sourceY, rotation: -20, scale: 0.9 });
        const layout = makeCurveLayout(
          count,
          spacing,
          spacingUnit,
          spacingBasis,
          yProfileAnchor,
          lift,
          yProfile,
          yAmount,
          spread,
          1
        );
        tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
        tl.to(cards, {
          x: (i) => layout[i].x,
          y: (i) => layout[i].y,
          rotation: (i) => layout[i].rotation,
          scale: 1,
          duration,
          ease,
          stagger
        })
        .addPause(0.5)
        .add(layoutTo(cards, 0, 0.4, "power2.inOut"), "+=0") // 收拢
        .addPause(0.2)
        .to(cards, { x: sourceX, y: sourceY, rotation: -20, scale: 0.9, duration: 0.4, ease: "power2.inOut" }); // 退回发牌点
      }

      (el as any).__cleanup = () => {
        (el as any).__cleanupEvents?.();
        tl?.kill();
      };
    }, el);

    return () => {
      (el as any).__cleanup?.();
      ctx.revert();
    };
  }
};
