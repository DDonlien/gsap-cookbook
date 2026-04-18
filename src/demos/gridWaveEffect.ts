import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoGridWaveEffect: Demo = {
  id: "grid_wave_effect",
  title: "GRID_WAVE_EFFECT",
  subtitle: 'STAGGER: { GRID: "AUTO", FROM: "CENTER" }',
  tags: { playback: ["loop"], type: ["stagger", "grid"], related: [] },
  defaults: {
    scale: 0.3,
    duration: 0.6,
    each: 0.02,
    ease: "sine.inOut",
    color: "#1049f1"
  },
  controls: [
    { key: "scale", label: "scale", type: "range", min: 0.1, max: 1.2, step: 0.05 },
    { key: "duration", label: "duration", type: "range", min: 0, max: 2, step: 0.05 },
    { key: "each", label: "stagger.each", type: "range", min: 0, max: 0.12, step: 0.005 },
    {
      key: "ease",
      label: "ease",
      type: "select",
      options: [
        { label: "sine.inOut", value: "sine.inOut" },
        { label: "power2.inOut", value: "power2.inOut" },
        { label: "expo.inOut", value: "expo.inOut" },
        { label: "none", value: "none" }
      ]
    },
    { key: "color", label: "color", type: "color" }
  ],
  getCode(params) {
    const scale = Number(params.scale);
    const duration = Number(params.duration);
    const each = Number(params.each);
    const ease = String(params.ease);
    const color = String(params.color);
    return `// GRID_WAVE_EFFECT
const stage = document.querySelector(".stage");
stage.innerHTML = \`
  <div class="grid grid-cols-5 grid-rows-5 gap-1 w-full h-full">
    \${Array.from({length:25}).map(()=>'<div class="cell bg-outline-variant/25"></div>').join("")}
  </div>\`;

const cells = stage.querySelectorAll(".cell");
gsap.to(cells, {
  scale: ${scale},
  backgroundColor: "${color}",
  autoAlpha: 1,
  duration: ${duration},
  ease: "${ease}",
  stagger: { each: ${each}, grid: "auto", from: "center" },
  repeat: -1,
  yoyo: true
});`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoGridWaveEffect.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full p-6 flex items-center justify-center">
          <div class="grid grid-cols-5 grid-rows-5 gap-1 w-full h-full">
            ${Array.from({ length: 25 })
              .map(() => `<div class="cell bg-outline-variant/25"></div>`)
              .join("")}
          </div>
        </div>
      `;
      const cells = el.querySelectorAll(".cell");

      if (reduceMotion) return;

      gsap.to(cells, {
        scale: Number(p.scale),
        backgroundColor: String(p.color),
        autoAlpha: 1,
        duration: Number(p.duration),
        ease: String(p.ease),
        stagger: { each: Number(p.each), grid: "auto", from: "center" },
        repeat: -1,
        yoyo: true
      });
    }, el);

    return () => ctx.revert();
  }
};

