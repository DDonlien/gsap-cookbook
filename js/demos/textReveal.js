export const demoTextReveal = {
  id: "text_reveal",
  title: "TEXT_REVEAL",
  subtitle: 'TYPE: "CHARS" / STAGGER: 0.03',
  tags: { playback: ["once"], type: ["reveal", "text"], related: ["text"] },
  defaults: {
    yFrom: 20,
    duration: 0.6,
    stagger: 0.03,
    ease: "power3.out",
    text: "GSAP REVEAL"
  },
  controls: [
    { key: "text", label: "text", type: "text" },
    { key: "yFrom", label: "from.y", type: "range", min: -60, max: 60, step: 1 },
    { key: "duration", label: "duration", type: "range", min: 0, max: 2, step: 0.05 },
    { key: "stagger", label: "stagger", type: "range", min: 0, max: 0.2, step: 0.005 },
    {
      key: "ease",
      label: "ease",
      type: "select",
      options: [
        { label: "power3.out", value: "power3.out" },
        { label: "power2.inOut", value: "power2.inOut" },
        { label: "back.out(1.7)", value: "back.out(1.7)" },
        { label: "none", value: "none" }
      ]
    }
  ],
  getCode(params) {
    return `// TEXT_REVEAL（不依赖 SplitText：手动包裹字符）
const stage = document.querySelector(".stage");
const text = "${params.text}";

stage.innerHTML = \`
  <div class="w-full h-full flex items-center justify-center">
    <div class="headline text-3xl font-bold tracking-tight"></div>
  </div>\`;

const headline = stage.querySelector(".headline");
headline.innerHTML = text
  .split("")
  .map((ch) => (ch === " " ? "<span class='inline-block w-3'></span>" : \`<span class="ch inline-block">\${ch}</span>\`))
  .join("");

gsap.fromTo(
  ".ch",
  { y: ${Number(params.yFrom)}, autoAlpha: 0 },
  { y: 0, autoAlpha: 1, duration: ${Number(params.duration)}, ease: "${params.ease}", stagger: ${Number(params.stagger)} }
);`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...demoTextReveal.defaults, ...(params ?? {}) };
    const ctx = window.gsap.context(() => {
      const text = String(p.text ?? "GSAP REVEAL");
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center">
          <div class="headline text-3xl font-bold tracking-tight"></div>
        </div>
      `;
      const headline = /** @type {HTMLElement} */ (el.querySelector(".headline"));
      headline.innerHTML = text
        .split("")
        .map((ch) =>
          ch === " "
            ? "<span class='inline-block w-3'></span>"
            : `<span class="ch inline-block">${ch}</span>`
        )
        .join("");

      if (reduceMotion) return;

      window.gsap.fromTo(
        el.querySelectorAll(".ch"),
        { y: Number(p.yFrom), autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: Number(p.duration),
          ease: String(p.ease),
          stagger: Number(p.stagger)
        }
      );
    }, el);

    return () => ctx.revert();
  }
};
