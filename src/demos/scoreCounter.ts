import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoScoreCounter: Demo = {
  id: "score_counter",
  title: "SCORE_COUNTER",
  subtitle: "COUNTER / POP",
  tags: { playback: ["once"], type: ["ui", "counter"], related: [] },
  defaults: {
    from: 1200,
    to: 3450,
    duration: 0.9,
    ease: "power3.out"
  },
  controls: [
    { key: "from", label: "from", type: "range", min: 0, max: 10000, step: 50 },
    { key: "to", label: "to", type: "range", min: 0, max: 10000, step: 50 },
    { key: "duration", label: "duration", type: "range", min: 0.2, max: 2, step: 0.05 },
    {
      key: "ease",
      label: "ease",
      type: "select",
      options: [
        { label: "power3.out", value: "power3.out" },
        { label: "power2.out", value: "power2.out" },
        { label: "expo.out", value: "expo.out" },
        { label: "none", value: "none" }
      ]
    }
  ],
  getCode(params) {
    const from = Number(params.from);
    const to = Number(params.to);
    const duration = Number(params.duration);
    const ease = String(params.ease);
    return `// SCORE_COUNTER
const el = document.querySelector(".score");
const state = { value: ${from} };

gsap.to(state, {
  value: ${to},
  duration: ${duration},
  ease: "${ease}",
  onUpdate() {
    el.textContent = Math.round(state.value).toLocaleString();
  }
});`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoScoreCounter.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const from = Number(p.from);
    const to = Number(p.to);
    const duration = Number(p.duration);
    const ease = String(p.ease);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-8">
          <div class="score text-5xl font-black tracking-tight tabular-nums text-on-surface">0</div>
        </div>
      `;

      const scoreEl = el.querySelector(".score") as HTMLElement | null;
      if (!scoreEl) return;

      const state = { value: from };
      scoreEl.textContent = Math.round(from).toLocaleString();

      if (reduceMotion) {
        scoreEl.textContent = Math.round(to).toLocaleString();
        return;
      }

      const tl = gsap.timeline();
      tl.to(scoreEl, { scale: 1.06, duration: 0.12, ease: "power2.out" }, 0)
        .to(scoreEl, { scale: 1, duration: 0.2, ease: "power2.out" }, 0.12)
        .to(
          state,
          {
            value: to,
            duration,
            ease,
            onUpdate() {
              scoreEl.textContent = Math.round(state.value).toLocaleString();
            }
          },
          0
        );
    }, el);

    return () => ctx.revert();
  }
};
