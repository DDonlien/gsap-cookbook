import type { Demo } from "../types";
import { gsap } from "../gsap";

function clampInt(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, Math.round(n)));
}

export const demoHandFan: Demo = {
  id: "hand_fan",
  title: "HAND_FAN",
  subtitle: "FAN / OPEN-CLOSE",
  tags: { playback: ["interactive"], type: ["card", "ui"], related: ["mouse"] },
  defaults: {
    count: 8,
    open: 1,
    spread: 48,
    spacing: 54,
    lift: 20,
    duration: 0.28,
    ease: "power3.out"
  },
  controls: [
    { key: "count", label: "count", type: "range", min: 3, max: 12, step: 1 },
    { key: "open", label: "open(0..1)", type: "range", min: 0, max: 1, step: 0.01 },
    { key: "spread", label: "spread(deg)", type: "range", min: 0, max: 80, step: 1 },
    { key: "spacing", label: "spacing(px)", type: "range", min: 30, max: 80, step: 1 },
    { key: "lift", label: "lift(px)", type: "range", min: 0, max: 40, step: 1 },
    { key: "duration", label: "duration", type: "range", min: 0, max: 0.8, step: 0.05 },
    {
      key: "ease",
      label: "ease",
      type: "select",
      options: [
        { label: "power3.out", value: "power3.out" },
        { label: "power2.out", value: "power2.out" },
        { label: "expo.out", value: "expo.out" },
        { label: "back.out(1.6)", value: "back.out(1.6)" }
      ]
    }
  ],
  getCode(params) {
    const count = Number(params.count);
    const open = Number(params.open);
    const spread = Number(params.spread);
    const spacing = Number(params.spacing);
    const lift = Number(params.lift);
    const duration = Number(params.duration);
    const ease = String(params.ease);

    return `// HAND_FAN（手牌扇形展开/收拢）
const cards = document.querySelectorAll(".card");
const count = ${count};
const open = ${open}; // 0..1

gsap.to(cards, {
  x: (i) => (i - (count - 1) / 2) * ${spacing} * open,
  y: (i) => -Math.abs((i - (count - 1) / 2) / Math.max((count - 1) / 2, 1)) * ${lift} * open,
  rotation: (i) => (i - (count - 1) / 2) * (${spread} / Math.max(count - 1, 1)) * open,
  duration: ${duration},
  ease: "${ease}"
});`;
  },
  mount(el, { reduceMotion, params, mode } = {}) {
    const p = { ...(demoHandFan.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const count = clampInt(Number(p.count), 3, 12);
    const open = Number(p.open);
    const spread = Number(p.spread);
    const spacing = Number(p.spacing);
    const lift = Number(p.lift);
    const duration = Number(p.duration);
    const ease = String(p.ease);

    const layoutTo = (cards: HTMLElement[], open01: number) => {
      const center = (count - 1) / 2;
      const denom = Math.max(center, 1);
      return gsap.to(cards, {
        x: (i) => (i - center) * spacing * open01,
        y: (i) => -Math.abs((i - center) / denom) * lift * open01,
        rotation: (i) => (i - center) * (spread / Math.max(count - 1, 1)) * open01,
        duration: reduceMotion ? 0 : duration,
        ease
      });
    };

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-6">
          <div class="relative w-full max-w-[560px] h-[260px]">
            <div class="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest text-outline">
              ${mode === "preview" ? "AUTO" : "DRAG SLIDER / HOVER"}
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
      gsap.set(cards, { x: 0, y: 0, rotation: 0 });

      // 初始状态
      layoutTo(cards, open);

      if (reduceMotion) return;

      // hover 强化：轻微上浮 + 亮度
      const onEnter = (e: PointerEvent) => {
        const card = (e.target as Element | null)?.closest(".card") as HTMLElement | null;
        if (!card) return;
        gsap.to(card, { y: "-=10", duration: 0.18, ease: "power2.out" });
        gsap.to(card, { boxShadow: "0 10px 30px rgba(16,73,241,0.18)", duration: 0.18 });
      };
      const onLeave = (e: PointerEvent) => {
        const card = (e.target as Element | null)?.closest(".card") as HTMLElement | null;
        if (!card) return;
        // 重新按当前 open 布局一次，确保 y 回到正确值
        layoutTo(cards, Number(p.open));
        gsap.to(card, { boxShadow: "0 2px 0 rgba(0,0,0,0)", duration: 0.2 });
      };

      cards.forEach((c) => {
        c.addEventListener("pointerenter", onEnter);
        c.addEventListener("pointerleave", onLeave);
      });

      // preview 自动“开合”一次，便于在画廊里看效果
      let tl: gsap.core.Timeline | null = null;
      if (mode === "preview") {
        tl = gsap
          .timeline({ repeat: -1, repeatDelay: 0.55 })
          .add(layoutTo(cards, 0))
          .addPause(0.05)
          .add(layoutTo(cards, 1), 0.12)
          .addPause(0.35);
      }

      (el as any).__cleanup = () => {
        cards.forEach((c) => {
          c.removeEventListener("pointerenter", onEnter);
          c.removeEventListener("pointerleave", onLeave);
        });
        tl?.kill();
      };
    }, el);

    return () => {
      (el as any).__cleanup?.();
      ctx.revert();
    };
  }
};
