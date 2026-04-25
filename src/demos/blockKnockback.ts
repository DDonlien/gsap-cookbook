import type { Demo } from "../types";
import { gsap } from "../gsap";

function clampInt(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, Math.round(n)));
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const demoBlockKnockback: Demo = {
  id: "block_knockback",
  title: "BLOCK_KNOCKBACK",
  subtitle: "DASH / SHATTER",
  defaults: {
    clone: "false",
    grid: 6,
    power: 140,
    duration: 0.6
  },
  controls: [
    {
      key: "clone",
      label: "clone attacker",
      type: "select",
      options: [
        { label: "Move(本体冲刺)", value: "false" },
        { label: "Clone(克隆冲刺)", value: "true" }
      ]
    },
    { key: "grid", label: "shatter grid", type: "range", min: 3, max: 10, step: 1 },
    { key: "power", label: "shatter power", type: "range", min: 40, max: 280, step: 5 },
    { key: "duration", label: "duration", type: "range", min: 0.25, max: 2, step: 0.05 }
  ],
  action: { icon: "sports_mma", label: "HIT" },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoBlockKnockback.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const cloneAttacker = p.clone === "true";
    const grid = clampInt(Number(p.grid), 3, 10);
    const power = Number(p.power);
    const duration = Number(p.duration);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden">
          <div class="stage absolute inset-0 flex items-center justify-center gap-16">
            <button class="a relative w-[100px] h-[100px] border border-outline-variant bg-surface shadow-sm cursor-pointer z-10 flex-shrink-0" type="button" aria-label="Hit block"></button>
            <div class="b relative w-[100px] h-[100px] border border-outline-variant bg-surface shadow-sm flex-shrink-0"></div>
            <div class="pieces absolute inset-0 pointer-events-none z-20"></div>
            <div class="clones absolute inset-0 pointer-events-none z-10"></div>
          </div>
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 pointer-events-none">
            <div class="w-10 h-10 flex items-center justify-center border-[0.5px] border-outline-variant bg-surface text-on-surface">
              <span class="material-symbols-outlined text-base">sports_mma</span>
            </div>
            <div class="text-[10px] font-mono uppercase tracking-widest text-outline">CLICK LEFT BLOCK</div>
          </div>
        </div>
      `;

      const a = el.querySelector(".a") as HTMLButtonElement | null;
      const b = el.querySelector(".b") as HTMLElement | null;
      const stage = el.querySelector(".stage") as HTMLElement | null;
      const piecesHost = el.querySelector(".pieces") as HTMLElement | null;
      const clonesHost = el.querySelector(".clones") as HTMLElement | null;
      if (!a || !b || !stage || !piecesHost || !clonesHost) return;

      let busy = false;
      const reset = () => {
        busy = false;
        piecesHost.innerHTML = "";
        clonesHost.innerHTML = "";
        gsap.set(a, { clearProps: "all", x: 0, opacity: 1 });
        gsap.set(b, { clearProps: "all", x: 0, opacity: 1, scale: 1 });
        gsap.set(stage, { clearProps: "all", x: 0 });
      };

      const hit = () => {
        if (busy) return;
        busy = true;

        if (reduceMotion) {
          gsap.to(b, { opacity: 0, duration: 0.15, yoyo: true, repeat: 1, onComplete: () => reset() });
          return;
        }

        const rStage = stage.getBoundingClientRect();
        const rA = a.getBoundingClientRect();
        const rB = b.getBoundingClientRect();

        const dist = rB.left - rA.left;
        const bLeft = rB.left - rStage.left;
        const bTop = rB.top - rStage.top;
        const w = rB.width;
        const h = rB.height;

        const tl = gsap.timeline({ onComplete: () => window.setTimeout(() => reset(), 800) });

        let attackerEl: HTMLElement = a;
        
        if (cloneAttacker) {
          const clone = a.cloneNode(true) as HTMLElement;
          clone.className = "absolute border border-outline-variant bg-surface shadow-sm";
          clone.style.width = `${rA.width}px`;
          clone.style.height = `${rA.height}px`;
          clone.style.left = `${rA.left - rStage.left}px`;
          clone.style.top = `${rA.top - rStage.top}px`;
          clonesHost.appendChild(clone);
          attackerEl = clone;
          
          tl.to(a, { filter: "brightness(0.9)", duration: 0.1 }, 0);
        }

        // Attacker dashes
        tl.to(attackerEl, { x: dist, duration: duration * 0.3, ease: "power3.in" }, 0);
        tl.to(attackerEl, { scale: 0.96, duration: 0.06, yoyo: true, repeat: 1, ease: "power2.out" }, "<");

        // Impact & Shatter
        tl.add(() => {
          b.style.opacity = "0";

          piecesHost.innerHTML = "";
          const sizeW = w / grid;
          const sizeH = h / grid;
          const cx = bLeft + w / 2;
          const cy = bTop + h / 2;

          for (let y = 0; y < grid; y++) {
            for (let x = 0; x < grid; x++) {
              const part = document.createElement("div");
              part.className = "piece absolute border border-outline-variant bg-surface";
              part.style.left = `${bLeft + x * sizeW}px`;
              part.style.top = `${bTop + y * sizeH}px`;
              part.style.width = `${Math.ceil(sizeW) + 0.5}px`;
              part.style.height = `${Math.ceil(sizeH) + 0.5}px`;
              piecesHost.appendChild(part);

              const px = bLeft + x * sizeW + sizeW / 2;
              const py = bTop + y * sizeH + sizeH / 2;
              
              // Angle = 0 (Right direction explosion)
              const bx = 1;
              const by = 0;
              const spreadY = (py - cy) / (h / 2);
              
              let nx = bx + lerp(-0.2, 0.2, Math.random());
              let ny = by + spreadY * 0.8 + lerp(-0.2, 0.2, Math.random());
              
              const mag = Math.sqrt(nx * nx + ny * ny) || 1;
              nx /= mag;
              ny /= mag;

              gsap.to(part, {
                x: nx * power + lerp(-10, 10, Math.random()),
                y: ny * power + lerp(-10, 10, Math.random()),
                rotation: lerp(-120, 120, Math.random()),
                opacity: 0,
                scale: lerp(0.8, 1.2, Math.random()),
                duration: duration * 1.2,
                ease: "power3.out",
                onComplete: () => part.remove()
              });
            }
          }
        });

        // Impact camera shake
        tl.fromTo(stage, { x: 0 }, { x: 8, duration: 0.06, yoyo: true, repeat: 3, ease: "power2.out" }, "<");

        // Attacker reaction
        if (cloneAttacker) {
          // Clone shrinks / dissipates
          tl.to(attackerEl, { scale: 0, opacity: 0, duration: duration * 0.2, ease: "back.in(2)" }, ">");
          tl.to(a, { filter: "none", duration: 0.2 }, "<");
        } else {
          // Original attacker bounces back
          tl.to(attackerEl, { x: 0, duration: duration * 0.4, ease: "power3.out" }, ">+0.1");
        }
      };

      a.addEventListener("click", hit);
      (el as any).__action = hit;
      (el as any).__cleanup = () => {
        a.removeEventListener("click", hit);
      };
    }, el);

    return () => {
      (el as any).__cleanup?.();
      delete (el as any).__action;
      ctx.revert();
    };
  }
};