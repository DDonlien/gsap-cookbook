import type { Demo } from "../types";
import { gsap, ScrollTrigger } from "../gsap";

export const demoScrollTriggerPin: Demo = {
  id: "scroll_trigger_pin",
  title: "SCROLL_TRIGGER_PIN",
  subtitle: "SCRUB: 1 / PIN: TRUE",
  tags: { playback: ["interactive"], type: ["scroll", "pin"], related: ["scroll"] },
  defaults: {
    startPercent: 30,
    end: 260,
    scrub: 1
  },
  controls: [
    { key: "startPercent", label: "start(%)", type: "range", min: 0, max: 80, step: 1 },
    { key: "end", label: "end(+=px)", type: "range", min: 60, max: 800, step: 10 },
    { key: "scrub", label: "scrub", type: "range", min: 0, max: 3, step: 0.1 }
  ],
  getCode(params) {
    const startPercent = Number(params.startPercent);
    const end = Number(params.end);
    const scrub = Number(params.scrub);
    return `// SCROLL_TRIGGER_PIN（在容器内滚动）
gsap.registerPlugin(ScrollTrigger);

const stage = document.querySelector(".stage");
stage.innerHTML = \`
  <div class="scroller w-full h-full overflow-y-auto p-6">
    <div class="h-[120px]"></div>
    <div class="pinBox border border-outline-variant bg-surface p-4">
      <div class="text-xs font-mono uppercase tracking-widest text-outline">PINNED</div>
      <div class="text-2xl font-bold tracking-tight">SCROLL</div>
    </div>
    <div class="h-[520px]"></div>
  </div>\`;

const scroller = stage.querySelector(".scroller");
const pinBox = stage.querySelector(".pinBox");

ScrollTrigger.create({
  trigger: pinBox,
  scroller,
  start: "top ${startPercent}%",
  end: "+=${end}",
  pin: true,
  scrub: ${scrub}
});`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoScrollTriggerPin.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="scroller w-full h-full overflow-y-auto p-6">
          <div class="h-[120px]"></div>
          <div class="pinBox border border-outline-variant bg-surface p-4">
            <div class="text-[10px] font-mono uppercase tracking-widest text-outline">PINNED</div>
            <div class="text-2xl font-bold tracking-tight">SCROLL</div>
            <div class="text-[10px] font-mono uppercase tracking-widest text-outline mt-2">拖动滚动条</div>
          </div>
          <div class="h-[520px]"></div>
        </div>
      `;

      if (reduceMotion) return;

      const scroller = el.querySelector(".scroller") as HTMLElement | null;
      const pinBox = el.querySelector(".pinBox") as HTMLElement | null;
      if (!scroller || !pinBox) return;

      ScrollTrigger.create({
        trigger: pinBox,
        scroller,
        start: `top ${Number(p.startPercent)}%`,
        end: `+=${Number(p.end)}`,
        pin: true,
        scrub: Number(p.scrub)
      });

      ScrollTrigger.refresh();
    }, el);

    return () => ctx.revert();
  }
};

