import type { Demo } from "../types";
import { gsap } from "../gsap";

function clampInt(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, Math.round(n)));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const demoBlockShatter: Demo = {
  id: "block_shatter",
  title: "BLOCK_SHATTER",
  subtitle: "FRAGMENTS / DISAPPEAR",
  defaults: {
    grid: 6,
    power: 140,
    duration: 0.75,
    rotate: 120
  },
  controls: [
    { key: "grid", label: "grid", type: "range", min: 3, max: 10, step: 1 },
    { key: "power", label: "power(px)", type: "range", min: 40, max: 280, step: 5 },
    { key: "duration", label: "duration", type: "range", min: 0.25, max: 2, step: 0.05 },
    { key: "rotate", label: "rotate(deg)", type: "range", min: 0, max: 360, step: 5 }
  ],
  action: { icon: "warning", label: "SHATTER" },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoBlockShatter.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const grid = clampInt(Number(p.grid), 3, 10);
    const power = Number(p.power);
    const duration = Number(p.duration);
    const rotate = Number(p.rotate);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden">
          <div class="stage absolute inset-0 flex items-center justify-center">
            <button class="block relative w-[180px] h-[180px] border border-outline-variant bg-surface shadow-sm overflow-hidden select-none cursor-pointer" type="button">
              <div class="absolute inset-0 opacity-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zz4=PHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI2FkYjNiMCIvPjwvc3ZnPg==')]"></div>
            </button>
            <div class="pieces absolute inset-0 pointer-events-none"></div>
          </div>
        </div>
      `;

      const stage = el.querySelector(".stage") as HTMLElement | null;
      const block = el.querySelector(".block") as HTMLButtonElement | null;
      const piecesHost = el.querySelector(".pieces") as HTMLElement | null;
      if (!stage || !block || !piecesHost) return;

      const reset = () => {
        piecesHost.innerHTML = "";
        block.style.opacity = "1";
        block.style.transform = "";
      };

      const shatter = () => {
        if (reduceMotion) {
          // 简化：直接淡出再回到初始
          gsap.to(block, { opacity: 0, duration: 0.15, onComplete: () => reset() });
          return;
        }

        const rStage = stage.getBoundingClientRect();
        const r = block.getBoundingClientRect();
        const left = r.left - rStage.left;
        const top = r.top - rStage.top;
        const w = r.width;
        const h = r.height;

        piecesHost.innerHTML = "";
        const pieces: HTMLElement[] = [];
        const sizeW = w / grid;
        const sizeH = h / grid;

        for (let y = 0; y < grid; y++) {
          for (let x = 0; x < grid; x++) {
            const part = document.createElement("div");
            part.className = "piece absolute border border-outline-variant bg-surface";
            part.style.left = `${left + x * sizeW}px`;
            part.style.top = `${top + y * sizeH}px`;
            part.style.width = `${Math.ceil(sizeW) + 0.5}px`;
            part.style.height = `${Math.ceil(sizeH) + 0.5}px`;
            piecesHost.appendChild(part);
            pieces.push(part);
          }
        }

        gsap.to(block, { opacity: 0, duration: 0.08 });

        const cx = left + w / 2;
        const cy = top + h / 2;
        pieces.forEach((part) => {
          const pr = part.getBoundingClientRect();
          const px = pr.left - rStage.left + pr.width / 2;
          const py = pr.top - rStage.top + pr.height / 2;
          const dx = (px - cx) / (w / 2);
          const dy = (py - cy) / (h / 2);
          const mag = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = dx / mag;
          const ny = dy / mag;

          gsap.to(part, {
            x: nx * power + lerp(-18, 18, Math.random()),
            y: ny * power + lerp(-18, 18, Math.random()),
            rotation: lerp(-rotate, rotate, Math.random()),
            opacity: 0,
            scale: lerp(0.9, 1.1, Math.random()),
            duration,
            ease: "power3.out",
            onComplete: () => part.remove()
          });
        });

        // 结束后自动 reset
        window.setTimeout(() => reset(), Math.round(duration * 1000) + 250);
      };

      block.addEventListener("click", shatter);
      (el as any).__action = shatter;
      (el as any).__cleanup = () => {
        block.removeEventListener("click", shatter);
      };
    }, el);

    return () => {
      (el as any).__cleanup?.();
      delete (el as any).__action;
      ctx.revert();
    };
  }
};
