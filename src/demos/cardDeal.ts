import type { Demo } from "../types";
import { gsap } from "../gsap";

function clamp(n: number, a: number, b: number) {
  return Math.min(b, Math.max(a, n));
}

export const demoCardDeal: Demo = {
  id: "card_deal",
  title: "CARD_DEAL",
  subtitle: "DEAL / STAGGER / ARC",
  defaults: {
    count: 7,
    sourceX: -180,
    sourceY: 120,
    duration: 0.7,
    stagger: 0.06,
    spread: 22,
    yProfile: "sin",
    yAmount: 18,
    ease: "power3.out"
  },
  controls: [
    { key: "count", label: "count", type: "range", min: 3, max: 10, step: 1 },
    { key: "sourceX", label: "sourceX(px)", type: "range", min: -360, max: 360, step: 5 },
    { key: "sourceY", label: "sourceY(px)", type: "range", min: -240, max: 240, step: 5 },
    { key: "duration", label: "duration", type: "range", min: 0.2, max: 1.5, step: 0.05 },
    { key: "stagger", label: "stagger", type: "range", min: 0, max: 0.2, step: 0.01 },
    { key: "spread", label: "spread(deg)", type: "range", min: 0, max: 45, step: 1 },
    {
      key: "yProfile",
      label: "yProfile",
      type: "select",
      options: [
        { label: "sin(中间低两边高)", value: "sin" },
        { label: "u(中间低两边高)", value: "u" },
        { label: "cap(中间高两边低)", value: "cap" },
        { label: "flat(全平)", value: "flat" },
        { label: "random(随机)", value: "random" }
      ]
    },
    { key: "yAmount", label: "yAmount(px)", type: "range", min: 0, max: 60, step: 1 },
    {
      key: "ease",
      label: "ease",
      type: "select",
      options: [
        { label: "power3.out", value: "power3.out" },
        { label: "power2.out", value: "power2.out" },
        { label: "expo.out", value: "expo.out" },
        { label: "back.out(1.7)", value: "back.out(1.7)" }
      ]
    }
  ],
  getCode(params) {
    const count = Number(params.count);
    const sourceX = Number(params.sourceX);
    const sourceY = Number(params.sourceY);
    const duration = Number(params.duration);
    const stagger = Number(params.stagger);
    const spread = Number(params.spread);
    const yProfile = String(params.yProfile);
    const yAmount = Number(params.yAmount);
    const ease = String(params.ease);
    return `// CARD_DEAL
const hand = document.querySelector(".hand");
const cards = hand.querySelectorAll(".card");

// source：决定卡牌从哪里发出来（相对最终手牌中心的偏移）
gsap.set(cards, { x: ${sourceX}, y: ${sourceY}, rotation: -20, scale: 0.9, transformOrigin: "50% 100%" });

const tl = gsap.timeline();
tl.to(cards, {
  x: (i) => (i - (${count}-1)/2) * 70,
  // yProfile: ${yProfile}
  y: (i) => {
    const center = (${count}-1)/2;
    const t = (i - center) / Math.max(center, 1); // -1..1
    let f = 0;
    if ("${yProfile}" === "sin") f = Math.sin(Math.abs(t) * Math.PI/2);
    else if ("${yProfile}" === "u") f = Math.abs(t);
    else if ("${yProfile}" === "cap") f = -Math.abs(t);
    else if ("${yProfile}" === "random") f = (Math.random() * 2 - 1) * 0.8;
    else f = 0;
    return -f * ${yAmount};
  },
  rotation: (i) => (i - (${count}-1)/2) * (${spread}/${Math.max(count - 1, 1)}),
  scale: 1,
  duration: ${duration},
  ease: "${ease}",
  stagger: ${stagger}
});`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoCardDeal.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const count = clamp(Math.round(Number(p.count)), 3, 10);
    const sourceX = Number(p.sourceX);
    const sourceY = Number(p.sourceY);
    const duration = Number(p.duration);
    const stagger = Number(p.stagger);
    const spread = Number(p.spread);
    const yProfile = String(p.yProfile);
    const yAmount = Number(p.yAmount);
    const ease = String(p.ease);

    const yAt = (i: number) => {
      const center = (count - 1) / 2;
      const t = (i - center) / Math.max(center, 1); // -1..1
      let f = 0;
      if (yProfile === "sin") f = Math.sin(Math.abs(t) * Math.PI / 2); // 0..1
      else if (yProfile === "u") f = Math.abs(t); // 0..1
      else if (yProfile === "cap") f = -Math.abs(t); // 0..-1
      else if (yProfile === "random") f = (Math.random() * 2 - 1) * 0.8;
      else f = 0;
      return -f * yAmount;
    };

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-8">
          <div class="hand relative w-full max-w-[520px] h-[260px]">
            ${Array.from({ length: count })
              .map(
                (_, i) => `
                <div class="card absolute left-1/2 top-1/2 w-[120px] h-[170px] -translate-x-1/2 -translate-y-1/2 border border-outline-variant bg-surface shadow-sm">
                  <div class="absolute inset-0 border border-outline-variant"></div>
                  <div class="absolute top-2 left-2 text-[10px] font-mono tracking-widest text-outline">J${i + 1}</div>
                  <div class="absolute bottom-2 right-2 text-[10px] font-mono tracking-widest text-outline">★</div>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      `;

      const cards = gsap.utils.toArray<HTMLElement>(".card");
      gsap.set(cards, {
        x: sourceX,
        y: sourceY,
        rotation: -20,
        scale: 0.9,
        transformOrigin: "50% 100%"
      });

      if (reduceMotion) {
        // 直接摆好最终状态
        gsap.set(cards, {
          x: (i) => (i - (count - 1) / 2) * 70,
          y: (i) => yAt(i),
          rotation: (i) => (i - (count - 1) / 2) * (spread / Math.max(count - 1, 1)),
          scale: 1
        });
        return;
      }

      const tl = gsap.timeline();
      tl.to(cards, {
        x: (i) => (i - (count - 1) / 2) * 70,
        y: (i) => yAt(i),
        rotation: (i) => (i - (count - 1) / 2) * (spread / Math.max(count - 1, 1)),
        scale: 1,
        duration,
        ease,
        stagger
      });
    }, el);

    return () => ctx.revert();
  }
};
