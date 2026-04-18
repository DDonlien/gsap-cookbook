import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoCardFlip: Demo = {
  id: "card_flip",
  title: "CARD_FLIP",
  subtitle: "3D FLIP / CLICK",
  tags: { playback: ["interactive"], type: ["card", "flip"], related: ["mouse"] },
  defaults: {
    trigger: "click",
    duration: 0.6,
    ease: "power3.inOut",
    tilt: 14
  },
  controls: [
    {
      key: "trigger",
      label: "trigger",
      type: "select",
      options: [
        { label: "click(点击翻)", value: "click" },
        { label: "hover(悬停翻/离开翻回)", value: "hover" }
      ]
    },
    { key: "duration", label: "duration", type: "range", min: 0.2, max: 1.2, step: 0.05 },
    { key: "tilt", label: "tilt(deg)", type: "range", min: 0, max: 30, step: 1 },
    {
      key: "ease",
      label: "ease",
      type: "select",
      options: [
        { label: "power3.inOut", value: "power3.inOut" },
        { label: "power2.inOut", value: "power2.inOut" },
        { label: "expo.inOut", value: "expo.inOut" },
        { label: "none", value: "none" }
      ]
    }
  ],
  getCode(params) {
    const trigger = String(params.trigger);
    const duration = Number(params.duration);
    const tilt = Number(params.tilt);
    const ease = String(params.ease);
    return `// CARD_FLIP（点击/悬停翻面）
const card = document.querySelector(".card");
let flipped = false;

if ("${trigger}" === "hover") {
  card.addEventListener("pointerenter", () => {
    flipped = true;
    gsap.to(card, { rotationY: 180, rotationX: ${tilt}, duration: ${duration}, ease: "${ease}" });
  });
  card.addEventListener("pointerleave", () => {
    flipped = false;
    gsap.to(card, { rotationY: 0, rotationX: 0, duration: ${duration}, ease: "${ease}" });
  });
} else {
  card.addEventListener("click", () => {
    flipped = !flipped;
    gsap.to(card, {
      rotationY: flipped ? 180 : 0,
      rotationX: flipped ? ${tilt} : 0,
      duration: ${duration},
      ease: "${ease}"
    });
  });
}`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoCardFlip.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const trigger = String(p.trigger);
    const duration = Number(p.duration);
    const ease = String(p.ease);
    const tilt = Number(p.tilt);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-8 [perspective:900px]">
          <div class="wrap relative w-[160px] h-[220px]">
            <button class="card absolute inset-0 w-full h-full border border-outline-variant bg-surface shadow-sm [transform-style:preserve-3d] cursor-pointer">
              <div class="face absolute inset-0 flex items-center justify-center [backface-visibility:hidden]">
                <div class="text-[10px] font-mono tracking-widest text-outline absolute top-2 left-2">FRONT</div>
                <div class="text-3xl font-bold tracking-tight">J</div>
              </div>
              <div class="face absolute inset-0 flex items-center justify-center bg-on-surface text-surface [backface-visibility:hidden] [transform:rotateY(180deg)]">
                <div class="text-[10px] font-mono tracking-widest opacity-80 absolute top-2 left-2">BACK</div>
                <div class="text-3xl font-bold tracking-tight">★</div>
              </div>
            </button>
            <div class="mt-3 text-center text-[10px] font-mono uppercase tracking-widest text-outline">CLICK</div>
          </div>
        </div>
      `;

      const card = el.querySelector(".card") as HTMLElement | null;
      if (!card) return;

      let flipped = false;
      const flipTo = (to: boolean) => {
        flipped = to;
        gsap.to(card, {
          rotationY: flipped ? 180 : 0,
          rotationX: flipped ? tilt : 0,
          duration: reduceMotion ? 0 : duration,
          ease
        });
      };

      const onClick = () => flipTo(!flipped);
      const onEnter = () => flipTo(true);
      const onLeave = () => flipTo(false);

      if (trigger === "hover") {
        card.addEventListener("pointerenter", onEnter);
        card.addEventListener("pointerleave", onLeave);
        (card as any).__cleanup = () => {
          card.removeEventListener("pointerenter", onEnter);
          card.removeEventListener("pointerleave", onLeave);
        };
      } else {
        card.addEventListener("click", onClick);
        (card as any).__cleanup = () => card.removeEventListener("click", onClick);
      }
    }, el);

    return () => {
      const card = el.querySelector(".card") as any;
      card?.__cleanup?.();
      ctx.revert();
    };
  }
};
