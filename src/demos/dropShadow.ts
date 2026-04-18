import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoDropShadow: Demo = {
  id: "drop_shadow",
  title: "DROP_SHADOW",
  subtitle: "TILT / PROJECTED SHADOW",
  defaults: {
    maxTilt: 14,
    maxOffset: 34,
    spread: 18,
    blur: 18,
    opacity: 0.35,
    scale: 1.05,
    follow: "inverse",
    exaggeration: 1.2,
    duration: 0.22
  },
  controls: [
    { key: "maxTilt", label: "maxTilt(deg)", type: "range", min: 0, max: 30, step: 1 },
    { key: "maxOffset", label: "maxOffset(px)", type: "range", min: 0, max: 100, step: 1 },
    { key: "spread", label: "spread(px)", type: "range", min: 0, max: 80, step: 1 },
    { key: "blur", label: "blur(px)", type: "range", min: 0, max: 50, step: 1 },
    { key: "opacity", label: "opacity", type: "range", min: 0, max: 0.8, step: 0.05 },
    { key: "scale", label: "scale", type: "range", min: 0.9, max: 1.3, step: 0.01 },
    {
      key: "follow",
      label: "follow",
      type: "select",
      options: [
        { label: "inverse(更像投影)", value: "inverse" },
        { label: "follow(跟随鼠标)", value: "follow" }
      ]
    },
    { key: "exaggeration", label: "exaggeration", type: "range", min: 0.5, max: 3, step: 0.05 },
    { key: "duration", label: "duration", type: "range", min: 0, max: 0.8, step: 0.05 }
  ],
  getCode(params) {
    const maxTilt = Number(params.maxTilt);
    const maxOffset = Number(params.maxOffset);
    const spread = Number(params.spread);
    const blur = Number(params.blur);
    const opacity = Number(params.opacity);
    const scale = Number(params.scale);
    const follow = String(params.follow);
    const exaggeration = Number(params.exaggeration);
    const duration = Number(params.duration);
    return `// DROP_SHADOW（投影错位阴影）
const card = document.querySelector(".card");
const shadow = document.querySelector(".shadow");
shadow.style.inset = "-${spread}px";
shadow.style.filter = "blur(${blur}px)";
shadow.style.opacity = "${opacity}";

// skew 与 spread/blur 有关：spread 越大“投影面积”越大，skew 才会更明显，但整体保持克制
const spreadFactor = Math.min(1, ${spread} / (${spread} + ${blur} + 24)); // 0..1
const skewK = 0.18 * spreadFactor; // 0..0.18（很轻）

card.addEventListener("pointermove", (e) => {
  const r = card.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  const rx = (0.5 - py) * ${maxTilt};
  const ry = (px - 0.5) * ${maxTilt};
  const dir = "${follow}" === "inverse" ? -1 : 1;
  const sx = (px - 0.5) * ${maxOffset} * dir * ${exaggeration};
  const sy = (py - 0.5) * ${maxOffset} * dir * ${exaggeration};
  gsap.to(card, { rotationX: rx, rotationY: ry, duration: ${duration}, ease: "power2.out" });
  // 关键：shadow 也跟随 tilt 做一点 3D/倾斜变形（避免永远“垂直屏幕”）
  gsap.to(shadow, {
    x: sx,
    y: sy,
    scale: ${scale},
    opacity: ${opacity},
    rotationX: rx * 0.22,
    rotationY: ry * 0.22,
    skewX: ry * skewK,
    skewY: -rx * skewK,
    duration: ${duration},
    ease: "power2.out"
  });
});

card.addEventListener("pointerleave", () => {
  gsap.to(card, { rotationX: 0, rotationY: 0, duration: ${duration}, ease: "power3.out" });
  gsap.to(shadow, {
    x: 0,
    y: 0,
    scale: 1,
    opacity: 0,
    rotationX: 0,
    rotationY: 0,
    skewX: 0,
    skewY: 0,
    duration: ${duration},
    ease: "power3.out"
  });
});`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoDropShadow.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const maxTilt = Number(p.maxTilt);
    const maxOffset = Number(p.maxOffset);
    const spread = Number(p.spread);
    const blur = Number(p.blur);
    const opacity = Number(p.opacity);
    const scale = Number(p.scale);
    const follow = String(p.follow);
    const exaggeration = Number(p.exaggeration);
    const duration = Number(p.duration);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-8 [perspective:900px]">
          <div class="wrap relative w-[200px] h-[260px]">
            <div class="shadow absolute bg-on-surface opacity-0" style="filter: blur(${blur}px);"></div>
            <div class="card relative w-full h-full border border-outline-variant bg-surface shadow-sm overflow-hidden [transform-style:preserve-3d]">
              <div class="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNhZGIzYjAiLz48L3N2Zz4=')]"></div>
              <div class="absolute top-2 left-2 text-[10px] font-mono tracking-widest text-outline">SHADOW</div>
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="text-3xl font-bold tracking-tight">J</div>
              </div>
            </div>
          </div>
        </div>
      `;

      const card = el.querySelector(".card") as HTMLElement | null;
      const shadow = el.querySelector(".shadow") as HTMLElement | null;
      if (!card || !shadow) return;

      shadow.style.inset = `${-spread}px`;
      shadow.style.filter = `blur(${blur}px)`;
      shadow.style.transformOrigin = "50% 50%";
      const spreadFactor = Math.min(1, spread / (spread + blur + 24)); // 0..1
      const skewK = 0.18 * spreadFactor; // 0..0.18（轻微、自然）

      if (reduceMotion) return;

      const onMove = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * maxTilt;
        const ry = (px - 0.5) * maxTilt;
        const dir = follow === "inverse" ? -1 : 1;
        const sx = (px - 0.5) * maxOffset * dir * exaggeration;
        const sy = (py - 0.5) * maxOffset * dir * exaggeration;

        gsap.to(card, { rotationX: rx, rotationY: ry, duration, ease: "power2.out" });
        gsap.to(shadow, {
          x: sx,
          y: sy,
          scale,
          opacity,
          rotationX: rx * 0.22,
          rotationY: ry * 0.22,
          skewX: ry * skewK,
          skewY: -rx * skewK,
          duration,
          ease: "power2.out"
        });
      };
      const onLeave = () => {
        gsap.to(card, { rotationX: 0, rotationY: 0, duration, ease: "power3.out" });
        gsap.to(shadow, {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 0,
          rotationX: 0,
          rotationY: 0,
          skewX: 0,
          skewY: 0,
          duration,
          ease: "power3.out"
        });
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
