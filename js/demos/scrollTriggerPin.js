export const demoScrollTriggerPin = {
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
  start: "top ${Number(params.startPercent)}%",
  end: "+=${Number(params.end)}",
  pin: true,
  scrub: ${Number(params.scrub)}
});`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...demoScrollTriggerPin.defaults, ...(params ?? {}) };
    const ctx = window.gsap.context(() => {
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

      if (!window.ScrollTrigger || reduceMotion) return;

      const scroller = /** @type {HTMLElement} */ (el.querySelector(".scroller"));
      const pinBox = /** @type {HTMLElement} */ (el.querySelector(".pinBox"));

      window.ScrollTrigger.create({
        trigger: pinBox,
        scroller,
        start: `top ${Number(p.startPercent)}%`,
        end: `+=${Number(p.end)}`,
        pin: true,
        scrub: Number(p.scrub)
      });

      window.ScrollTrigger.refresh();
    }, el);

    return () => ctx.revert();
  }
};
