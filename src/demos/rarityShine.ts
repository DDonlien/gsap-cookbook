import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoRarityShine: Demo = {
  id: "rarity_shine",
  title: "RARITY_SHINE",
  subtitle: "LOOP / SWEEP",
  defaults: {
    duration: 1.6,
    angle: -20,
    opacity: 0.35
  },
  controls: [
    { key: "duration", label: "duration", type: "range", min: 0.6, max: 4, step: 0.1 },
    { key: "angle", label: "angle(deg)", type: "range", min: -60, max: 60, step: 1 },
    { key: "opacity", label: "opacity", type: "range", min: 0, max: 1, step: 0.05 }
  ],
  getCode(params) {
    const duration = Number(params.duration);
    const angle = Number(params.angle);
    const opacity = Number(params.opacity);
    return `// RARITY_SHINE
gsap.set(".shine", { xPercent: -160, rotation: ${angle}, opacity: ${opacity} });
gsap.to(".shine", { xPercent: 160, duration: ${duration}, ease: "none", repeat: -1 });`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoRarityShine.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const duration = Number(p.duration);
    const angle = Number(p.angle);
    const opacity = Number(p.opacity);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-8">
          <div class="card relative w-[180px] h-[240px] border border-outline-variant bg-surface shadow-sm overflow-hidden">
            <div class="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNhZGIzYjAiLz48L3N2Zz4=')]"></div>
            <div class="shine absolute top-[-40%] left-[-40%] w-[80%] h-[180%] bg-gradient-to-r from-transparent via-primary/40 to-transparent"></div>
            <div class="absolute top-2 left-2 text-[10px] font-mono tracking-widest text-outline">RARE</div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-3xl font-bold tracking-tight">★</div>
            </div>
          </div>
        </div>
      `;

      const shine = el.querySelector(".shine") as HTMLElement | null;
      if (!shine) return;

      gsap.set(shine, { xPercent: -160, rotation: angle, opacity });
      if (reduceMotion) return;

      gsap.to(shine, { xPercent: 160, duration, ease: "none", repeat: -1 });
    }, el);

    return () => ctx.revert();
  }
};
