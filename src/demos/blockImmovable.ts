import type { Demo } from "../types";
import { gsap } from "../gsap";

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export const demoBlockImmovable: Demo = {
  id: "block_immovable",
  title: "BLOCK_IMMOVABLE",
  subtitle: "SOLID / VIBRATE / HIT",
  defaults: {
    intensity: 6,
    duration: 0.4,
    flash: true
  },
  controls: [
    { key: "intensity", label: "intensity(px)", type: "range", min: 2, max: 20, step: 1 },
    { key: "duration", label: "duration(s)", type: "range", min: 0.1, max: 1.5, step: 0.05 },
    { 
      key: "flash", 
      label: "flash", 
      type: "select", 
      options: [
        { label: "On(开启)", value: "true" },
        { label: "Off(关闭)", value: "false" }
      ]
    }
  ],
  action: { icon: "vibration", label: "HIT" },
  getCode(params) {
    const intensity = Number(params.intensity ?? 6);
    const duration = Number(params.duration ?? 0.4);
    const flash = params.flash ?? true;

    return `const tl = gsap.timeline();

${flash ? `tl.to(block, { filter: "brightness(1.5)", duration: ${duration * 0.1}, yoyo: true, repeat: 1 });\n` : ""}
tl.fromTo(
  block,
  { x: 0, y: 0 },
  {
    x: () => gsap.utils.random(-${intensity}, ${intensity}),
    y: () => gsap.utils.random(-${intensity}, ${intensity}),
    duration: ${duration} / 10,
    repeat: 9,
    yoyo: true,
    ease: "none",
    repeatRefresh: true
  },
  0
).to(block, { x: 0, y: 0, duration: ${duration} * 0.2, ease: "power2.out" });`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoBlockImmovable.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const intensity = Number(p.intensity);
    const duration = Number(p.duration);
    const flash = p.flash === true || p.flash === "true";

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full relative overflow-hidden">
          <div class="stage absolute inset-0 flex items-center justify-center">
            <div class="pointer-events-none absolute top-4 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-[0.28em] text-outline text-center">
              CLICK TO HIT
            </div>
            
            <button class="block relative w-[160px] h-[160px] border-[0.5px] border-outline-variant bg-surface shadow-sm cursor-pointer select-none flex items-center justify-center" type="button" aria-label="Hit block">
              <div class="absolute inset-0 opacity-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zz4=PHJlY3QgeD0iMiIgeT0iMiIgd2lkdGg9IjEiIGhlaWdodD0iMSIgZmlsbD0iI2FkYjNiMCIvPjwvc3ZnPg==')]"></div>
              <span class="relative text-2xl font-black tracking-widest opacity-80 pointer-events-none">SOLID</span>
            </button>
            <div class="particles absolute inset-0 pointer-events-none"></div>
          </div>
        </div>
      `;

      const block = el.querySelector(".block") as HTMLButtonElement | null;
      const stage = el.querySelector(".stage") as HTMLElement | null;
      const particlesHost = el.querySelector(".particles") as HTMLElement | null;
      if (!block || !stage || !particlesHost) return;

      let tl: gsap.core.Timeline | null = null;

      const reset = () => {
        tl?.kill();
        particlesHost.innerHTML = "";
        gsap.set(block, {
          clearProps: "all",
          x: 0,
          y: 0,
          filter: "none"
        });
      };

      const hit = () => {
        reset();

        if (reduceMotion) {
          gsap.to(block, { filter: "brightness(1.5)", duration: 0.1, yoyo: true, repeat: 1 });
          return;
        }

        // Emit particles
        const rect = block.getBoundingClientRect();
        const stageRect = stage.getBoundingClientRect();
        const cx = rect.left - stageRect.left + rect.width / 2;
        const cy = rect.top - stageRect.top + rect.height / 2;

        for (let i = 0; i < 4; i++) {
          const p = document.createElement("div");
          p.className = "absolute w-1.5 h-1.5 bg-outline-variant rounded-sm";
          p.style.left = `${cx}px`;
          p.style.top = `${cy}px`;
          particlesHost.appendChild(p);

          const angle = Math.random() * Math.PI * 2;
          const dist = gsap.utils.random(30, 80);

          gsap.to(p, {
            x: Math.cos(angle) * dist,
            y: Math.sin(angle) * dist,
            rotation: gsap.utils.random(-180, 180),
            opacity: 0,
            scale: gsap.utils.random(0.5, 1.5),
            duration: duration * gsap.utils.random(0.8, 1.2),
            ease: "power2.out",
            onComplete: () => p.remove()
          });
        }

        // Shake timeline
        tl = gsap.timeline();

        if (flash) {
          tl.to(block, { filter: "brightness(1.3)", duration: duration * 0.1, yoyo: true, repeat: 1 });
        }

        tl.fromTo(
          block,
          { x: 0, y: 0 },
          {
            x: () => gsap.utils.random(-intensity, intensity),
            y: () => gsap.utils.random(-intensity, intensity),
            duration: duration / 10,
            repeat: 9,
            yoyo: true,
            ease: "none",
            repeatRefresh: true
          },
          0
        ).to(block, { x: 0, y: 0, duration: duration * 0.2, ease: "power2.out" });
      };

      block.addEventListener("click", hit);
      (el as any).__action = hit;
      (el as any).__cleanup = () => {
        block.removeEventListener("click", hit);
      };
    }, el);

    return () => {
      (el as any).__cleanup?.();
      delete (el as any).__action;
      ctx.revert();
    };
  }
};
