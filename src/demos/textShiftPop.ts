import type { Demo } from "../types";
import { gsap } from "../gsap";

function splitHelperText(text: string) {
  const raw = text.trim();
  const match = raw.match(/^(\S+)\s+(.+)$/);
  if (!match) return { symbol: "", value: raw };
  return { symbol: match[1], value: match[2] };
}

function getGroupOffset(direction: string, helperWidth: number) {
  return direction === "left" ? helperWidth / 2 : -helperWidth / 2;
}

export const demoTextShiftPop: Demo = {
  id: "text_shift_pop",
  title: "TEXT_SHIFT_POP",
  subtitle: "SHIFT & POP / 文字平移跳出",
  defaults: {
    char1: "200",
    char2: "x 4",
    direction: "left",
    gap: 16,
    shiftDuration: 0.6,
    popDuration: 0.6,
    shake: 8
  },
  controls: [
    { key: "char1", label: "char1", type: "text" },
    { key: "char2", label: "char2", type: "text" },
    {
      key: "direction",
      label: "direction",
      type: "select",
      options: [
        { label: "Left", value: "left" },
        { label: "Right", value: "right" }
      ]
    },
    { key: "gap", label: "gap(px)", type: "range", min: 0, max: 48, step: 1 },
    { key: "shiftDuration", label: "shiftDur", type: "range", min: 0.2, max: 1.5, step: 0.1 },
    { key: "popDuration", label: "popDur", type: "range", min: 0.2, max: 1.5, step: 0.1 },
    { key: "shake", label: "shake(px)", type: "range", min: 0, max: 20, step: 1 }
  ],
  action: { icon: "play_arrow", label: "PLAY" },
  getCode(params) {
    const char1 = String(params.char1 || "200");
    const char2 = String(params.char2 || "x 4");
    const direction = String(params.direction);
    const gap = Number(params.gap ?? 16);
    const shiftDuration = Number(params.shiftDuration);
    const popDuration = Number(params.popDuration);
    const shake = Number(params.shake);

    return `// TEXT_SHIFT_POP（文字平移跳出）
const textGroup = document.querySelector(".text-group");
const helper = document.querySelector(".helper");

const gap = ${gap};
textGroup.style.gap = \`\${gap}px\`;
const symbol = helper.querySelector(".symbol");
if (symbol) symbol.style.marginRight = \`\${gap}px\`;

// 清除之前的变换以进行精确测量
gsap.set([textGroup, helper], { clearProps: "transform,opacity" });

// 最终状态：原数字 + 符号 + 新数字构成的 group 居中
const helperWidth = helper.getBoundingClientRect().width;

const shiftLeft = "${direction}" === "left";
// 初始状态只露出原数字，并把原数字放在舞台中心
const groupOffset = shiftLeft ? helperWidth / 2 : -helperWidth / 2;

const tl = gsap.timeline();

// 设置初始状态
gsap.set(textGroup, { x: groupOffset });
gsap.set(helper, {
  x: 0,
  y: 0,
  scale: 0, 
  opacity: 0,
  transformOrigin: shiftLeft ? "left center" : "right center"
});

// 1) 整体容器平移回自然居中位置
tl.to(textGroup, {
  x: 0,
  duration: ${shiftDuration},
  ease: "power3.inOut"
}, 0);

// 2) 新文字跳出（带弹性）
tl.to(helper, {
  scale: 1,
  opacity: 1,
  duration: ${popDuration},
  ease: "back.out(2)"
}, ${shiftDuration * 0.3});

// 3) 仅对新文字添加弹性抖动效果
${shake > 0 ? `tl.to(helper, {
  x: () => gsap.utils.random(-${shake}, ${shake}),
  y: () => gsap.utils.random(-${shake}, ${shake}),
  duration: 0.08,
  yoyo: true,
  repeat: 5,
  ease: "sine.inOut"
}, "<0.1").set(helper, { x: 0, y: 0, scale: 1 });` : ""}`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoTextShiftPop.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const char1Text = String(p.char1 || "200");
    const char2Text = String(p.char2 || "x 4");
    const direction = String(p.direction);
    const gap = Number(p.gap);
    const shiftDuration = Number(p.shiftDuration);
    const popDuration = Number(p.popDuration);
    const shake = Number(p.shake);

    const ctx = gsap.context(() => {
      const shiftLeft = direction === "left";
      const helper = splitHelperText(char2Text);
      const primaryOrder = shiftLeft ? 0 : 1;
      const helperOrder = shiftLeft ? 1 : 0;
      const helperOrigin = shiftLeft ? "left center" : "right center";

      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center overflow-hidden bg-surface">
          <div class="text-group inline-flex items-center" style="gap: ${gap}px;">
            <div class="char1 text-5xl font-black text-on-surface leading-none whitespace-nowrap" style="order: ${primaryOrder};">${char1Text}</div>
            <div class="helper inline-flex items-center text-5xl font-black leading-none whitespace-nowrap" style="order: ${helperOrder};">
              ${helper.symbol ? `<div class="symbol text-primary leading-none" style="margin-right: ${gap}px;">${helper.symbol}</div>` : ""}
              <div class="char2 text-primary leading-none">${helper.value}</div>
            </div>
          </div>
        </div>
      `;

      const textGroup = el.querySelector(".text-group") as HTMLElement | null;
      const helperEl = el.querySelector(".helper") as HTMLElement | null;
      if (!textGroup || !helperEl) return;

      // 初始状态与测量
      gsap.set([textGroup, helperEl], { clearProps: "transform,opacity" });

      const helperWidth = helperEl.getBoundingClientRect().width;
      const groupOffset = getGroupOffset(direction, helperWidth);

      if (reduceMotion) {
        gsap.set(textGroup, { x: 0 });
        gsap.set(helperEl, { scale: 1, opacity: 1 });
        return;
      }

      const playAnimation = () => {
        const tl = gsap.timeline();

        // 每次点击重置
        gsap.set(textGroup, { x: groupOffset });
        gsap.set(helperEl, {
          x: 0,
          y: 0,
          scale: 0, 
          opacity: 0,
          transformOrigin: helperOrigin
        });

        tl.to(textGroup, {
          x: 0,
          duration: shiftDuration,
          ease: "power3.inOut"
        }, 0);

        tl.to(helperEl, {
          scale: 1,
          opacity: 1,
          duration: popDuration,
          ease: "back.out(2)"
        }, shiftDuration * 0.3);

        if (shake > 0) {
          tl.to(helperEl, {
            x: () => gsap.utils.random(-shake, shake),
            y: () => gsap.utils.random(-shake, shake),
            duration: 0.08,
            yoyo: true,
            repeat: 5,
            ease: "sine.inOut"
          }, "<0.1").set(helperEl, { x: 0, y: 0, scale: 1 });
        }
      };

      // 自动播放一次
      playAnimation();

      (el as any).__action = playAnimation;
    }, el);

    return () => {
      delete (el as any).__action;
      ctx.revert();
    };
  }
};
