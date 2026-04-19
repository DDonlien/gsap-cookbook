import type { Demo } from "../types";
import { gsap } from "../gsap";

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export const demoFloatingNumbers: Demo = {
  id: "floating_numbers",
  title: "FLOATING_NUMBERS",
  subtitle: "POP / RISE / FADE",
  defaults: {
    duration: 0.75,
    rise: 56,
    spreadX: 26,
    scale: 1.0,
    intervalMs: 650
  },
  controls: [
    { key: "duration", label: "duration", type: "range", min: 0.2, max: 2, step: 0.05 },
    { key: "rise", label: "rise(px)", type: "range", min: 10, max: 140, step: 2 },
    { key: "spreadX", label: "spreadX(px)", type: "range", min: 0, max: 120, step: 2 },
    { key: "scale", label: "scale", type: "range", min: 0.6, max: 1.8, step: 0.05 },
    { key: "intervalMs", label: "previewInterval(ms)", type: "range", min: 250, max: 1600, step: 50 }
  ],
  action: { icon: "add", label: "SPAWN" },
  getCode(params) {
    const duration = Number(params.duration);
    const rise = Number(params.rise);
    const spreadX = Number(params.spreadX);
    const scale = Number(params.scale);
    return `// FLOATING_NUMBERS（数值飘字）
function spawn(text, host) {
  const el = document.createElement("div");
  el.className = "float";
  el.textContent = text;
  host.appendChild(el);

  gsap.fromTo(el, { x: 0, y: 0, opacity: 1, scale: ${scale} }, {
    x: (Math.random()*2-1) * ${spreadX},
    y: -${rise},
    opacity: 0,
    scale: ${scale} * 0.9,
    duration: ${duration},
    ease: "power3.out",
    onComplete: () => el.remove()
  });
}`;
  },
  mount(el, { reduceMotion, params, mode } = {}) {
    const p = { ...(demoFloatingNumbers.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const duration = Number(p.duration);
    const rise = Number(p.rise);
    const spreadX = Number(p.spreadX);
    const scale = Number(p.scale);
    const intervalMs = Math.max(120, Math.round(Number(p.intervalMs)));

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden">
          <div class="host absolute inset-0 pointer-events-none"></div>
          <div class="absolute top-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest text-outline">
            ${mode === "preview" ? "AUTO" : "CLICK STAGE"}
          </div>
        </div>
      `;

      const host = el.querySelector(".host") as HTMLElement | null;
      if (!host) return;

      const samples = ["+10", "+25", "x1.5", "x2", "CRIT!", "LUCKY!"];

      const spawn = (x?: number, y?: number) => {
        if (reduceMotion) return;
        const float = document.createElement("div");
        float.className =
          "float absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xs font-mono font-bold tracking-widest";
        float.textContent = samples[Math.floor(Math.random() * samples.length)];
        float.style.color = Math.random() > 0.7 ? "#1049f1" : "#2d3432";
        host.appendChild(float);

        // 允许从点击位置出发（更像“命中/加成”飘字）
        if (typeof x === "number" && typeof y === "number") {
          const r = host.getBoundingClientRect();
          const px = x - r.left;
          const py = y - r.top;
          float.style.left = `${px}px`;
          float.style.top = `${py}px`;
          float.style.transform = "translate(-50%, -50%)";
        }

        gsap.fromTo(
          float,
          { x: 0, y: 0, opacity: 1, scale },
          {
            x: rand(-spreadX, spreadX),
            y: -rise,
            opacity: 0,
            scale: scale * 0.9,
            duration,
            ease: "power3.out",
            onComplete: () => float.remove()
          }
        );
      };

      const onStage = (e: MouseEvent) => {
        spawn(e.clientX, e.clientY);
      };
      el.addEventListener("click", onStage);

      let timer = 0;
      if (mode === "preview" && !reduceMotion) {
        timer = window.setInterval(() => spawn(), intervalMs);
      }

      (el as any).__cleanup = () => {
        el.removeEventListener("click", onStage);
        if (timer) window.clearInterval(timer);
      };
      (el as any).__action = () => spawn();
    }, el);

    return () => {
      (el as any).__cleanup?.();
      delete (el as any).__action;
      ctx.revert();
    };
  }
};
