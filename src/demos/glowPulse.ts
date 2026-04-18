import type { Demo } from "../types";
import { gsap } from "../gsap";

export const demoGlowPulse: Demo = {
  id: "glow_pulse",
  title: "GLOW_PULSE",
  subtitle: "NEON / LOOP",
  tags: { playback: ["loop"], type: ["card", "ui"], related: [] },
  defaults: {
    color: "#1049f1",
    duration: 1.3,
    blur: 18,
    intensity: 0.8,
    scale: 1.01
  },
  controls: [
    { key: "color", label: "color", type: "color" },
    { key: "duration", label: "duration", type: "range", min: 0.4, max: 4, step: 0.1 },
    { key: "blur", label: "blur(px)", type: "range", min: 0, max: 40, step: 1 },
    { key: "intensity", label: "intensity", type: "range", min: 0, max: 1, step: 0.05 },
    { key: "scale", label: "scale", type: "range", min: 1, max: 1.2, step: 0.01 }
  ],
  getCode(params) {
    const color = String(params.color);
    const duration = Number(params.duration);
    const blur = Number(params.blur);
    const intensity = Number(params.intensity);
    const scale = Number(params.scale);
    return `// GLOW_PULSE（霓虹描边脉冲）
const card = document.querySelector(".card");
const color = "${color}";

const hexToRgba = (hex, a) => {
  const h = hex.replace("#", "");
  const v = (h.length === 3) ? h.split("").map(c => c + c).join("") : h.padEnd(6, "0").slice(0, 6);
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return \`rgba(\${r},\${g},\${b},\${Math.max(0, Math.min(1, a))})\`;
};

gsap.to(card, {
  boxShadow: \`0 0 ${blur}px \${hexToRgba(color, ${intensity})}, 0 0 ${Math.round(blur * 1.7)}px \${hexToRgba(color, ${
      intensity * 0.55
    })}\`,
  scale: ${scale},
  duration: ${duration} / 2,
  yoyo: true,
  repeat: -1,
  ease: "sine.inOut"
});`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...(demoGlowPulse.defaults ?? {}), ...(params ?? {}) } as Record<string, unknown>;
    const color = String(p.color);
    const duration = Number(p.duration);
    const blur = Number(p.blur);
    const intensity = Number(p.intensity);
    const scale = Number(p.scale);

    const ctx = gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center p-8">
          <div class="card relative w-[190px] h-[250px] border border-outline-variant bg-surface shadow-sm overflow-hidden">
            <div class="absolute inset-0 opacity-15 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNhZGIzYjAiLz48L3N2Zz4=')]"></div>
            <div class="absolute top-2 left-2 text-[10px] font-mono tracking-widest text-outline">NEON</div>
            <div class="absolute inset-0 flex items-center justify-center">
              <div class="text-4xl font-black tracking-tight">★</div>
            </div>
            <div class="glow absolute inset-0 pointer-events-none" style="box-shadow: inset 0 0 0 1px rgba(16,73,241,0.4)"></div>
          </div>
        </div>
      `;

      const card = el.querySelector(".card") as HTMLElement | null;
      const glow = el.querySelector(".glow") as HTMLElement | null;
      if (!card || !glow) return;

      // 初始（低亮）
      const low = `0 0 ${Math.max(0, blur * 0.45)}px ${hexToRgba(color, intensity * 0.25)}`;
      const high = `0 0 ${blur}px ${hexToRgba(color, intensity)}, 0 0 ${Math.round(
        blur * 1.7
      )}px ${hexToRgba(color, intensity * 0.55)}`;

      gsap.set(card, { boxShadow: low, scale: 1 });
      gsap.set(glow, { boxShadow: `inset 0 0 0 1px ${hexToRgba(color, 0.55)}` });

      if (reduceMotion) {
        gsap.set(card, { boxShadow: high, scale });
        return;
      }

      gsap.to(card, {
        boxShadow: high,
        scale,
        duration: duration / 2,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
    }, el);

    return () => ctx.revert();
  }
};

function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "").trim();
  const v = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.padEnd(6, "0").slice(0, 6);
  const n = parseInt(v, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
}
