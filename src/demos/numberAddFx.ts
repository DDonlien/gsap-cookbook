import type { Demo } from "../types";
import { gsap } from "../gsap";

function format(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const demoNumberAddFx: Demo = {
  id: "number_add_fx",
  title: "NUMBER_ADD_FX",
  subtitle: "ROLL / SHAKE / POP / FLASH",
  defaults: {
    base: 1250,
    minAdd: 25,
    maxAdd: 350,
    rollDuration: 0.55,
    flash: 0.55,
    shake: 10,
    shakeDuration: 0.25,
    popScale: 1.14,
    popDuration: 0.18
  },
  controls: [
    { key: "base", label: "base", type: "range", min: 0, max: 9999, step: 1 },
    { key: "minAdd", label: "minAdd", type: "range", min: 1, max: 500, step: 1 },
    { key: "maxAdd", label: "maxAdd", type: "range", min: 1, max: 2000, step: 1 },
    { key: "rollDuration", label: "rollDuration", type: "range", min: 0.1, max: 1.8, step: 0.05 },
    { key: "flash", label: "flash", type: "range", min: 0, max: 1, step: 0.05 },
    { key: "shake", label: "shake(px)", type: "range", min: 0, max: 40, step: 1 },
    { key: "shakeDuration", label: "shakeDuration", type: "range", min: 0.05, max: 0.8, step: 0.05 },
    { key: "popScale", label: "popScale", type: "range", min: 1, max: 1.5, step: 0.01 },
    { key: "popDuration", label: "popDuration", type: "range", min: 0.05, max: 0.5, step: 0.01 }
  ],
  action: { icon: "add", label: "ADD" },
  getCode(params) {
    const rollDuration = Number(params.rollDuration);
    const flash = Number(params.flash);
    const shake = Number(params.shake);
    const shakeDuration = Number(params.shakeDuration);
    const popScale = Number(params.popScale);
    const popDuration = Number(params.popDuration);
    return `// NUMBER_ADD_FX（数字加法：滚动 + 抖动 + 放大 + 闪烁）
const el = document.querySelector(".num");
const wrap = document.querySelector(".wrap");
const state = { value: 0 };

function animateAdd(from, to) {
  // 1) 数字滚动（更新 textContent）
  state.value = from;
  gsap.to(state, {
    value: to,
    duration: ${rollDuration},
    ease: "power3.out",
    overwrite: true,
    onUpdate: () => (el.textContent = Math.round(state.value).toLocaleString())
  });

  // 2) 轻微闪烁（高光）
  gsap.fromTo(wrap, { filter: "brightness(1)" }, { filter: "brightness(1.35)", duration: 0.08, yoyo: true, repeat: 1 });
  gsap.fromTo(el, { color: "#2d3432" }, { color: "#1049f1", duration: 0.12, yoyo: true, repeat: 1, repeatDelay: 0.08, delay: ${
      flash ? 0 : 999
    } });

  // 3) 数字本体抖动
  gsap.fromTo(el, { x: 0, y: 0 }, {
    x: () => gsap.utils.random(-${shake}, ${shake}),
    y: () => gsap.utils.random(-${Math.max(1, Math.round(shake * 0.35))}, ${Math.max(1, Math.round(shake * 0.35))}),
    duration: ${shakeDuration},
    ease: "power2.out",
    yoyo: true,
    repeat: 5,
    repeatRefresh: true
  });

  // 4) 数字放大再回落
  const popBoost = Math.max(0, ${popScale} - 1);
  const currentScale = Number(gsap.getProperty(el, "scale")) || 1;
  const targetScale = Math.min(Math.max(${popScale}, currentScale + popBoost), 1 + popBoost * 3);
  gsap.killTweensOf(el, "scale");
  gsap.timeline()
    .to(el, { scale: targetScale, duration: ${popDuration}, ease: "power2.out" })
    .to(el, { scale: 1, duration: ${popDuration} * 1.15, ease: "power3.out" });
}`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoNumberAddFx.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const base = Number(p.base);
    const minAdd = Math.min(Number(p.minAdd), Number(p.maxAdd));
    const maxAdd = Math.max(Number(p.minAdd), Number(p.maxAdd));
    const rollDuration = Number(p.rollDuration);
    const flash = Number(p.flash);
    const shake = Number(p.shake);
    const shakeDuration = Number(p.shakeDuration);
    const popScale = Number(p.popScale);
    const popDuration = Number(p.popDuration);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden flex items-center justify-center p-8">
          <div class="wrap relative">
            <div class="num text-6xl font-black tracking-tight text-on-surface tabular-nums">${format(base)}</div>
          </div>
        </div>
      `;

      const num = el.querySelector(".num") as HTMLElement | null;
      const wrap = el.querySelector(".wrap") as HTMLElement | null;
      if (!num || !wrap) return;

      const state = { value: base };
      num.textContent = format(state.value);
      gsap.set(num, { transformOrigin: "50% 50%" });

      const animateTo = (next: number) => {
        if (reduceMotion) {
          state.value = next;
          num.textContent = format(state.value);
          return;
        }

        // 1) 数字滚动
        gsap.to(state, {
          value: next,
          duration: rollDuration,
          ease: "power3.out",
          overwrite: true,
          onUpdate: () => (num.textContent = format(state.value)),
          onComplete: () => {
            state.value = next;
            num.textContent = format(state.value);
          }
        });

        // 2) 闪烁 / 高光
        if (flash > 0) {
          gsap.fromTo(wrap, { filter: "brightness(1)" }, { filter: "brightness(1.35)", duration: 0.08, yoyo: true, repeat: 1 });
          gsap.fromTo(
            num,
            { color: "#2d3432" },
            { color: "#1049f1", duration: 0.12, yoyo: true, repeat: 1, repeatDelay: 0.06 }
          );
        }

        // 3) 数字本体抖动
        if (shake > 0) {
          gsap.killTweensOf(num, "x,y");
          gsap.fromTo(
            num,
            { x: 0, y: 0 },
            {
              x: () => lerp(-shake, shake, Math.random()),
              y: () => lerp(-shake * 0.35, shake * 0.35, Math.random()),
              duration: shakeDuration,
              ease: "power2.out",
              yoyo: true,
              repeat: 5,
              repeatRefresh: true
            }
          );
        }

        // 4) 数字放大再回落
        if (popScale > 1) {
          const popBoost = Math.max(0, popScale - 1);
          const currentScale = Number(gsap.getProperty(num, "scale")) || 1;
          const targetScale = Math.min(Math.max(popScale, currentScale + popBoost), 1 + popBoost * 3);
          gsap.killTweensOf(num, "scale");
          gsap
            .timeline()
            .to(num, { scale: targetScale, duration: popDuration, ease: "power2.out" })
            .to(num, { scale: 1, duration: popDuration * 1.15, ease: "power3.out" });
        }
      };

      const triggerAdd = () => {
        const add = Math.round(lerp(minAdd, maxAdd, Math.random()));
        animateTo(state.value + add);
      };

      (el as any).__action = triggerAdd;
    }, el);

    return () => {
      delete (el as any).__action;
      ctx.revert();
    };
  }
};
