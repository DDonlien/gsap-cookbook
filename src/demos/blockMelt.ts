import type { Demo } from "../types";
import { gsap } from "../gsap";

function clampInt(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, Math.round(n)));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function rand(min: number, max: number) {
  return lerp(min, max, Math.random());
}

type Seed = {
  x: number;
  y: number;
  start: number;
};

function dist(ax: number, ay: number, bx: number, by: number) {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.sqrt(dx * dx + dy * dy);
}

export const demoBlockMelt: Demo = {
  id: "block_melt",
  title: "BLOCK_MELT",
  subtitle: "MULTI-POINT / BURN / DISSOLVE",
  defaults: {
    duration: 1.05,
    grid: 20,
    seeds: 4,
    spread: 0.22,
    jitter: 0.06
  },
  controls: [
    { key: "duration", label: "duration", type: "range", min: 0.35, max: 2.2, step: 0.05 },
    { key: "grid", label: "grid", type: "range", min: 8, max: 28, step: 1 },
    { key: "seeds", label: "seeds", type: "range", min: 1, max: 7, step: 1 },
    { key: "spread", label: "spread", type: "range", min: 0.08, max: 0.45, step: 0.01 },
    { key: "jitter", label: "jitter", type: "range", min: 0, max: 0.2, step: 0.01 }
  ],
  action: { icon: "auto_awesome", label: "DISSOLVE" },
  getCode(params) {
    const duration = Number(params.duration ?? 1.05);
    const grid = clampInt(Number(params.grid ?? 20), 8, 28);
    const seeds = clampInt(Number(params.seeds ?? 4), 1, 7);
    const spread = Number(params.spread ?? 0.22);
    const jitter = Number(params.jitter ?? 0.06);

    return `const cells = [];
for (let row = 0; row < ${grid}; row++) {
  for (let col = 0; col < ${grid}; col++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cells.push({ cell, row, col });
    overlay.appendChild(cell);
  }
}

const seeds = Array.from({ length: ${seeds} }, () => ({
  x: gsap.utils.random(0, ${grid - 1}),
  y: gsap.utils.random(0, ${grid - 1}),
  start: gsap.utils.random(0, ${duration} * 0.18)
}));

cells.forEach(({ cell, row, col }) => {
  const nearest = seeds.reduce((best, seed) => {
    const dx = col - seed.x;
    const dy = row - seed.y;
    return Math.min(best, Math.hypot(dx, dy) * ${spread} + seed.start);
  }, Infinity);

  gsap.to(cell, {
    autoAlpha: 0,
    scale: gsap.utils.random(0.15, 0.65),
    x: gsap.utils.random(-3, 3),
    y: gsap.utils.random(-3, 3),
    duration: ${duration} * gsap.utils.random(0.18, 0.3),
    delay: nearest + gsap.utils.random(0, ${jitter}),
    ease: "power2.out"
  });
});`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoBlockMelt.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const duration = Number(p.duration);
    const grid = clampInt(Number(p.grid), 8, 28);
    const seedsCount = clampInt(Number(p.seeds), 1, 7);
    const spread = Number(p.spread);
    const jitter = Number(p.jitter);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden">
          <div class="stage absolute inset-0 flex items-center justify-center">
            <div class="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-[0.28em] text-outline text-center">
              CLICK TO DISSOLVE<br/>CLICK AGAIN TO RESET
            </div>
            <button class="block relative w-[180px] h-[180px] border-[0.5px] border-outline-variant bg-surface shadow-sm cursor-pointer select-none" type="button" aria-label="Dissolve block">
            </button>
            <div class="cells absolute inset-0 pointer-events-none"></div>
            <div class="burns absolute inset-0 pointer-events-none"></div>
          </div>
        </div>
      `;

      const stage = el.querySelector(".stage") as HTMLElement | null;
      const block = el.querySelector(".block") as HTMLButtonElement | null;
      const cellsHost = el.querySelector(".cells") as HTMLElement | null;
      const burnsHost = el.querySelector(".burns") as HTMLElement | null;
      if (!stage || !block || !cellsHost || !burnsHost) return;

      let busy = false;
      let isMelted = false;

      const reset = () => {
        isMelted = false;
        cellsHost.innerHTML = "";
        burnsHost.innerHTML = "";
        gsap.set(block, {
          clearProps: "all",
          autoAlpha: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          filter: "none",
          backgroundColor: "var(--color-surface, #f9f9f7)"
        });
      };

      const melt = () => {
        if (busy) return;
        if (isMelted) {
          reset();
          return;
        }
        
        busy = true;
        isMelted = true;

        if (reduceMotion) {
          gsap.to(block, {
            autoAlpha: 0,
            duration: 0.18,
            ease: "power1.in",
            onComplete: () => {
              busy = false;
            }
          });
          return;
        }

        const stageRect = stage.getBoundingClientRect();
        const rect = block.getBoundingClientRect();
        const left = rect.left - stageRect.left;
        const top = rect.top - stageRect.top;
        const cellSize = rect.width / grid;

        cellsHost.innerHTML = "";
        burnsHost.innerHTML = "";

        const seeds: Seed[] = Array.from({ length: seedsCount }, () => ({
          x: rand(2, grid - 3),
          y: rand(2, grid - 3),
          start: rand(0, duration * 0.18)
        }));

        seeds.forEach((seed) => {
          const burn = document.createElement("div");
          const size = cellSize * rand(1.8, 3.2);
          burn.className = "absolute rounded-full";
          burn.style.left = `${left + seed.x * cellSize - size / 2}px`;
          burn.style.top = `${top + seed.y * cellSize - size / 2}px`;
          burn.style.width = `${size}px`;
          burn.style.height = `${size}px`;
          burn.style.background =
            "radial-gradient(circle, rgba(45,52,50,0.30) 0%, rgba(45,52,50,0.18) 38%, rgba(45,52,50,0.08) 56%, rgba(45,52,50,0) 74%)";
          burn.style.opacity = "0";
          burnsHost.appendChild(burn);

          gsap.fromTo(
            burn,
            { scale: 0.25, opacity: 0 },
            {
              scale: rand(2.2, 3.8),
              opacity: rand(0.2, 0.42),
              duration: duration * rand(0.32, 0.52),
              delay: seed.start,
              ease: "power2.out"
            }
          );
          gsap.to(burn, {
            opacity: 0,
            duration: duration * rand(0.2, 0.32),
            delay: seed.start + duration * rand(0.36, 0.58),
            ease: "power1.out",
            onComplete: () => burn.remove()
          });
        });

        for (let row = 0; row < grid; row++) {
          for (let col = 0; col < grid; col++) {
            const piece = document.createElement("div");
            piece.className = "absolute bg-surface";
            piece.style.left = `${left + col * cellSize}px`;
            piece.style.top = `${top + row * cellSize}px`;
            piece.style.width = `${cellSize + 0.6}px`;
            piece.style.height = `${cellSize + 0.6}px`;
            cellsHost.appendChild(piece);

            let nearest = Number.POSITIVE_INFINITY;
            for (const seed of seeds) {
              nearest = Math.min(nearest, dist(col, row, seed.x, seed.y) * spread + seed.start);
            }
            const delay = nearest + rand(0, jitter);

            gsap.to(piece, {
              autoAlpha: 0,
              scale: rand(0.14, 0.62),
              x: rand(-3, 3),
              y: rand(-3, 3),
              rotation: rand(-8, 8),
              duration: duration * rand(0.18, 0.3),
              delay,
              ease: "power2.out",
              onComplete: () => piece.remove()
            });
          }
        }

        gsap.to(block, {
          autoAlpha: 0,
          filter: "brightness(0.96)",
          duration: duration * 0.18,
          delay: duration * 0.04,
          ease: "power1.out"
        });

        gsap.delayedCall(duration + 0.9, () => {
          busy = false;
        });
      };

      stage.addEventListener("click", melt);
      (el as any).__action = melt;
      (el as any).__cleanup = () => {
        stage.removeEventListener("click", melt);
      };
    }, el);

    return () => {
      (el as any).__cleanup?.();
      delete (el as any).__action;
      ctx.revert();
    };
  }
};
