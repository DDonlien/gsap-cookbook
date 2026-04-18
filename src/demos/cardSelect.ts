import type { Demo } from "../types";
import { gsap } from "../gsap";

function clampInt(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, Math.round(n)));
}

export const demoCardSelect: Demo = {
  id: "card_select",
  title: "CARD_SELECT",
  subtitle: "CLICK / LIFT / DIM OTHERS",
  tags: { playback: ["interactive"], type: ["card", "ui", "feedback"], related: ["mouse"] },
  defaults: {
    count: 6,
    selectMode: "single",
    lift: 28,
    selectedScale: 1.06,
    dimOpacity: 0.45,
    duration: 0.22
  },
  controls: [
    { key: "count", label: "count", type: "range", min: 3, max: 10, step: 1 },
    {
      key: "selectMode",
      label: "selectMode",
      type: "select",
      options: [
        { label: "single(单选)", value: "single" },
        { label: "multi(多选)", value: "multi" }
      ]
    },
    { key: "lift", label: "lift(px)", type: "range", min: 0, max: 60, step: 1 },
    { key: "selectedScale", label: "selectedScale", type: "range", min: 1, max: 1.25, step: 0.01 },
    { key: "dimOpacity", label: "dimOpacity", type: "range", min: 0.05, max: 1, step: 0.05 },
    { key: "duration", label: "duration", type: "range", min: 0, max: 0.8, step: 0.05 }
  ],
  getCode(params) {
    const count = Number(params.count);
    const selectMode = String(params.selectMode ?? "single");
    const lift = Number(params.lift);
    const selectedScale = Number(params.selectedScale);
    const dimOpacity = Number(params.dimOpacity);
    const duration = Number(params.duration);
    return `// CARD_SELECT（选中态：上浮 + 其它压暗，支持单选/多选）
const cards = document.querySelectorAll(".card");
const mode = "${selectMode}"; // "single" | "multi"
const selected = new Set();

function render() {
  cards.forEach((el, i) => {
    const hasAny = selected.size > 0;
    const isSel = selected.has(i);
    gsap.to(el, {
      y: isSel ? -${lift} : 0,
      scale: isSel ? ${selectedScale} : 1,
      opacity: !hasAny ? 1 : (isSel ? 1 : ${dimOpacity}),
      boxShadow: isSel ? "0 14px 45px rgba(16,73,241,0.25)" : "0 2px 0 rgba(0,0,0,0)",
      duration: ${duration},
      ease: "power2.out"
    });
  });
}

cards.forEach((el, i) => {
  el.addEventListener("click", () => {
    if (mode === "single") {
      if (selected.size === 1 && selected.has(i)) selected.clear(); // 再次点击取消
      else {
        selected.clear();
        selected.add(i);
      }
    } else {
      if (selected.has(i)) selected.delete(i);
      else selected.add(i);
    }
    render();
  });
});`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoCardSelect.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const count = clampInt(Number(p.count), 3, 10);
    const selectMode = String(p.selectMode ?? "single");
    const lift = Number(p.lift);
    const selectedScale = Number(p.selectedScale);
    const dimOpacity = Number(p.dimOpacity);
    const duration = Number(p.duration);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-8">
          <div class="w-full max-w-[620px]">
            <div class="text-center text-[10px] font-mono uppercase tracking-widest text-outline mb-4">CLICK CARD</div>
            <div class="hand relative h-[220px] flex items-end justify-center gap-3">
              ${Array.from({ length: count })
                .map(
                  (_, i) => `
                    <button
                      class="card relative w-[110px] h-[160px] border border-outline-variant bg-surface shadow-sm overflow-hidden cursor-pointer select-none"
                      style="transform-origin: 50% 100%;"
                      data-i="${i}"
                      type="button"
                    >
                      <div class="absolute inset-0 opacity-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNhZGIzYjAiLz48L3N2Zz4=')]"></div>
                      <div class="absolute top-2 left-2 text-[10px] font-mono tracking-widest text-outline">J${i + 1}</div>
                      <div class="absolute bottom-2 right-2 text-[10px] font-mono tracking-widest text-outline">${i % 2 ? "♥" : "♠"}</div>
                      <div class="ring pointer-events-none absolute inset-0 opacity-0" style="box-shadow: inset 0 0 0 1px rgba(16,73,241,0.55)"></div>
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>
        </div>
      `;

      const cards = gsap.utils.toArray<HTMLButtonElement>(".card", el);
      const selected = new Set<number>();

      const render = () => {
        const hasAny = selected.size > 0;
        cards.forEach((card, i) => {
          const isSel = selected.has(i);
          const ring = card.querySelector(".ring") as HTMLElement | null;
          const base = {
            y: isSel ? -lift : 0,
            scale: isSel ? selectedScale : 1,
            opacity: !hasAny ? 1 : isSel ? 1 : dimOpacity,
            boxShadow: isSel ? "0 14px 45px rgba(16,73,241,0.25)" : "0 2px 0 rgba(0,0,0,0)",
            duration: reduceMotion ? 0 : duration,
            ease: "power2.out"
          } as gsap.TweenVars;
          gsap.to(card, base);
          if (ring) gsap.to(ring, { opacity: isSel ? 1 : 0, duration: reduceMotion ? 0 : duration });
          card.classList.toggle("is-selected", isSel);
        });
      };

      // 初始渲染一次
      render();

      const onClick = (e: MouseEvent) => {
        const btn = (e.target as Element | null)?.closest(".card") as HTMLElement | null;
        if (!btn) return;
        const i = Number(btn.getAttribute("data-i") || "-1");
        if (Number.isNaN(i) || i < 0) return;
        if (selectMode === "single") {
          // 同一张再次点击：取消选择
          if (selected.size === 1 && selected.has(i)) selected.clear();
          else {
            selected.clear();
            selected.add(i);
          }
        } else {
          // 多选：点击切换
          if (selected.has(i)) selected.delete(i);
          else selected.add(i);
        }
        render();
      };
      el.addEventListener("click", onClick);
      (el as any).__cleanup = () => el.removeEventListener("click", onClick);
    }, el);

    return () => {
      (el as any).__cleanup?.();
      ctx.revert();
    };
  }
};
