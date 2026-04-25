import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoHoverTilt: Demo = {
  id: "hover_tilt",
  title: "HOVER_TILT",
  subtitle: "MOUSE TILT / GLOW",
  defaults: {
    maxTilt: 14,
    glow: 0.35,
    glowType: "corner_same",
    glowOverflow: "clip",
    duration: 0.25
  },
  controls: [
    { key: "maxTilt", label: "maxTilt(deg)", type: "range", min: 0, max: 30, step: 1 },
    { key: "glow", label: "glow", type: "range", min: 0, max: 1, step: 0.05 },
    {
      key: "glowType",
      label: "glowType",
      type: "select",
      options: [
        { label: "corner_same(鼠标同侧对角)", value: "corner_same" },
        { label: "corner_opposite(鼠标对立侧)", value: "corner_opposite" },
        { label: "spot(鼠标聚光灯)", value: "spot" }
      ]
    },
    {
      key: "glowOverflow",
      label: "glowOverflow",
      type: "select",
      options: [
        { label: "clip(裁切)", value: "clip" },
        { label: "overflow(溢出可见)", value: "overflow" }
      ]
    },
    { key: "duration", label: "duration", type: "range", min: 0, max: 0.8, step: 0.05 }
  ],
  getCode(params) {
    const maxTilt = Number(params.maxTilt);
    const glow = Number(params.glow);
    const glowType = String(params.glowType);
    const glowOverflow = String(params.glowOverflow);
    const duration = Number(params.duration);
    
    return `// HOVER_TILT
const card = document.querySelector(".card");
const glowEl = document.querySelector(".glow");

// glowOverflow: clip 或 overflow
card.style.overflow = "${glowOverflow === "overflow" ? "visible" : "hidden"}";

card.addEventListener("pointermove", (e) => {
  const r = card.getBoundingClientRect();
  const px = (e.clientX - r.left) / r.width;
  const py = (e.clientY - r.top) / r.height;
  const rx = (0.5 - py) * ${maxTilt};
  const ry = (px - 0.5) * ${maxTilt};
  
  gsap.to(card, { rotationX: rx, rotationY: ry, duration: ${duration}, ease: "power2.out" });
  
  ${glowType === "spot" 
    ? `// 聚光灯跟随鼠标中心
  gsap.to(glowEl, {
    opacity: ${glow},
    x: (px - 0.5) * r.width,
    y: (py - 0.5) * r.height,
    duration: ${duration}
  });`
    : `// 渐变对角光照（xPercent/yPercent偏移）
  const sign = ${glowType === "corner_opposite" ? "-1" : "1"};
  gsap.to(glowEl, {
    opacity: ${glow},
    xPercent: (px - 0.5) * 30 * sign,
    yPercent: (py - 0.5) * 30 * sign,
    duration: ${duration}
  });`
  }
});

card.addEventListener("pointerleave", () => {
  gsap.to(card, { rotationX: 0, rotationY: 0, duration: ${duration}, ease: "power3.out" });
  gsap.to(glowEl, { opacity: 0, ${glowType === "spot" ? "x: 0, y: 0" : "xPercent: 0, yPercent: 0"}, duration: ${duration} });
});`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoHoverTilt.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const maxTilt = Number(p.maxTilt);
    const glow = Number(p.glow);
    const glowType = String(p.glowType);
    const glowOverflow = String(p.glowOverflow);
    const duration = Number(p.duration);

    const ctx = gsap.context(() => {
      const cardOverflowClass = glowOverflow === "overflow" ? "overflow-visible" : "overflow-hidden";
      
      // spot 聚光灯：一个圆形的径向渐变
      // corner_same/opposite：一个大的左上角线性渐变
      let glowHtml = "";
      if (glowType === "spot") {
        glowHtml = `<div class="glow pointer-events-none opacity-0 absolute w-[200px] h-[200px] -left-[100px] -top-[100px] mix-blend-screen" 
          style="background: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%);"></div>`;
      } else {
        const glowInsetClass = glowOverflow === "overflow" ? "-inset-10 blur-lg" : "inset-0";
        glowHtml = `<div class="glow pointer-events-none opacity-0 absolute ${glowInsetClass} bg-gradient-to-br from-primary/40 via-transparent to-transparent"></div>`;
      }

      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-8 [perspective:900px]">
          <div class="card relative w-[180px] h-[240px] border border-outline-variant bg-surface shadow-sm [transform-style:preserve-3d] ${cardOverflowClass}">
            ${glowHtml}
            <div class="absolute top-2 left-2 text-[10px] font-mono tracking-widest text-outline">HOVER</div>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="text-3xl font-bold tracking-tight">J</div>
            </div>
          </div>
        </div>
      `;

      const card = el.querySelector(".card") as HTMLElement | null;
      const glowEl = el.querySelector(".glow") as HTMLElement | null;
      if (!card || !glowEl) return;

      // ... 
      if (reduceMotion) return;

      const onMove = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = (0.5 - py) * maxTilt;
        const ry = (px - 0.5) * maxTilt;
        
        gsap.to(card, { rotationX: rx, rotationY: ry, duration, ease: "power2.out" });
        
        if (glowType === "spot") {
          // spot 模式：直接移动圆形高光的中心 (圆心通过 -left-[100px] -top-[100px] 补偿了，只需加上鼠标坐标)
          gsap.to(glowEl, {
            opacity: glow,
            x: px * r.width,
            y: py * r.height,
            duration
          });
        } else {
          // corner 模式：移动渐变层的偏移百分比
          const sign = glowType === "corner_opposite" ? -1 : 1;
          gsap.to(glowEl, {
            opacity: glow,
            xPercent: (px - 0.5) * 30 * sign,
            yPercent: (py - 0.5) * 30 * sign,
            duration
          });
        }
      };
      
      const onLeave = () => {
        gsap.to(card, { rotationX: 0, rotationY: 0, duration, ease: "power3.out" });
        if (glowType === "spot") {
          // spot 模式：直接消失
          gsap.to(glowEl, { opacity: 0, duration });
        } else {
          gsap.to(glowEl, { opacity: 0, xPercent: 0, yPercent: 0, duration });
        }
      };

      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
      (card as any).__cleanup = () => {
        card.removeEventListener("pointermove", onMove);
        card.removeEventListener("pointerleave", onLeave);
      };
    }, el);

    return () => {
      const card = el.querySelector(".card") as any;
      card?.__cleanup?.();
      ctx.revert();
    };
  }
};
