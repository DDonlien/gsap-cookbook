export const demoStaggerMatrix01 = {
  id: "stagger_matrix_01",
  title: "STAGGER_MATRIX_01",
  subtitle: "GRID: [10,10] / EASE: SINE.INOUT",
  tags: { playback: ["loop"], type: ["stagger", "grid"], related: [] },
  defaults: {
    duration: 0.8,
    each: 0.01,
    ease: "sine.inOut"
  },
  controls: [
    { key: "duration", label: "duration", type: "range", min: 0, max: 2, step: 0.05 },
    { key: "each", label: "stagger.each", type: "range", min: 0, max: 0.08, step: 0.005 },
    {
      key: "ease",
      label: "ease",
      type: "select",
      options: [
        { label: "sine.inOut", value: "sine.inOut" },
        { label: "power2.out", value: "power2.out" },
        { label: "power4.inOut", value: "power4.inOut" },
        { label: "none", value: "none" }
      ]
    }
  ],
  getCode(params) {
    return `// STAGGER_MATRIX_01
const stage = document.querySelector(".stage");
stage.innerHTML = \`
  <div class="grid grid-cols-10 grid-rows-10 gap-[2px] w-[80%] aspect-square">
    \${Array.from({length:100}).map(()=>'<div class="cell bg-outline-variant/30"></div>').join("")}
  </div>\`;

const cells = stage.querySelectorAll(".cell");

gsap.fromTo(
  cells,
  { scale: 0.2, autoAlpha: 0.2 },
  {
    scale: 1,
    autoAlpha: 1,
    duration: ${Number(params.duration)},
    ease: "${params.ease}",
    stagger: { each: ${Number(params.each)}, grid: [10, 10], from: "center" },
    repeat: -1,
    yoyo: true
  }
);`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...demoStaggerMatrix01.defaults, ...(params ?? {}) };
    const ctx = window.gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full p-6 flex items-center justify-center">
          <div class="grid grid-cols-10 grid-rows-10 gap-[2px] w-full h-full">
            ${Array.from({ length: 100 })
              .map(() => `<div class="cell bg-outline-variant/30"></div>`)
              .join("")}
          </div>
        </div>
      `;

      const cells = el.querySelectorAll(".cell");
      window.gsap.fromTo(
        cells,
        { scale: 0.2, autoAlpha: 0.2 },
        {
          scale: 1,
          autoAlpha: 1,
          duration: reduceMotion ? 0 : Number(p.duration),
          ease: String(p.ease),
          stagger: { each: Number(p.each), grid: [10, 10], from: "center" },
          repeat: reduceMotion ? 0 : -1,
          yoyo: !reduceMotion
        }
      );
    }, el);

    return () => ctx.revert();
  }
};
