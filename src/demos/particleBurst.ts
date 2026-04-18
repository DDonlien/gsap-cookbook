import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoParticleBurst: Demo = {
  id: "particle_burst",
  title: "PARTICLE_BURST",
  subtitle: "BURST / SPARKS",
  defaults: {
    count: 18,
    distance: 140,
    duration: 0.8,
    size: 6
  },
  controls: [
    { key: "count", label: "count", type: "range", min: 6, max: 60, step: 1 },
    { key: "distance", label: "distance(px)", type: "range", min: 40, max: 260, step: 5 },
    { key: "duration", label: "duration", type: "range", min: 0.2, max: 2, step: 0.05 },
    { key: "size", label: "size(px)", type: "range", min: 2, max: 16, step: 1 }
  ],
  getCode(params) {
    const count = Number(params.count);
    const distance = Number(params.distance);
    const duration = Number(params.duration);
    const size = Number(params.size);
    return `// PARTICLE_BURST
const c = document.querySelector(".container");
for (let i = 0; i < ${count}; i++) {
  const p = document.createElement("div");
  p.className = "p";
  c.appendChild(p);
  const a = Math.random() * Math.PI * 2;
  const d = ${distance} * (0.5 + Math.random() * 0.5);
  gsap.fromTo(p, { x: 0, y: 0, scale: 1, opacity: 1 }, {
    x: Math.cos(a) * d,
    y: Math.sin(a) * d,
    scale: 0,
    opacity: 0,
    duration: ${duration},
    ease: "power3.out",
    onComplete: () => p.remove()
  });
}`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoParticleBurst.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const count = Math.max(1, Math.round(Number(p.count)));
    const distance = Number(p.distance);
    const duration = Number(p.duration);
    const size = Number(p.size);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-8">
          <div class="container relative w-[240px] h-[240px] border border-outline-variant bg-surface flex items-center justify-center overflow-hidden">
            <div class="text-[10px] font-mono uppercase tracking-widest text-outline absolute top-2 left-2">BURST</div>
            <div class="core w-10 h-10 bg-primary"></div>
          </div>
        </div>
      `;

      const container = el.querySelector(".container") as HTMLElement | null;
      if (!container) return;

      if (reduceMotion) return;

      for (let i = 0; i < count; i++) {
        const dot = document.createElement("div");
        dot.className = "p absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2";
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.background = i % 3 === 0 ? "#1049f1" : i % 3 === 1 ? "#2d3432" : "#adb3b0";
        container.appendChild(dot);

        const a = Math.random() * Math.PI * 2;
        const d = distance * (0.5 + Math.random() * 0.5);
        gsap.fromTo(
          dot,
          { x: 0, y: 0, scale: 1, opacity: 1 },
          {
            x: Math.cos(a) * d,
            y: Math.sin(a) * d,
            scale: 0,
            opacity: 0,
            duration,
            ease: "power3.out",
            onComplete: () => dot.remove()
          }
        );
      }
      gsap.fromTo(
        ".core",
        { scale: 0.9 },
        { scale: 1.05, duration: 0.12, yoyo: true, repeat: 1, ease: "power2.out" }
      );
    }, el);

    return () => ctx.revert();
  }
};
