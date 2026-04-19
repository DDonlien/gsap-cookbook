import type { Demo } from "../types";
import { gsap } from "../gsap";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const demoBlockSwallow: Demo = {
  id: "block_swallow",
  title: "BLOCK_SWALLOW",
  subtitle: "EAT / SCALE / VANISH",
  defaults: {
    duration: 0.85,
    zoom: 1.28,
    bite: 12
  },
  controls: [
    { key: "duration", label: "duration", type: "range", min: 0.25, max: 2.2, step: 0.05 },
    { key: "zoom", label: "zoom", type: "range", min: 1, max: 2, step: 0.02 },
    { key: "bite", label: "bite(px)", type: "range", min: 0, max: 40, step: 1 }
  ],
  action: { icon: "restaurant", label: "SWALLOW" },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoBlockSwallow.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const duration = Number(p.duration);
    const zoom = Number(p.zoom);
    const bite = Number(p.bite);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden">
          <div class="stage absolute inset-0 flex items-center justify-center">
            <div class="row relative flex items-center gap-6">
              <button class="pred relative w-[160px] h-[160px] border border-outline-variant bg-surface shadow-sm cursor-pointer" type="button"></button>
              <div class="prey relative w-[120px] h-[120px] border border-outline-variant bg-surface shadow-sm"></div>
            </div>
          </div>
        </div>
      `;

      const pred = el.querySelector(".pred") as HTMLButtonElement | null;
      const prey = el.querySelector(".prey") as HTMLElement | null;
      const stage = el.querySelector(".stage") as HTMLElement | null;
      if (!pred || !prey || !stage) return;

      let busy = false;
      const reset = () => {
        busy = false;
        gsap.set(pred, { clearProps: "all", x: 0, y: 0, scale: 1, rotation: 0 });
        gsap.set(prey, { clearProps: "all", opacity: 1, scale: 1, rotation: 0 });
      };

      const swallow = () => {
        if (busy) return;
        busy = true;

        if (reduceMotion) {
          gsap.to(prey, { opacity: 0, duration: 0.15, onComplete: () => reset() });
          return;
        }

        const rs = stage.getBoundingClientRect();
        const a = pred.getBoundingClientRect();
        const b = prey.getBoundingClientRect();
        const dx = b.left + b.width / 2 - (a.left + a.width / 2);
        const dy = b.top + b.height / 2 - (a.top + a.height / 2);

        const tl = gsap.timeline({
          onComplete: () => window.setTimeout(() => reset(), 250)
        });

        // “加速冲过去”
        tl.to(pred, { x: dx, y: dy, duration: duration * 0.38, ease: "power3.in" });
        // “一口咬下”：掐一下 scale + 抖动一下
        tl.to(
          pred,
          {
            scaleX: zoom,
            scaleY: zoom,
            rotation: lerp(-8, 8, Math.random()),
            duration: duration * 0.18,
            ease: "back.out(2)"
          },
          ">-0.02"
        );
        tl.to(
          prey,
          {
            scale: 0.12,
            opacity: 0,
            rotation: lerp(-120, 120, Math.random()),
            x: -bite,
            duration: duration * 0.22,
            ease: "power2.in"
          },
          ">-0.06"
        );
        // “回到原位”
        tl.to(pred, { x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0, duration: duration * 0.32, ease: "power3.out" });
      };

      pred.addEventListener("click", swallow);
      (el as any).__action = swallow;
      (el as any).__cleanup = () => {
        pred.removeEventListener("click", swallow);
      };
    }, el);

    return () => {
      (el as any).__cleanup?.();
      delete (el as any).__action;
      ctx.revert();
    };
  }
};
