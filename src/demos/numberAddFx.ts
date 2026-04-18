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
  subtitle: "ROLL / SHAKE / FLASH",
  tags: { playback: ["interactive"], type: ["ui", "feedback"], related: ["mouse"] },
  defaults: {
    base: 1250,
    minAdd: 25,
    maxAdd: 350,
    rollDuration: 0.55,
    flash: 0.55,
    shake: 10,
    shakeDuration: 0.25
  },
  controls: [
    { key: "base", label: "base", type: "range", min: 0, max: 9999, step: 1 },
    { key: "minAdd", label: "minAdd", type: "range", min: 1, max: 500, step: 1 },
    { key: "maxAdd", label: "maxAdd", type: "range", min: 1, max: 2000, step: 1 },
    { key: "rollDuration", label: "rollDuration", type: "range", min: 0.1, max: 1.8, step: 0.05 },
    { key: "flash", label: "flash", type: "range", min: 0, max: 1, step: 0.05 },
    { key: "shake", label: "shake(px)", type: "range", min: 0, max: 40, step: 1 },
    { key: "shakeDuration", label: "shakeDuration", type: "range", min: 0.05, max: 0.8, step: 0.05 }
  ],
  getCode(params) {
    const rollDuration = Number(params.rollDuration);
    const flash = Number(params.flash);
    const shake = Number(params.shake);
    const shakeDuration = Number(params.shakeDuration);
    return `// NUMBER_ADD_FX（数字加法：滚动 + 抖动 + 闪烁）
const el = document.querySelector(".num");
const wrap = document.querySelector(".wrap");

function animateAdd(from, to) {
  // 1) 数字滚动（更新 textContent）
  const obj = { v: from };
  gsap.to(obj, {
    v: to,
    duration: ${rollDuration},
    ease: "power3.out",
    onUpdate: () => (el.textContent = Math.round(obj.v).toLocaleString())
  });

  // 2) 轻微闪烁（高光）
  gsap.fromTo(wrap, { filter: "brightness(1)" }, { filter: "brightness(1.35)", duration: 0.08, yoyo: true, repeat: 1 });
  gsap.fromTo(el, { color: "#2d3432" }, { color: "#1049f1", duration: 0.12, yoyo: true, repeat: 1, repeatDelay: 0.08, delay: ${
      flash ? 0 : 999
    } });

  // 3) 命中感抖动
  gsap.fromTo(wrap, { x: 0 }, { x: ${shake}, duration: ${shakeDuration}, ease: "power2.out", yoyo: true, repeat: 5, repeatRefresh: true });
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

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden flex items-center justify-center p-8">
          <div class="wrap relative">
            <div class="num text-6xl font-black tracking-tight text-on-surface tabular-nums">${format(base)}</div>
          </div>
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button class="btn w-10 h-10 flex items-center justify-center border-[0.5px] border-outline-variant bg-surface text-on-surface hover:bg-primary hover:text-on-primary transition-colors" type="button" title="add">
              <span class="material-symbols-outlined text-base">add</span>
            </button>
            <div class="text-[10px] font-mono uppercase tracking-widest text-outline">ADD</div>
          </div>
        </div>
      `;

      const num = el.querySelector(".num") as HTMLElement | null;
      const wrap = el.querySelector(".wrap") as HTMLElement | null;
      const btn = el.querySelector(".btn") as HTMLButtonElement | null;
      if (!num || !wrap || !btn) return;

      let value = base;
      num.textContent = format(value);

      const animateTo = (next: number) => {
        if (reduceMotion) {
          value = next;
          num.textContent = format(value);
          return;
        }

        // 1) 数字滚动
        const obj = { v: value };
        gsap.to(obj, {
          v: next,
          duration: rollDuration,
          ease: "power3.out",
          onUpdate: () => (num.textContent = format(obj.v)),
          onComplete: () => {
            value = next;
            num.textContent = format(value);
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

        // 3) 抖动（命中感）
        if (shake > 0) {
          gsap.fromTo(
            wrap,
            { x: 0 },
            {
              x: () => lerp(-shake, shake, Math.random()),
              duration: shakeDuration,
              ease: "power2.out",
              yoyo: true,
              repeat: 5,
              repeatRefresh: true
            }
          );
        }
      };

      btn.addEventListener("click", () => {
        const add = Math.round(lerp(minAdd, maxAdd, Math.random()));
        animateTo(value + add);
      });
    }, el);

    return () => ctx.revert();
  }
};
