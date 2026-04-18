import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoScalePulseV2: Demo = {
  id: "scale_pulse_v2",
  title: "SCALE_PULSE_V2",
  subtitle: "YOYO: TRUE / REPEAT: -1",
  defaults: {
    ringScale: 2.6,
    dotScale: 1.8,
    duration: 1.2,
    ringEase: "power2.inOut",
    dotEase: "sine.inOut"
  },
  controls: [
    { key: "duration", label: "duration", type: "range", min: 0, max: 3, step: 0.05 },
    { key: "ringScale", label: "ring.scale", type: "range", min: 1, max: 4, step: 0.05 },
    { key: "dotScale", label: "dot.scale", type: "range", min: 0.5, max: 3, step: 0.05 },
    {
      key: "ringEase",
      label: "ring.ease",
      type: "select",
      options: [
        { label: "power2.inOut", value: "power2.inOut" },
        { label: "sine.inOut", value: "sine.inOut" },
        { label: "expo.inOut", value: "expo.inOut" },
        { label: "none", value: "none" }
      ]
    },
    {
      key: "dotEase",
      label: "dot.ease",
      type: "select",
      options: [
        { label: "sine.inOut", value: "sine.inOut" },
        { label: "power2.inOut", value: "power2.inOut" },
        { label: "back.out(1.7)", value: "back.out(1.7)" },
        { label: "none", value: "none" }
      ]
    }
  ],
  getCode(params) {
    const ringScale = Number(params.ringScale);
    const dotScale = Number(params.dotScale);
    const duration = Number(params.duration);
    const ringEase = String(params.ringEase);
    const dotEase = String(params.dotEase);
    return `// SCALE_PULSE_V2
const stage = document.querySelector(".stage");
stage.innerHTML = \`
  <div class="relative w-full h-full flex items-center justify-center">
    <div class="absolute w-full h-[1px] bg-outline-variant/60 top-1/2 -translate-y-1/2"></div>
    <div class="absolute w-[1px] h-full bg-outline-variant/60 left-1/2 -translate-x-1/2"></div>
    <div class="ring w-16 h-16 border border-primary rounded-full flex items-center justify-center bg-surface">
      <span class="dot w-2 h-2 bg-primary"></span>
    </div>
  </div>\`;

const tl = gsap.timeline({ repeat: -1, yoyo: true });
tl.to(".ring", { scale: ${ringScale}, duration: ${duration}, ease: "${ringEase}" }, 0)
  .to(".ring", { borderStyle: "dashed", duration: 0.01 }, 0.2)
  .to(".dot", { scale: ${dotScale}, duration: ${duration}, ease: "${dotEase}" }, 0);`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoScalePulseV2.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="relative w-full h-full flex items-center justify-center">
          <div class="absolute w-full h-[1px] bg-outline-variant/60 top-1/2 -translate-y-1/2"></div>
          <div class="absolute w-[1px] h-full bg-outline-variant/60 left-1/2 -translate-x-1/2"></div>
          <div class="ring w-16 h-16 border border-primary rounded-full flex items-center justify-center bg-surface">
            <span class="dot w-2 h-2 bg-primary"></span>
          </div>
        </div>
      `;

      if (reduceMotion) return;

      const tl = gsap.timeline({ repeat: -1, yoyo: true });
      tl.to(
        ".ring",
        { scale: Number(p.ringScale), duration: Number(p.duration), ease: String(p.ringEase) },
        0
      )
        .to(".ring", { borderStyle: "dashed", duration: 0.01 }, 0.2)
        .to(
          ".dot",
          { scale: Number(p.dotScale), duration: Number(p.duration), ease: String(p.dotEase) },
          0
        );
    }, el);

    return () => ctx.revert();
  }
};
