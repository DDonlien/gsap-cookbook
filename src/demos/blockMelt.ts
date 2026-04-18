import type { Demo } from "../types";
import { gsap } from "../gsap";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const demoBlockMelt: Demo = {
  id: "block_melt",
  title: "BLOCK_MELT",
  subtitle: "SQUASH / DRIP / FADE",
  tags: { playback: ["interactive"], type: ["feedback", "ui"], related: ["mouse"] },
  defaults: {
    duration: 0.9,
    dripCount: 10,
    dripDistance: 90,
    wobble: 10
  },
  controls: [
    { key: "duration", label: "duration", type: "range", min: 0.3, max: 2.2, step: 0.05 },
    { key: "dripCount", label: "dripCount", type: "range", min: 0, max: 30, step: 1 },
    { key: "dripDistance", label: "dripDistance(px)", type: "range", min: 20, max: 180, step: 5 },
    { key: "wobble", label: "wobble(deg)", type: "range", min: 0, max: 30, step: 1 }
  ],
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoBlockMelt.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const duration = Number(p.duration);
    const dripCount = Math.max(0, Math.round(Number(p.dripCount)));
    const dripDistance = Number(p.dripDistance);
    const wobble = Number(p.wobble);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden">
          <div class="stage absolute inset-0 flex items-center justify-center">
            <div class="absolute inset-0 opacity-12 bg-[radial-gradient(circle_at_30%_20%,rgba(16,73,241,0.22),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(16,73,241,0.10),transparent_60%)]"></div>
            <button class="block relative w-[180px] h-[180px] border border-outline-variant bg-surface shadow-sm overflow-hidden select-none cursor-pointer" type="button">
              <div class="absolute inset-0 opacity-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zz4=PHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI2FkYjNiMCIvPjwvc3ZnPg==')]"></div>
            </button>
            <div class="drips absolute inset-0 pointer-events-none"></div>
          </div>

          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <button class="btn w-10 h-10 flex items-center justify-center border-[0.5px] border-outline-variant bg-surface text-on-surface hover:bg-primary hover:text-on-primary transition-colors" type="button" title="melt">
              <span class="material-symbols-outlined text-base">water_drop</span>
            </button>
            <div class="text-[10px] font-mono uppercase tracking-widest text-outline">MELT</div>
          </div>
        </div>
      `;

      const stage = el.querySelector(".stage") as HTMLElement | null;
      const block = el.querySelector(".block") as HTMLButtonElement | null;
      const btn = el.querySelector(".btn") as HTMLButtonElement | null;
      const dripsHost = el.querySelector(".drips") as HTMLElement | null;
      if (!stage || !block || !dripsHost || !btn) return;

      const reset = () => {
        dripsHost.innerHTML = "";
        gsap.set(block, { clearProps: "all", opacity: 1, scaleX: 1, scaleY: 1, rotation: 0, y: 0, filter: "none" });
      };

      const melt = () => {
        if (reduceMotion) {
          gsap.to(block, { opacity: 0, duration: 0.2, onComplete: () => reset() });
          return;
        }

        const rStage = stage.getBoundingClientRect();
        const r = block.getBoundingClientRect();
        const left = r.left - rStage.left;
        const top = r.top - rStage.top;

        dripsHost.innerHTML = "";
        for (let i = 0; i < dripCount; i++) {
          const d = document.createElement("div");
          d.className = "drip absolute rounded-full";
          const w = lerp(4, 9, Math.random());
          const h = lerp(10, 22, Math.random());
          d.style.width = `${w}px`;
          d.style.height = `${h}px`;
          d.style.left = `${left + lerp(20, r.width - 20, Math.random())}px`;
          d.style.top = `${top + r.height - 12}px`;
          d.style.background = Math.random() > 0.6 ? "rgba(16,73,241,0.65)" : "rgba(45,52,50,0.65)";
          dripsHost.appendChild(d);

          gsap.fromTo(
            d,
            { y: 0, opacity: 0.9, scaleY: 0.7 },
            {
              y: dripDistance + lerp(-10, 10, Math.random()),
              opacity: 0,
              scaleY: 1.3,
              duration: duration * lerp(0.6, 1.1, Math.random()),
              ease: "power2.in",
              delay: i * 0.02,
              onComplete: () => d.remove()
            }
          );
        }

        const tl = gsap.timeline();
        tl.to(block, { rotation: lerp(-wobble, wobble, Math.random()), duration: 0.12, ease: "power2.out" })
          .to(block, { rotation: 0, duration: 0.18, ease: "power2.out" })
          .to(
            block,
            {
              scaleY: 0.12,
              scaleX: 1.08,
              y: 40,
              borderRadius: 60,
              filter: "blur(0.6px)",
              duration: duration * 0.7,
              ease: "power3.in"
            },
            0.06
          )
          .to(block, { opacity: 0, duration: duration * 0.25, ease: "power2.in" }, duration * 0.55);

        window.setTimeout(() => reset(), Math.round(duration * 1000) + 350);
      };

      block.addEventListener("click", melt);
      btn.addEventListener("click", melt);
      (el as any).__cleanup = () => {
        block.removeEventListener("click", melt);
        btn.removeEventListener("click", melt);
      };
    }, el);

    return () => {
      (el as any).__cleanup?.();
      ctx.revert();
    };
  }
};
