export const demoTimelineOffsetSeq = {
  id: "timeline_offset_seq",
  title: "TIMELINE_OFFSET_SEQ",
  subtitle: 'POSITION: "<=0.2" / OVERLAP',
  tags: { playback: ["loop"], type: ["timeline"], related: [] },
  defaults: {
    duration: 0.6,
    overlap: 0.2,
    repeatDelay: 0.2,
    amp1: 40,
    amp3: 20,
    ease: "power2.out"
  },
  controls: [
    { key: "duration", label: "duration", type: "range", min: 0, max: 2, step: 0.05 },
    { key: "overlap", label: "overlap(<=)", type: "range", min: 0, max: 0.8, step: 0.05 },
    { key: "repeatDelay", label: "repeatDelay", type: "range", min: 0, max: 1, step: 0.05 },
    { key: "amp1", label: "bar1 amp", type: "range", min: 0, max: 120, step: 1 },
    { key: "amp3", label: "bar3 amp", type: "range", min: 0, max: 120, step: 1 },
    {
      key: "ease",
      label: "ease",
      type: "select",
      options: [
        { label: "power2.out", value: "power2.out" },
        { label: "sine.inOut", value: "sine.inOut" },
        { label: "expo.out", value: "expo.out" },
        { label: "none", value: "none" }
      ]
    }
  ],
  getCode(params) {
    return `// TIMELINE_OFFSET_SEQ（时间轴叠加）
const stage = document.querySelector(".stage");
stage.innerHTML = \`
  <div class="w-full h-full flex items-center justify-center">
    <div class="stack flex flex-col gap-2 w-2/3">
      <div class="bar bar1 h-[2px] bg-on-surface"></div>
      <div class="bar bar2 h-[2px] bg-primary"></div>
      <div class="bar bar3 h-[2px] bg-outline"></div>
    </div>
  </div>\`;

const tl = gsap.timeline({ repeat: -1, repeatDelay: ${Number(params.repeatDelay)} });
tl.fromTo(".bar1", { x: -${Number(params.amp1)} }, { x: ${Number(params.amp1)}, duration: ${Number(
      params.duration
    )}, ease: "${params.ease}" })
  .fromTo(".bar2", { x: ${Number(params.amp1)} }, { x: -${Number(params.amp1)}, duration: ${Number(
      params.duration
    )}, ease: "${params.ease}" }, "<=${Number(params.overlap)}")
  .fromTo(".bar3", { x: -${Number(params.amp3)} }, { x: ${Number(params.amp3)}, duration: ${Number(
      params.duration
    )}, ease: "${params.ease}" }, "<=${Number(params.overlap)}");`;
  },
  mount(el, { reduceMotion, params } = {}) {
    const p = { ...demoTimelineOffsetSeq.defaults, ...(params ?? {}) };
    const ctx = window.gsap.context(() => {
      el.innerHTML = `
        <div class="w-full h-full flex items-center justify-center">
          <div class="stack flex flex-col gap-2 w-2/3">
            <div class="bar bar1 h-[2px] bg-on-surface"></div>
            <div class="bar bar2 h-[2px] bg-primary"></div>
            <div class="bar bar3 h-[2px] bg-outline"></div>
          </div>
        </div>
      `;

      if (reduceMotion) return;

      const tl = window.gsap.timeline({ repeat: -1, repeatDelay: Number(p.repeatDelay) });
      tl.fromTo(
        ".bar1",
        { x: -Number(p.amp1) },
        { x: Number(p.amp1), duration: Number(p.duration), ease: String(p.ease) }
      )
        .fromTo(
          ".bar2",
          { x: Number(p.amp1) },
          { x: -Number(p.amp1), duration: Number(p.duration), ease: String(p.ease) },
          `<=${Number(p.overlap)}`
        )
        .fromTo(
          ".bar3",
          { x: -Number(p.amp3) },
          { x: Number(p.amp3), duration: Number(p.duration), ease: String(p.ease) },
          `<=${Number(p.overlap)}`
        );
    }, el);

    return () => ctx.revert();
  }
};
