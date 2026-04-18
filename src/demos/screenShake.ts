import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoScreenShake: Demo = {
  id: "screen_shake",
  title: "SCREEN_SHAKE",
  subtitle: "HIT / SHAKE",
  tags: { playback: ["once"], type: ["feedback", "shake"], related: [] },
  defaults: {
    intensity: 12,
    shakes: 10,
    duration: 0.45
  },
  controls: [
    { key: "intensity", label: "intensity(px)", type: "range", min: 0, max: 30, step: 1 },
    { key: "shakes", label: "shakes", type: "range", min: 2, max: 30, step: 1 },
    { key: "duration", label: "duration", type: "range", min: 0.1, max: 1, step: 0.05 }
  ],
  getCode(params) {
    const intensity = Number(params.intensity);
    const shakes = Number(params.shakes);
    const duration = Number(params.duration);
    return `// SCREEN_SHAKE
const frame = document.querySelector(".frame");
const tl = gsap.timeline();
for (let i = 0; i < ${shakes}; i++) {
  tl.to(frame, {
    x: (Math.random() * 2 - 1) * ${intensity},
    y: (Math.random() * 2 - 1) * ${intensity},
    duration: ${duration} / ${shakes},
    ease: "none"
  });
}
tl.to(frame, { x: 0, y: 0, duration: 0.12, ease: "power2.out" });`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoScreenShake.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const intensity = Number(p.intensity);
    const shakes = Math.max(2, Math.round(Number(p.shakes)));
    const duration = Number(p.duration);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-8">
          <div class="frame w-[220px] h-[220px] border border-outline-variant bg-surface flex items-center justify-center">
            <div class="text-center">
              <div class="text-[10px] font-mono uppercase tracking-widest text-outline mb-2">HIT</div>
              <div class="text-3xl font-bold tracking-tight">✕</div>
            </div>
          </div>
        </div>
      `;

      const frame = el.querySelector(".frame") as HTMLElement | null;
      if (!frame) return;

      if (reduceMotion || intensity === 0) return;

      const tl = gsap.timeline();
      for (let i = 0; i < shakes; i++) {
        tl.to(frame, {
          x: (Math.random() * 2 - 1) * intensity,
          y: (Math.random() * 2 - 1) * intensity,
          duration: duration / shakes,
          ease: "none"
        });
      }
      tl.to(frame, { x: 0, y: 0, duration: 0.12, ease: "power2.out" });
    }, el);

    return () => ctx.revert();
  }
};

