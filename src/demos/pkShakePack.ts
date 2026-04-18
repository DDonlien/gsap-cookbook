import type { Demo } from "../types";
import { gsap } from "../gsap";

type Preset = "hit" | "crit" | "miss" | "stun" | "heavy";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function shake(el: HTMLElement, preset: Preset, intensity: number, duration: number) {
  const tl = gsap.timeline();
  const i = Math.max(0, intensity);

  if (preset === "hit") {
    tl.fromTo(el, { x: 0, y: 0 }, { x: () => lerp(-i, i, Math.random()), y: () => lerp(-i, i, Math.random()), duration: duration / 8, repeat: 7, yoyo: true, ease: "power2.out", repeatRefresh: true })
      .to(el, { x: 0, y: 0, duration: duration / 6, ease: "power2.out" });
  } else if (preset === "crit") {
    tl.to(el, { scale: 0.95, duration: duration * 0.12, ease: "power2.out" })
      .to(el, { scale: 1.08, duration: duration * 0.18, ease: "back.out(3)" })
      .fromTo(el, { x: 0 }, { x: () => lerp(-i * 1.2, i * 1.2, Math.random()), duration: duration / 10, repeat: 9, yoyo: true, ease: "power2.out", repeatRefresh: true }, "<0.02")
      .to(el, { scale: 1, x: 0, duration: duration * 0.2, ease: "power3.out" });
  } else if (preset === "miss") {
    tl.to(el, { rotation: lerp(-6, 6, Math.random()), duration: duration * 0.2, ease: "power2.out" })
      .to(el, { x: lerp(-i * 2, i * 2, Math.random()), duration: duration * 0.22, ease: "power2.out" })
      .to(el, { rotation: 0, x: 0, duration: duration * 0.32, ease: "elastic.out(1,0.6)" });
  } else if (preset === "stun") {
    tl.fromTo(el, { filter: "brightness(1)" }, { filter: "brightness(1.35)", duration: duration * 0.12, yoyo: true, repeat: 3, ease: "sine.inOut" })
      .fromTo(el, { x: 0 }, { x: () => lerp(-i * 0.8, i * 0.8, Math.random()), duration: duration / 14, repeat: 13, yoyo: true, ease: "none", repeatRefresh: true }, 0)
      .to(el, { x: 0, duration: duration * 0.2, ease: "power2.out" });
  } else if (preset === "heavy") {
    tl.to(el, { y: i * 0.6, duration: duration * 0.12, ease: "power2.in" })
      .to(el, { y: -i * 0.35, duration: duration * 0.16, ease: "power2.out" })
      .to(el, { y: 0, duration: duration * 0.22, ease: "bounce.out" })
      .fromTo(el, { x: 0 }, { x: () => lerp(-i * 1.4, i * 1.4, Math.random()), duration: duration / 10, repeat: 9, yoyo: true, ease: "power2.out", repeatRefresh: true }, 0);
  }

  return tl;
}

export const demoPkShakePack: Demo = {
  id: "pk_shake_pack",
  title: "PK_SHAKE_PACK",
  subtitle: "HIT / CRIT / MISS / STUN",
  tags: { playback: ["interactive"], type: ["feedback", "ui"], related: ["mouse"] },
  defaults: {
    preset: "hit",
    intensity: 14,
    duration: 0.55
  },
  controls: [
    {
      key: "preset",
      label: "preset",
      type: "select",
      options: [
        { label: "hit(命中)", value: "hit" },
        { label: "crit(暴击)", value: "crit" },
        { label: "miss(闪避)", value: "miss" },
        { label: "stun(眩晕)", value: "stun" },
        { label: "heavy(重击)", value: "heavy" }
      ]
    },
    { key: "intensity", label: "intensity(px)", type: "range", min: 0, max: 40, step: 1 },
    { key: "duration", label: "duration", type: "range", min: 0.2, max: 1.8, step: 0.05 }
  ],
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoPkShakePack.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const preset = String(p.preset) as Preset;
    const intensity = Number(p.intensity);
    const duration = Number(p.duration);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden">
          <div class="stage absolute inset-0 flex items-center justify-center">
            <div class="absolute inset-0 opacity-12 bg-[radial-gradient(circle_at_30%_20%,rgba(16,73,241,0.22),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(16,73,241,0.10),transparent_60%)]"></div>
            <div class="grid grid-cols-3 gap-4">
              ${[0, 1, 2]
                .map(
                  (i) => `
                    <button class="card relative w-[160px] h-[210px] border border-outline-variant bg-surface shadow-sm cursor-pointer overflow-hidden" type="button" data-i="${i}">
                      <div class="absolute inset-0 opacity-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zz4=PHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI2FkYjNiMCIvPjwvc3ZnPg==')]"></div>
                      <div class="absolute inset-0 flex items-center justify-center">
                        <div class="text-3xl font-black tracking-tight">${i === 0 ? "A" : i === 1 ? "B" : "C"}</div>
                      </div>
                    </button>
                  `
                )
                .join("")}
            </div>
          </div>

          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div class="w-10 h-10 flex items-center justify-center border-[0.5px] border-outline-variant bg-surface text-on-surface">
              <span class="material-symbols-outlined text-base">vibration</span>
            </div>
            <div class="text-[10px] font-mono uppercase tracking-widest text-outline">CLICK ANY CARD</div>
          </div>
        </div>
      `;

      const cards = gsap.utils.toArray<HTMLButtonElement>(".card", el);
      let activeTl: gsap.core.Timeline | null = null;

      const onClick = (e: MouseEvent) => {
        const card = (e.target as Element | null)?.closest(".card") as HTMLElement | null;
        if (!card) return;
        activeTl?.kill();
        gsap.set(card, { clearProps: "filter" });
        if (reduceMotion) return;
        activeTl = shake(card, preset, intensity, duration);
      };

      el.addEventListener("click", onClick);
      (el as any).__cleanup = () => el.removeEventListener("click", onClick);
    }, el);

    return () => {
      (el as any).__cleanup?.();
      ctx.revert();
    };
  }
};
