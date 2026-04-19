import type { Demo } from "../types";
import { gsap } from "../gsap";

function clampInt(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, Math.round(n)));
}

function format(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

type Op = "add" | "sub";

export const demoNumberTransferParticles: Demo = {
  id: "number_transfer_particles",
  title: "NUMBER_TRANSFER",
  subtitle: "PARTICLES → UPDATE",
  defaults: {
    left: 1200,
    right: 250,
    amount: 120,
    op: "add",
    particleCount: 22,
    duration: 0.7,
    spread: 26,
    size: 6
  },
  controls: [
    { key: "left", label: "left", type: "range", min: 0, max: 9999, step: 1 },
    { key: "right", label: "right", type: "range", min: 0, max: 9999, step: 1 },
    { key: "amount", label: "amount", type: "range", min: 1, max: 2000, step: 1 },
    {
      key: "op",
      label: "op",
      type: "select",
      options: [
        { label: "add(加到右侧)", value: "add" },
        { label: "sub(从右侧扣)", value: "sub" }
      ]
    },
    { key: "particleCount", label: "particleCount", type: "range", min: 6, max: 80, step: 1 },
    { key: "duration", label: "duration", type: "range", min: 0.2, max: 2.2, step: 0.05 },
    { key: "spread", label: "spread(px)", type: "range", min: 0, max: 120, step: 2 },
    { key: "size", label: "size(px)", type: "range", min: 2, max: 16, step: 1 }
  ],
  action: { icon: "swap_horiz", label: "TRANSFER" },
  getCode(params) {
    const particleCount = Number(params.particleCount);
    const duration = Number(params.duration);
    const spread = Number(params.spread);
    const size = Number(params.size);
    return `// NUMBER_TRANSFER（左侧数字扣减为粒子，飞到右侧后触发加减）
const stage = document.querySelector(".stage");
const fromEl = document.querySelector(".num-left");
const toEl = document.querySelector(".num-right");

const rStage = stage.getBoundingClientRect();
const a = fromEl.getBoundingClientRect();
const b = toEl.getBoundingClientRect();
const from = { x: a.left + a.width/2 - rStage.left, y: a.top + a.height/2 - rStage.top };
const to = { x: b.left + b.width/2 - rStage.left, y: b.top + b.height/2 - rStage.top };

for (let i = 0; i < ${particleCount}; i++) {
  const p = document.createElement("div");
  p.className = "p";
  p.style.width = "${size}px";
  p.style.height = "${size}px";
  stage.appendChild(p);
  gsap.fromTo(p, { x: from.x, y: from.y, opacity: 1, scale: 1 }, {
    x: to.x + (Math.random()*2-1) * ${spread},
    y: to.y + (Math.random()*2-1) * ${spread},
    opacity: 0,
    scale: 0,
    duration: ${duration},
    ease: "power3.inOut",
    onComplete: () => p.remove()
  });
}`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoNumberTransferParticles.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const left0 = Number(p.left);
    const right0 = Number(p.right);
    const amount = Number(p.amount);
    const op = String(p.op) as Op;
    const particleCount = clampInt(Number(p.particleCount), 6, 80);
    const duration = Number(p.duration);
    const spread = Number(p.spread);
    const size = Number(p.size);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden p-6">
          <div class="stage absolute inset-0 overflow-hidden">
            <div class="num-left absolute left-6 top-6 text-5xl font-black tracking-tight tabular-nums text-on-surface">${format(
              left0
            )}</div>
            <div class="num-right absolute right-6 bottom-14 text-5xl font-black tracking-tight tabular-nums text-on-surface">${format(
              right0
            )}</div>
          </div>
        </div>
      `;

      const stage = el.querySelector(".stage") as HTMLElement | null;
      const leftEl = el.querySelector(".num-left") as HTMLElement | null;
      const rightEl = el.querySelector(".num-right") as HTMLElement | null;
      if (!stage || !leftEl || !rightEl) return;

      let left = left0;
      let right = right0;
      leftEl.textContent = format(left);
      rightEl.textContent = format(right);

      const flash = (target: HTMLElement, color: string) => {
        if (reduceMotion) return;
        gsap.fromTo(target, { color: "#2d3432" }, { color, duration: 0.12, yoyo: true, repeat: 1, repeatDelay: 0.06 });
      };

      const animateNumberTo = (target: HTMLElement, from: number, to: number) => {
        if (reduceMotion) {
          target.textContent = format(to);
          return;
        }
        const obj = { v: from };
        gsap.to(obj, {
          v: to,
          duration: 0.5,
          ease: "power3.out",
          onUpdate: () => (target.textContent = format(obj.v)),
          onComplete: () => (target.textContent = format(to))
        });
      };

      const spawnParticles = () => {
        if (reduceMotion) return;
        const rStage = stage.getBoundingClientRect();
        const a = leftEl.getBoundingClientRect();
        const b = rightEl.getBoundingClientRect();
        const from = { x: a.left + a.width / 2 - rStage.left, y: a.top + a.height / 2 - rStage.top };
        const to = { x: b.left + b.width / 2 - rStage.left, y: b.top + b.height / 2 - rStage.top };

        for (let i = 0; i < particleCount; i++) {
          const dot = document.createElement("div");
          dot.className = "p absolute rounded-full";
          dot.style.width = `${size}px`;
          dot.style.height = `${size}px`;
          dot.style.background = i % 3 === 0 ? "#1049f1" : i % 3 === 1 ? "#2d3432" : "#adb3b0";
          stage.appendChild(dot);

          const sx = from.x + lerp(-8, 8, Math.random());
          const sy = from.y + lerp(-8, 8, Math.random());
          const tx = to.x + lerp(-spread, spread, Math.random());
          const ty = to.y + lerp(-spread, spread, Math.random());

          gsap.fromTo(
            dot,
            { x: sx, y: sy, opacity: 1, scale: 1 },
            {
              x: tx,
              y: ty,
              opacity: 0,
              scale: 0,
              duration,
              ease: "power3.inOut",
              delay: i * 0.01,
              onComplete: () => dot.remove()
            }
          );
        }
      };

      let busy = false;
      const onTransfer = () => {
        if (busy) return;
        const transferred = Math.min(left, amount);
        if (transferred <= 0) return;
        busy = true;

        spawnParticles();
        const nextLeft = Math.max(0, left - transferred);
        const nextRight = op === "add" ? right + transferred : Math.max(0, right - transferred);

        animateNumberTo(leftEl, left, nextLeft);
        flash(leftEl, "#b3261e");
        if (!reduceMotion) {
          gsap.fromTo(leftEl, { scale: 1 }, { scale: 0.9, duration: 0.08, yoyo: true, repeat: 1, ease: "power2.out" });
        }

        // 数字变化稍微延迟到“粒子到达”
        window.setTimeout(() => {
          animateNumberTo(rightEl, right, nextRight);
          flash(rightEl, op === "add" ? "#1049f1" : "#b3261e");
          // 轻微命中抖动
          if (!reduceMotion) {
            gsap.fromTo(stage, { x: 0 }, { x: 10, duration: 0.08, yoyo: true, repeat: 3, ease: "power2.out" });
          }
          left = nextLeft;
          right = nextRight;
        }, Math.round(duration * 700));

        window.setTimeout(() => {
          busy = false;
        }, Math.round(duration * 1000) + 250);
      };

      (el as any).__action = onTransfer;
    }, el);

    return () => {
      delete (el as any).__action;
      ctx.revert();
    };
  }
};
