import type { Demo } from "../types";
import { gsap } from "../gsap";

function format(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

export const demoNumberMerge: Demo = {
  id: "number_merge",
  title: "NUMBER_MERGE",
  subtitle: "LEFT × RIGHT => BIG RESULT",
  defaults: {
    left: 128,
    right: 16,
    travel: 132,
    duration: 0.7,
    resultScale: 1.7,
    glow: 0.55
  },
  controls: [
    { key: "left", label: "left", type: "range", min: 1, max: 999, step: 1 },
    { key: "right", label: "right", type: "range", min: 1, max: 999, step: 1 },
    { key: "travel", label: "travel(px)", type: "range", min: 40, max: 220, step: 2 },
    { key: "duration", label: "duration", type: "range", min: 0.25, max: 1.6, step: 0.05 },
    { key: "resultScale", label: "resultScale", type: "range", min: 1.05, max: 2.6, step: 0.05 },
    { key: "glow", label: "glow", type: "range", min: 0, max: 1, step: 0.05 }
  ],
  action: { icon: "merge", label: "MERGE" },
  getCode(params) {
    const left = Number(params.left);
    const right = Number(params.right);
    const travel = Number(params.travel);
    const duration = Number(params.duration);
    const resultScale = Number(params.resultScale);
    const glow = Number(params.glow);
    return `// NUMBER_MERGE（左右数字向中间合并，并在原位替换为结果数）
const leftEl = document.querySelector(".left");
const rightEl = document.querySelector(".right");
const signEl = document.querySelector(".sign");
const resultEl = document.querySelector(".result");

leftEl.textContent = "${format(left)}";
rightEl.textContent = "${format(right)}";
resultEl.textContent = "${format(left * right)}";

gsap.set([leftEl, rightEl, signEl], { opacity: 1, scale: 1, x: 0, filter: "brightness(1)" });
gsap.set(resultEl, { opacity: 0, scale: 0.72, x: 0, y: 0, filter: "brightness(1)" });

gsap.timeline()
  .to(leftEl, {
    x: ${travel},
    scale: 0.84,
    opacity: 0,
    duration: ${duration} * 0.7,
    ease: "power3.in"
  }, 0)
  .to(rightEl, {
    x: -${travel},
    scale: 0.84,
    opacity: 0,
    duration: ${duration} * 0.7,
    ease: "power3.in"
  }, 0)
  .to(signEl, {
    scale: 1.2,
    rotation: 90,
    opacity: 0,
    duration: ${duration} * 0.45,
    ease: "power2.in"
  }, 0.08)
  .to(resultEl, {
    opacity: 1,
    scale: ${resultScale},
    filter: "brightness(${(1 + clamp(glow, 0, 1) * 0.45).toFixed(2)})",
    duration: ${duration} * 0.52,
    ease: "back.out(1.4)"
  }, ${duration} * 0.42)
  .to(resultEl, {
    scale: 1,
    filter: "brightness(1)",
    duration: ${duration} * 0.38,
    ease: "power2.out"
  });`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoNumberMerge.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const left = Math.max(1, Number(p.left));
    const right = Math.max(1, Number(p.right));
    const travel = Number(p.travel);
    const duration = Number(p.duration);
    const resultScale = Number(p.resultScale);
    const glow = clamp(Number(p.glow), 0, 1);
    const result = left * right;

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden flex items-center justify-center p-8">
          <div class="stage relative w-full h-full flex items-center justify-center">
            <div class="row relative flex items-center justify-center gap-6 font-black tracking-tight text-on-surface tabular-nums">
              <div class="left text-4xl sm:text-5xl">${format(left)}</div>
              <div class="sign text-3xl sm:text-4xl text-outline">×</div>
              <div class="right text-4xl sm:text-5xl">${format(right)}</div>
              <div class="result absolute left-1/2 top-1/2 text-4xl sm:text-5xl font-black tracking-tight text-primary tabular-nums -translate-x-1/2 -translate-y-1/2">
                ${format(result)}
              </div>
            </div>
          </div>
        </div>
      `;

      const leftEl = el.querySelector(".left") as HTMLElement | null;
      const rightEl = el.querySelector(".right") as HTMLElement | null;
      const signEl = el.querySelector(".sign") as HTMLElement | null;
      const resultEl = el.querySelector(".result") as HTMLElement | null;
      if (!leftEl || !rightEl || !signEl || !resultEl) return;

      const reset = () => {
        gsap.set([leftEl, rightEl], {
          x: 0,
          y: 0,
          scale: 1,
          opacity: 1,
          filter: "brightness(1)"
        });
        gsap.set(signEl, {
          scale: 1,
          rotation: 0,
          opacity: 1,
          filter: "brightness(1)"
        });
        gsap.set(resultEl, {
          scale: 0.72,
          x: 0,
          y: 0,
          opacity: 0,
          filter: "brightness(1)"
        });
      };

      reset();

      let activeTl: gsap.core.Timeline | null = null;
      const run = () => {
        activeTl?.kill();
        reset();

        if (reduceMotion) {
          gsap.set([leftEl, rightEl, signEl], { opacity: 0 });
          gsap.set(resultEl, { opacity: 1, scale: 1, x: 0, y: 0 });
          return;
        }

        activeTl = gsap
          .timeline()
          .to(
            leftEl,
            {
              x: travel,
              scale: 0.84,
              opacity: 0,
              filter: `brightness(${(1 + glow * 0.25).toFixed(2)})`,
              duration: duration * 0.7,
              ease: "power3.in"
            },
            0
          )
          .to(
            rightEl,
            {
              x: -travel,
              scale: 0.84,
              opacity: 0,
              filter: `brightness(${(1 + glow * 0.25).toFixed(2)})`,
              duration: duration * 0.7,
              ease: "power3.in"
            },
            0
          )
          .to(
            signEl,
            {
              scale: 1.2,
              rotation: 90,
              opacity: 0,
              filter: `brightness(${(1 + glow * 0.45).toFixed(2)})`,
              duration: duration * 0.45,
              ease: "power2.in"
            },
            0.08
          )
          .to(
            resultEl,
            {
              opacity: 1,
              scale: resultScale,
              filter: `brightness(${(1 + glow * 0.45).toFixed(2)})`,
              duration: duration * 0.52,
              ease: "back.out(1.4)"
            },
            duration * 0.42
          )
          .to(resultEl, {
            scale: 1,
            filter: "brightness(1)",
            duration: duration * 0.38,
            ease: "power2.out"
          });
      };

      (el as any).__action = run;
    }, el);

    return () => {
      delete (el as any).__action;
      ctx.revert();
    };
  }
};
