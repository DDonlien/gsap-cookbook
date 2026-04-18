import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoBannerPop: Demo = {
  id: "banner_pop",
  title: "BANNER_POP",
  subtitle: "BIG TEXT / SQUASH-STRETCH",
  tags: { playback: ["once"], type: ["feedback", "ui"], related: [] },
  defaults: {
    text: "COMBO!",
    duration: 0.7,
    hold: 0.35,
    maxScale: 1.25,
    tilt: -6
  },
  controls: [
    { key: "text", label: "text", type: "text" },
    { key: "duration", label: "duration", type: "range", min: 0.25, max: 1.8, step: 0.05 },
    { key: "hold", label: "hold", type: "range", min: 0, max: 1.2, step: 0.05 },
    { key: "maxScale", label: "maxScale", type: "range", min: 1, max: 2.2, step: 0.05 },
    { key: "tilt", label: "tilt(deg)", type: "range", min: -20, max: 20, step: 1 }
  ],
  getCode(params) {
    const text = String(params.text ?? "COMBO!");
    const duration = Number(params.duration);
    const hold = Number(params.hold);
    const maxScale = Number(params.maxScale);
    const tilt = Number(params.tilt);
    return `// BANNER_POP（大字提示弹出）
const banner = document.querySelector(".banner");
banner.textContent = ${JSON.stringify(text)};

gsap.timeline()
  .fromTo(banner, { opacity: 0, scale: 0.6, rotate: ${tilt}, y: 18 }, {
    opacity: 1, scale: ${maxScale}, y: 0, duration: ${duration} * 0.55, ease: "back.out(2)"
  })
  .to(banner, { scale: 1, duration: ${duration} * 0.25, ease: "power3.out" })
  .to(banner, { opacity: 0, y: -10, duration: ${duration} * 0.35, ease: "power2.in", delay: ${hold} });`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoBannerPop.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const text = String(p.text ?? "COMBO!");
    const duration = Number(p.duration);
    const hold = Number(p.hold);
    const maxScale = Number(p.maxScale);
    const tilt = Number(p.tilt);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-8 relative overflow-hidden">
          <div class="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,rgba(16,73,241,0.55),transparent_55%),radial-gradient(circle_at_70%_80%,rgba(16,73,241,0.35),transparent_60%)]"></div>
          <div class="banner relative text-6xl font-black tracking-tight text-on-surface select-none text-center leading-none" style="
            text-shadow: 0 10px 40px rgba(16,73,241,0.25);
            -webkit-text-stroke: 1px rgba(16,73,241,0.35);
          ">${text}</div>
        </div>
      `;

      const banner = el.querySelector(".banner") as HTMLElement | null;
      if (!banner) return;
      banner.textContent = text;

      gsap.set(banner, { opacity: reduceMotion ? 1 : 0 });
      if (reduceMotion) return;

      gsap
        .timeline()
        .fromTo(
          banner,
          { opacity: 0, scale: 0.6, rotate: tilt, y: 18 },
          { opacity: 1, scale: maxScale, y: 0, duration: duration * 0.55, ease: "back.out(2)" }
        )
        .to(banner, { scale: 1, duration: duration * 0.25, ease: "power3.out" })
        .to(banner, { opacity: 0, y: -10, duration: duration * 0.35, ease: "power2.in", delay: hold });
    }, el);

    return () => ctx.revert();
  }
};
