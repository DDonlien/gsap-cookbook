import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoHoverTilt: Demo = {
  id: "hover_tilt",
  title: "HOVER_TILT",
  subtitle: "MOUSE TILT / GLOW",
  tags: { playback: ["interactive"], type: ["ui", "hover"], related: ["mouse"] },
  defaults: {
    maxTilt: 14,
    glow: 0.35,
    duration: 0.25
  },
  controls: [
    { key: "maxTilt", label: "maxTilt(deg)", type: "range", min: 0, max: 30, step: 1 },
    { key: "glow", label: "glow", type: "range", min: 0, max: 1, step: 0.05 },
    { key: "duration", label: "duration", type: "range", min: 0, max: 0.8, step: 0.05 }
  ],
  getCode(params) {
    const maxTilt = Number(params.maxTilt);
    const glow = Number(params.glow);
    const duration = Number(params.duration);
    return `// HOVER_TILT（最初版：角落高光 + 轻微错位）
const card = document.querySelector(".card");
const glowEl = document.querySelector(".glow");

card.addEventListener("pointermove", (e) => {
  const r = card.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  const rx = (0.5 - py) * ${maxTilt};
  const ry = (px - 0.5) * ${maxTilt};
  gsap.to(card, { rotationX: rx, rotationY: ry, duration: ${duration}, ease: "power2.out" });
  gsap.to(glowEl, {
    opacity: ${glow},
    xPercent: (px - 0.5) * 30,
    yPercent: (py - 0.5) * 30,
    duration: ${duration}
  });
});

card.addEventListener("pointerleave", () => {
  gsap.to(card, { rotationX: 0, rotationY: 0, duration: ${duration}, ease: "power3.out" });
  gsap.to(glowEl, { opacity: 0, xPercent: 0, yPercent: 0, duration: ${duration} });
});`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoHoverTilt.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const maxTilt = Number(p.maxTilt);
    const glow = Number(p.glow);
    const duration = Number(p.duration);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-8 [perspective:900px]">
          <div class="card relative w-[180px] h-[240px] border border-outline-variant bg-surface shadow-sm [transform-style:preserve-3d] overflow-hidden">
            <div class="absolute inset-0 pointer-events-none glow opacity-0 bg-gradient-to-br from-primary/40 via-transparent to-transparent"></div>
            <div class="absolute top-2 left-2 text-[10px] font-mono tracking-widest text-outline">HOVER</div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-3xl font-bold tracking-tight">J</div>
            </div>
          </div>
        </div>
      `;

      const card = el.querySelector(".card") as HTMLElement | null;
      const glowEl = el.querySelector(".glow") as HTMLElement | null;
      if (!card || !glowEl) return;

      if (reduceMotion) return;

      const onMove = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * maxTilt;
        const ry = (px - 0.5) * maxTilt;
        gsap.to(card, { rotationX: rx, rotationY: ry, duration, ease: "power2.out" });
        gsap.to(glowEl, {
          opacity: glow,
          xPercent: (px - 0.5) * 30,
          yPercent: (py - 0.5) * 30,
          duration
        });
      };
      const onLeave = () => {
        gsap.to(card, { rotationX: 0, rotationY: 0, duration, ease: "power3.out" });
        gsap.to(glowEl, { opacity: 0, xPercent: 0, yPercent: 0, duration });
      };

      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
      (card as any).__cleanup = () => {
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
      };
    }, el);

    return () => {
      const card = el.querySelector(".card") as any;
      card?.__cleanup?.();
      ctx.revert();
    };
  }
};

