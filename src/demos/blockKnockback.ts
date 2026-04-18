import type { Demo } from "../types";
import { gsap } from "../gsap";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const demoBlockKnockback: Demo = {
  id: "block_knockback",
  title: "BLOCK_KNOCKBACK",
  subtitle: "HIT / KICK / RECOIL",
  tags: { playback: ["interactive"], type: ["feedback", "ui"], related: ["mouse"] },
  defaults: {
    dash: 110,
    knock: 170,
    rotate: 26,
    duration: 0.75
  },
  controls: [
    { key: "dash", label: "dash(px)", type: "range", min: 40, max: 220, step: 5 },
    { key: "knock", label: "knock(px)", type: "range", min: 60, max: 320, step: 5 },
    { key: "rotate", label: "rotate(deg)", type: "range", min: 0, max: 90, step: 1 },
    { key: "duration", label: "duration", type: "range", min: 0.25, max: 2.2, step: 0.05 }
  ],
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoBlockKnockback.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const dash = Number(p.dash);
    const knock = Number(p.knock);
    const rotate = Number(p.rotate);
    const duration = Number(p.duration);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden">
          <div class="stage absolute inset-0 overflow-hidden">
            <div class="absolute inset-0 opacity-12 bg-[radial-gradient(circle_at_30%_20%,rgba(16,73,241,0.22),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(16,73,241,0.10),transparent_60%)]"></div>
            <div class="row relative w-full h-full">
              <button class="a absolute left-16 top-1/2 -translate-y-1/2 w-[120px] h-[120px] border border-outline-variant bg-surface shadow-sm cursor-pointer" type="button"></button>
              <div class="b absolute right-16 top-1/2 -translate-y-1/2 w-[120px] h-[120px] border border-outline-variant bg-surface shadow-sm"></div>
              <div class="impact absolute left-0 top-0 pointer-events-none"></div>
            </div>
          </div>

          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button class="btn w-10 h-10 flex items-center justify-center border-[0.5px] border-outline-variant bg-surface text-on-surface hover:bg-primary hover:text-on-primary transition-colors" type="button" title="hit">
              <span class="material-symbols-outlined text-base">sports_mma</span>
            </button>
            <div class="text-[10px] font-mono uppercase tracking-widest text-outline">HIT</div>
          </div>
        </div>
      `;

      const a = el.querySelector(".a") as HTMLButtonElement | null;
      const b = el.querySelector(".b") as HTMLElement | null;
      const stage = el.querySelector(".stage") as HTMLElement | null;
      const btn = el.querySelector(".btn") as HTMLButtonElement | null;
      if (!a || !b || !stage || !btn) return;

      let busy = false;
      const reset = () => {
        busy = false;
        gsap.set(a, { clearProps: "all", x: 0, rotation: 0, scale: 1 });
        gsap.set(b, { clearProps: "all", x: 0, rotation: 0, scale: 1, opacity: 1 });
        gsap.set(stage, { clearProps: "all", x: 0 });
      };

      const hit = () => {
        if (busy) return;
        busy = true;

        if (reduceMotion) {
          gsap.to(b, { opacity: 0.6, duration: 0.1, yoyo: true, repeat: 1, onComplete: () => reset() });
          return;
        }

        const tl = gsap.timeline({ onComplete: () => window.setTimeout(() => reset(), 220) });

        // 攻击方前冲
        tl.to(a, { x: dash, duration: duration * 0.22, ease: "power3.in" });
        tl.to(a, { scale: 0.96, duration: 0.06, yoyo: true, repeat: 1, ease: "power2.out" }, "<");

        // 防御方被打飞
        tl.to(
          b,
          {
            x: knock,
            rotation: lerp(-rotate, rotate, Math.random()),
            scale: 0.92,
            duration: duration * 0.38,
            ease: "power3.out"
          },
          "<0.02"
        );

        // 冲击抖动（PK 类反馈）
        tl.fromTo(stage, { x: 0 }, { x: 10, duration: 0.08, yoyo: true, repeat: 3, ease: "power2.out" }, "<0.06");
        tl.fromTo(b, { filter: "brightness(1)" }, { filter: "brightness(1.35)", duration: 0.08, yoyo: true, repeat: 1 }, "<0.05");

        // 回弹：攻击方后撤
        tl.to(a, { x: 0, duration: duration * 0.28, ease: "power3.out" }, ">");
        tl.to(b, { x: 0, rotation: 0, scale: 1, duration: duration * 0.4, ease: "elastic.out(1,0.5)" }, "<0.02");
      };

      a.addEventListener("click", hit);
      btn.addEventListener("click", hit);
      (el as any).__cleanup = () => {
        a.removeEventListener("click", hit);
        btn.removeEventListener("click", hit);
      };
    }, el);

    return () => {
      (el as any).__cleanup?.();
      ctx.revert();
    };
  }
};
