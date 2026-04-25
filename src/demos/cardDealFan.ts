import type { Demo } from "../types";
import { gsap } from "../gsap";

function clampInt(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, Math.round(n)));
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
    lift: 20,
    yProfile: "arc",
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
    { key: "spacing", label: "spacing(px)", type: "range", min: 20, max: 80, step: 1 },
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
    const lift = Number(params.lift);
    const yProfile = String(params.yProfile);
    const yAmount = Number(params.yAmount);
    const duration = Number(params.duration);
    const stagger = Number(params.stagger);
    const ease = String(params.ease);

    return `// DEAL & FAN（发牌并展开）
const cards = document.querySelectorAll(".card");
const count = ${count};
const open = ${open}; // 0..1

// 发牌起点
gsap.set(cards, { x: ${sourceX}, y: ${sourceY}, rotation: -20, scale: 0.9, transformOrigin: "50% 120%" });

// 飞到扇形位置
gsap.to(cards, {
  x: (i) => (i - (count - 1) / 2) * ${spacing} * open,
  y: (i) => {
    const center = (count - 1) / 2;
    const t = (i - center) / Math.max(center, 1); // -1..1
    let baseLift = -Math.abs(t) * ${lift};
    
    let f = 0;
    if ("${yProfile}" === "arc") f = Math.abs(t);
    else if ("${yProfile}" === "sin") f = Math.sin(Math.abs(t) * Math.PI/2);
    else if ("${yProfile}" === "cap") f = -Math.abs(t);
    else if ("${yProfile}" === "random") f = (Math.random() * 2 - 1) * 0.8;
    else f = 0;
    
    return (baseLift - f * ${yAmount}) * open;
  },
  rotation: (i) => (i - (count - 1) / 2) * (${spread} / Math.max(count - 1, 1)) * open,
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
    const lift = Number(p.lift);
    const yProfile = String(p.yProfile);
    const yAmount = Number(p.yAmount);
    const duration = Number(p.duration);
    const stagger = Number(p.stagger);
    const ease = String(p.ease);

    // 计算 y 偏移的辅助函数
    const calcY = (i: number, open01: number) => {
      const center = (count - 1) / 2;
      const denom = Math.max(center, 1);
      const t = (i - center) / denom; // -1..1
      let baseLift = -Math.abs(t) * lift;
      
      let f = 0;
      if (yProfile === "arc") f = Math.abs(t);
      else if (yProfile === "sin") f = Math.sin(Math.abs(t) * Math.PI / 2);
      else if (yProfile === "cap") f = -Math.abs(t);
      else if (yProfile === "random") f = (Math.random() * 2 - 1) * 0.8;
      else f = 0;
      
      return (baseLift - f * yAmount) * open01;
    };

    // 独立计算坐标的方法，用于 hover 恢复或 open 调整
    const layoutTo = (cards: HTMLElement[], open01: number, dur = 0.3, dEase = "power2.out", stg = 0) => {
      const center = (count - 1) / 2;
      const denom = Math.max(center, 1);
      return gsap.to(cards, {
        x: (i) => (i - center) * spacing * open01,
        y: (i) => calcY(i, open01),
        rotation: (i) => (i - center) * (spread / denom) * open01,
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
          gsap.to(card, {
            y: calcY(i, Number(p.open)),
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
        tl = gsap.timeline({ repeat: -1, repeatDelay: 1 });
        tl.to(cards, {
          x: (i) => (i - (count - 1) / 2) * spacing * 1,
          y: (i) => calcY(i, 1),
          rotation: (i) => (i - (count - 1) / 2) * (spread / Math.max(count - 1, 1)) * 1,
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
