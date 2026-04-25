import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoLagTilt: Demo = {
  id: "lag_tilt",
  title: "LAG TILT",
  subtitle: "DRAG DELAY / DISTANCE TILT",
  defaults: {
    maxTilt: 30,
    speed: 0.15,
    distanceFactor: 0.4
  },
  controls: [
    { key: "maxTilt", label: "maxTilt(deg)", type: "range", min: 10, max: 60, step: 1 },
    { key: "speed", label: "followSpeed(0~1)", type: "range", min: 0.01, max: 1, step: 0.01 },
    { key: "distanceFactor", label: "tiltSensitivity", type: "range", min: 0.1, max: 2.0, step: 0.1 }
  ],
  getCode(params) {
    const maxTilt = Number(params.maxTilt);
    const speed = Number(params.speed);
    const distanceFactor = Number(params.distanceFactor);

    return `// LAG_TILT（卡牌跟随鼠标，基于鼠标与卡牌中心的距离决定倾斜度）
const card = document.querySelector(".card");
const container = document.querySelector(".container");

let mouseX = 0;
let mouseY = 0;
let cardX = 0;
let cardY = 0;
let isHovering = false;

// 监听鼠标在容器内的移动
container.addEventListener("pointermove", (e) => {
  const r = container.getBoundingClientRect();
  mouseX = e.clientX - r.left - r.width / 2;
  mouseY = e.clientY - r.top - r.height / 2;
  if (!isHovering) {
    cardX = mouseX;
    cardY = mouseY;
  }
  isHovering = true;
});

container.addEventListener("pointerleave", () => {
  isHovering = false;
  mouseX = 0;
  mouseY = 0;
  // 鼠标离开时，目标点设为中心，继续通过 ticker 插值回正
});

// 使用 gsap.ticker 在每一帧更新卡牌位置和倾斜
gsap.ticker.add(() => {
  // 如果没有 Hover 并且卡牌已经在中心，就不再执行更新
  if (!isHovering && cardX === 0 && cardY === 0) return;

  // 卡牌向鼠标位置插值移动（制造延迟感）
  cardX += (mouseX - cardX) * ${speed};
  cardY += (mouseY - cardY) * ${speed};

  // 计算距离差异 (即“延迟”的程度)
  const dx = mouseX - cardX;
  const dy = mouseY - cardY;

  // 根据差异计算倾斜，距离越远倾斜越大
  // 鼠标在右，卡牌在左，dx 为正，此时应该向右转（绕 Y 轴正向）
  let rotY = dx * ${distanceFactor};
  // 鼠标在下，卡牌在上，dy 为正，此时应该向下转（绕 X 轴负向）
  let rotX = -dy * ${distanceFactor};

  // 限制最大倾斜角
  rotY = gsap.utils.clamp(-${maxTilt}, ${maxTilt}, rotY);
  rotX = gsap.utils.clamp(-${maxTilt}, ${maxTilt}, rotX);

  if (!isHovering && Math.abs(cardX) < 1 && Math.abs(cardY) < 1) {
    cardX = 0;
    cardY = 0;
    rotX = 0;
    rotY = 0;
  }

  gsap.set(card, {
    x: cardX,
    y: cardY,
    rotationX: rotX,
    rotationY: rotY
  });
});`;
  },
  mount(el, { reduceMotion, params, mode } = {}) {
    const p = { ...(demoLagTilt.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const maxTilt = Number(p.maxTilt);
    const speed = Number(p.speed);
    const distanceFactor = Number(p.distanceFactor);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="container w-full h-full flex items-center justify-center p-8 [perspective:900px] overflow-hidden relative touch-none">
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 text-[10px] font-mono uppercase tracking-widest text-outline">
            ${mode === "preview" ? "AUTO DRAG" : "MOVE MOUSE IN BOX"}
          </div>
          <div class="card absolute w-[120px] h-[170px] border border-outline-variant bg-surface shadow-md [transform-style:preserve-3d]">
            <div class="absolute inset-0 border border-outline-variant opacity-50"></div>
            <div class="absolute top-2 left-2 text-[10px] font-mono tracking-widest text-outline">LAG</div>
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div class="w-8 h-8 rounded-full border border-primary/30 flex items-center justify-center">
                <div class="w-1 h-1 bg-primary rounded-full"></div>
              </div>
            </div>
            <div class="absolute bottom-2 right-2 text-[10px] font-mono tracking-widest text-outline">TILT</div>
          </div>
        </div>
      `;

      const container = el.querySelector(".container") as HTMLElement | null;
      const card = el.querySelector(".card") as HTMLElement | null;
      if (!container || !card) return;

      if (reduceMotion) return;

      let mouseX = 0;
      let mouseY = 0;
      let cardX = 0;
      let cardY = 0;
      let isHovering = false;

      const onMove = (e: PointerEvent) => {
        const r = container.getBoundingClientRect();
        mouseX = e.clientX - r.left - r.width / 2;
        mouseY = e.clientY - r.top - r.height / 2;
        
        // 第一次进入时，直接把卡牌位置设过去，避免从0,0飞过来的突兀感
        if (!isHovering) {
          cardX = mouseX;
          cardY = mouseY;
        }
        isHovering = true;
      };

      const onLeave = () => {
        isHovering = false;
        if (mode !== "preview") {
           mouseX = 0;
           mouseY = 0;
        }
        // 这里不使用 gsap.to，而是让 updateCard 里的插值逻辑继续执行
        // 把卡牌自然地插值移动回中心点并恢复平放
      };

      let tl: gsap.core.Timeline | null = null;
      let autoHovering = false;

      if (mode === "preview") {
        // 画廊预览模式：允许用户鼠标移入接管交互
        container.addEventListener("pointermove", onMove);
        container.addEventListener("pointerleave", onLeave);

        // 如果用户不交互，则自动模拟一段轨迹
        autoHovering = true;
        tl = gsap.timeline({ repeat: -1 });
        tl.to({ val: 0 }, {
          duration: 3,
          ease: "none",
          val: 1,
          onUpdate: function() {
            if (isHovering) return; // 用户正在交互，暂停自动轨迹的影响
            autoHovering = true;
            const t = this.progress();
            // 模拟一个 ∞ 字形的轨迹
            mouseX = Math.sin(t * Math.PI * 2) * 100;
            mouseY = Math.sin(t * Math.PI * 4) * 50;
          }
        });
      } else {
        container.addEventListener("pointermove", onMove);
        container.addEventListener("pointerleave", onLeave);
      }

      const updateCard = () => {
        // 如果没有 Hover（包括自动 Hover）并且卡牌已经在中心，就不再执行更新
        if (!isHovering && !autoHovering && cardX === 0 && cardY === 0) return;

        // 差值移动，模拟跟随延迟
        cardX += (mouseX - cardX) * speed;
        cardY += (mouseY - cardY) * speed;

        // 计算当前鼠标位置与卡牌位置的偏差距离
        const dx = mouseX - cardX;
        const dy = mouseY - cardY;

        // 根据偏差距离计算倾斜角度。偏差越大，倾斜越多。
        // X 轴的位移差 (dx) 导致绕 Y 轴的旋转
        let rotY = dx * distanceFactor;
        // Y 轴的位移差 (dy) 导致绕 X 轴的旋转。向下移动时(dy 为正)，卡牌应该向前倾斜(rotX 为负)
        let rotX = -dy * distanceFactor;

        // 限制最大倾斜角，防止翻转过度
        rotY = gsap.utils.clamp(-maxTilt, maxTilt, rotY);
        rotX = gsap.utils.clamp(-maxTilt, maxTilt, rotX);

        // 如果没有在 Hover（也没有自动 Hover），且卡牌已经非常接近原点，则直接归零并停止更新
        if (!isHovering && !autoHovering && Math.abs(cardX) < 1 && Math.abs(cardY) < 1) {
          cardX = 0;
          cardY = 0;
          rotX = 0;
          rotY = 0;
        }

        // 使用 gsap.set 即时更新变换
        gsap.set(card, {
          x: cardX,
          y: cardY,
          rotationX: rotX,
          rotationY: rotY
        });
      };

      gsap.ticker.add(updateCard);

      (container as any).__cleanup = () => {
        container.removeEventListener("pointermove", onMove);
        container.removeEventListener("pointerleave", onLeave);
        gsap.ticker.remove(updateCard);
        tl?.kill();
      };
    }, el);

    return () => {
      const container = el.querySelector(".container") as any;
      container?.__cleanup?.();
      ctx.revert();
    };
  }
};
