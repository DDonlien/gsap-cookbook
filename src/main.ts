import "./styles/fonts.css";

import type { Control, Demo } from "./types";
import { demos } from "./demos";
import { gsap } from "./gsap";
import { getDemoTags } from "./demoTags";

const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

const $grid = document.getElementById("galleryGrid") as HTMLElement | null;
const $modal = document.getElementById("modal") as HTMLElement | null;
const $modalStage = document.getElementById("modalStage") as HTMLElement | null;
const $modalTitle = document.getElementById("modalTitle") as HTMLElement | null;
const $modalSubTitle = document.getElementById("modalSubTitle") as HTMLElement | null;
const $modalCode = document.getElementById("modalCode") as HTMLElement | null;
const $btnCopy = document.getElementById("btnCopy") as HTMLButtonElement | null;
const $btnReplay = document.getElementById("btnReplay") as HTMLButtonElement | null;
const $btnAction = document.getElementById("btnAction") as HTMLButtonElement | null;
const $modalControls = document.getElementById("modalControls") as HTMLElement | null;
const $btnResetParams = document.getElementById("btnResetParams") as HTMLButtonElement | null;
const $tagFilters = document.getElementById("tagFilters") as HTMLElement | null;
const $searchInput = document.getElementById("searchInput") as HTMLInputElement | null;
const $langZh = document.getElementById("langZh") as HTMLButtonElement | null;
const $langEn = document.getElementById("langEn") as HTMLButtonElement | null;

type Lang = "zh" | "en";

const I18N: Record<Lang, Record<string, string>> = {
  zh: {
    searchPlaceholder: "搜索",
    filterPlayback: "播放状态",
    filterType: "表现类型",
    filterTarget: "对象",
    clear: "清空",
    close: "关闭",
    reset: "重置",
    copyCode: "复制代码",
    replay: "重播",
    parameters: "参数",
    resetParams: "重置参数",
    noControls: "无可调参数",
    endText: "END OF COOKBOOK"
  },
  en: {
    searchPlaceholder: "Search",
    filterPlayback: "Playback",
    filterType: "Style",
    filterTarget: "Target",
    clear: "Clear",
    close: "Close",
    reset: "Reset",
    copyCode: "Copy code",
    replay: "Replay",
    parameters: "Parameters",
    resetParams: "Reset params",
    noControls: "No controls",
    endText: "END OF COOKBOOK"
  }
};

type I18nHelp = { zh: string; en: string };

/**
 * 参数说明（双语）
 * - key1: demo.id
 * - key2: control.key
 */
const CONTROL_HELP: Record<string, Record<string, I18nHelp>> = {
  banner_pop: {
    text: {
      zh: "Banner 上显示的文字内容。",
      en: "The text content displayed on the banner."
    },
    duration: {
      zh: "主动画时长（弹出 + 回弹 + 退场整体节奏）。",
      en: "Overall animation duration (pop-in, settle, and exit timing)."
    },
    hold: {
      zh: "弹出完成后停留多久再开始淡出。",
      en: "How long the banner stays before fading out."
    },
    maxScale: {
      zh: "弹出瞬间的最大缩放倍数（越大越“夸张”）。",
      en: "Peak scale during pop-in (larger feels more punchy)."
    },
    tilt: {
      zh: "弹出时的初始倾斜角度（度）。",
      en: "Initial tilt angle in degrees during pop-in."
    }
  },
  block_immovable: {
    intensity: {
      zh: "方块每次震动的最大偏移量（px）。",
      en: "Maximum offset of each vibration in pixels."
    },
    duration: {
      zh: "方块受击抖动的总时长（秒）。",
      en: "Total duration of the hit vibration in seconds."
    },
    flash: {
      zh: "是否在受击瞬间短暂提高亮度以模拟闪白。",
      en: "Whether to briefly increase brightness on hit to simulate a flash."
    }
  },
  block_knockback: {
    clone: {
      zh: "是否复制一个方块去冲刺撞击，否则由本体直接冲刺。",
      en: "Whether to clone the block for dashing, or dash the original body."
    },
    grid: {
      zh: "被撞碎方块切分的网格数量。",
      en: "Number of rows and columns to split the shattered block."
    },
    power: {
      zh: "方块撞碎后碎片向右飞散的力度。",
      en: "Power of the shattered pieces flying out to the right."
    },
    duration: {
      zh: "撞击和飞散动作的整体基础时长。",
      en: "Overall base duration of the dash and shatter action."
    }
  },
  block_melt: {
    duration: {
      zh: "整次多点烧蚀扩散的总时长。",
      en: "Overall duration of the multi-point burn-like dissolve."
    },
    grid: {
      zh: "方块被切成的网格密度；越大越细腻。",
      en: "Grid density used to subdivide the block; higher values look finer."
    },
    seeds: {
      zh: "随机出现的初始溶解点数量。",
      en: "Number of random initial dissolve points."
    },
    spread: {
      zh: "从初始点向外扩散的速度系数；越大扩散越慢、层次越明显。",
      en: "Speed factor for outward spread; larger values make the propagation slower and more layered."
    },
    jitter: {
      zh: "局部随机扰动，避免每次扩散边界过于整齐。",
      en: "Random timing noise to avoid overly uniform dissolve fronts."
    }
  },
  block_shatter: {
    grid: {
      zh: "碎片切分网格数量（越大碎片越多、越小）。",
      en: "Fragment grid size (higher = more/smaller pieces)."
    },
    power: {
      zh: "碎片飞出的基础力度（像素）。",
      en: "Base force for pieces flying out (in pixels)."
    },
    duration: {
      zh: "碎裂飞散的持续时间（秒）。",
      en: "Duration of the shatter explosion in seconds."
    },
    rotate: {
      zh: "碎片飞出时随机旋转的最大角度。",
      en: "Maximum random rotation angle when pieces fly out."
    },
    angle: {
      zh: "受击/爆破的方向。默认 Center 为中心向外炸开；其他方向则碎片朝特定方向飞散。",
      en: "Direction of the hit/explosion. Center means radial explosion; others scatter pieces directionally."
    }
  },
  block_swallow: {
    duration: {
      zh: "吞噬动作整体时长（冲刺 + 咬合 + 回位）。",
      en: "Overall swallow duration (dash, bite, and return)."
    },
    zoom: {
      zh: "咬合瞬间的放大倍数（更像“一口咬下”）。",
      en: "Scale factor during the bite moment (bigger feels more “chomp”)."
    },
    bite: {
      zh: "被吞噬方在消失时的水平“咬偏移”（像被扯走一点）。",
      en: "Horizontal bite offset as the prey vanishes (a slight pull)."
    }
  },
  card_deal_fan: {
    count: {
      zh: "发牌数量（手牌张数）。",
      en: "Number of cards dealt."
    },
    sourceX: {
      zh: "发牌起点 X 偏移（相对最终手牌中心）。",
      en: "Deal origin X offset (relative to final hand center)."
    },
    sourceY: {
      zh: "发牌起点 Y 偏移（相对最终手牌中心）。",
      en: "Deal origin Y offset (relative to final hand center)."
    },
    open: {
      zh: "展开程度（0~1）：0 为收拢，1 为完全展开。",
      en: "Open amount (0–1): 0 closed, 1 fully fanned."
    },
    spread: {
      zh: "扇形展开角度范围（度）。",
      en: "Fan spread angle range (degrees)."
    },
    spacing: {
      zh: "相邻卡牌的水平间距（px）。",
      en: "Horizontal spacing between cards (px)."
    },
    lift: {
      zh: "两侧卡牌的上抬基础高度（形成弧线）。",
      en: "Base lift amount for outer cards (creates an arc)."
    },
    yProfile: {
      zh: "手牌的额外 Y 轴分布形状（如正弦、随机等）。",
      en: "Extra Y-axis profile shape (e.g. sin, random)."
    },
    yAmount: {
      zh: "额外 Y 轴分布的影响幅度（px）。",
      en: "Amplitude for the extra Y profile (px)."
    },
    duration: {
      zh: "发牌移动的时长。",
      en: "Duration for each card to arrive."
    },
    stagger: {
      zh: "发牌的错开间隔（stagger）。",
      en: "Stagger delay between cards."
    },
    ease: {
      zh: "发牌移动的缓动曲线。",
      en: "Easing used for the dealing motion."
    }
  },
  card_flip: {
    trigger: {
      zh: "翻牌触发方式：点击翻 / 悬停翻（离开翻回）。",
      en: "How to trigger: click-to-flip or hover-to-flip (leave to flip back)."
    },
    duration: {
      zh: "翻转动画时长。",
      en: "Flip animation duration."
    },
    tilt: {
      zh: "翻到背面时的额外倾斜角（让 3D 更明显）。",
      en: "Extra tilt angle when flipped to enhance 3D depth."
    },
    ease: {
      zh: "翻转的缓动曲线。",
      en: "Easing curve for the flip."
    }
  },
  card_select: {
    count: {
      zh: "卡牌数量。",
      en: "Number of cards."
    },
    selectMode: {
      zh: "选择模式：单选或多选。",
      en: "Selection mode: single or multi."
    },
    lift: {
      zh: "选中卡牌上浮距离（px）。",
      en: "Lift distance for selected card (px)."
    },
    selectedScale: {
      zh: "选中卡牌的放大倍数。",
      en: "Scale factor for selected card."
    },
    dimOpacity: {
      zh: "有选中时，未选中卡牌的透明度（压暗/弱化）。",
      en: "Opacity for unselected cards when there is an active selection."
    },
    duration: {
      zh: "选中/取消选中的过渡时长。",
      en: "Transition duration when selecting/deselecting."
    }
  },
  drop_shadow: {
    maxTilt: {
      zh: "卡片跟随鼠标的最大倾斜角（度）。",
      en: "Maximum card tilt angle following the pointer (degrees)."
    },
    maxOffset: {
      zh: "阴影的最大偏移距离（px）。",
      en: "Maximum shadow offset distance (px)."
    },
    spread: {
      zh: "阴影“扩散”范围（相当于投影面积）。",
      en: "Shadow spread range (roughly the projected area)."
    },
    blur: {
      zh: "阴影模糊半径（px）。",
      en: "Shadow blur radius (px)."
    },
    opacity: {
      zh: "阴影不透明度（越大越“重”）。",
      en: "Shadow opacity (higher feels heavier)."
    },
    scale: {
      zh: "阴影整体缩放（投影变大/变小）。",
      en: "Overall shadow scale."
    },
    follow: {
      zh: "阴影跟随方向：inverse 更像真实投影，follow 则跟鼠标同向移动。",
      en: "Shadow direction: inverse feels like a projection; follow moves with the pointer."
    },
    exaggeration: {
      zh: "阴影偏移的夸张系数（更“漫画化”的投影）。",
      en: "Exaggeration multiplier for shadow offset (more stylized)."
    },
    duration: {
      zh: "鼠标移动时的跟随“延迟/缓动”时长（越大越顺滑）。",
      en: "Follow smoothing duration (larger feels more floaty/smooth)."
    }
  },
  floating_numbers: {
    duration: {
      zh: "每个飘字从出现到淡出的时长。",
      en: "Lifetime of each floating label."
    },
    rise: {
      zh: "飘字向上的距离（px）。",
      en: "Upward travel distance (px)."
    },
    spreadX: {
      zh: "水平方向的随机散布范围（px）。",
      en: "Horizontal random spread range (px)."
    },
    scale: {
      zh: "飘字初始缩放倍数。",
      en: "Initial scale of the floating label."
    },
    intervalMs: {
      zh: "画廊预览模式下自动生成飘字的间隔（毫秒）。",
      en: "Auto-spawn interval in preview mode (ms)."
    }
  },
  glow_pulse: {
    color: {
      zh: "霓虹光的颜色。",
      en: "Glow color."
    },
    duration: {
      zh: "一次“变亮→变暗”的周期时长（yoyo）。",
      en: "Duration of one brighten→dim pulse cycle (yoyo)."
    },
    blur: {
      zh: "光晕模糊半径（px）。",
      en: "Glow blur radius (px)."
    },
    intensity: {
      zh: "亮度/透明度强度（0~1）。",
      en: "Glow intensity/alpha (0–1)."
    },
    scale: {
      zh: "脉冲时的放大倍数。",
      en: "Scale factor during the pulse."
    }
  },
  grid_wave_effect: {
    scale: {
      zh: "格子缩放幅度（越小越“收缩”）。",
      en: "Cell scale amount (smaller = more shrink)."
    },
    duration: {
      zh: "每个格子缩放的时长。",
      en: "Duration of each cell tween."
    },
    each: {
      zh: "stagger.each：格子之间的启动间隔。",
      en: "stagger.each: delay between starting each cell."
    },
    ease: {
      zh: "缩放动画的缓动。",
      en: "Easing for the scale animation."
    },
    color: {
      zh: "波纹高亮时的格子颜色。",
      en: "Highlighted cell color during the wave."
    }
  },
  hover_tilt: {
    maxTilt: {
      zh: "最大倾斜角（度），决定鼠标移动时的 3D 倾斜强度。",
      en: "Max tilt angle (degrees) controlling 3D tilt strength."
    },
    glow: {
      zh: "高光强度（透明度）。",
      en: "Glow strength (opacity)."
    },
    glowType: {
      zh: "高光类型/方向：同侧角落渐变、对侧角落渐变、或者直接跟随鼠标的聚光灯（spot）。",
      en: "Glow type/direction: same-side corner gradient, opposite corner, or mouse-following spot."
    },
    glowOverflow: {
      zh: "高光溢出处理（是否允许光晕超出卡牌边界）。",
      en: "Glow overflow behavior (clip or visible outside card)."
    },
    duration: {
      zh: "跟随鼠标的缓动时长（越大越“黏”）。",
      en: "Follow smoothing duration (higher feels more “laggy/smooth”)."
    }
  },
  lag_tilt: {
    maxTilt: {
      zh: "最大倾斜角（度）。",
      en: "Max tilt angle (degrees)."
    },
    speed: {
      zh: "跟随速度系数（0~1，越大跟随越紧密，越小延迟越大）。",
      en: "Follow speed factor (0-1, higher = tighter follow, lower = more lag)."
    },
    distanceFactor: {
      zh: "倾斜灵敏度（延迟距离对倾斜角度的影响系数）。",
      en: "Tilt sensitivity (how much the lag distance affects tilt angle)."
    }
  },
  number_add_fx: {
    base: {
      zh: "初始数值。",
      en: "Initial value."
    },
    minAdd: {
      zh: "每次增加的最小值。",
      en: "Minimum add amount per click."
    },
    maxAdd: {
      zh: "每次增加的最大值。",
      en: "Maximum add amount per click."
    },
    rollDuration: {
      zh: "数字滚动到目标值的时长。",
      en: "Duration for the number to roll to the target."
    },
    flash: {
      zh: "是否启用闪烁/高光（0 关闭，>0 开启）。",
      en: "Enable highlight flash (0 off, >0 on)."
    },
    shake: {
      zh: "命中抖动幅度（px）。",
      en: "Shake amplitude (px)."
    },
    shakeDuration: {
      zh: "单次抖动片段的时长（越小抖得越快）。",
      en: "Duration per shake segment (smaller = faster jitter)."
    },
    popScale: {
      zh: "数字放大的峰值倍数（1 为关闭，越大越“弹”）。",
      en: "Peak scale multiplier for the pop effect (1 disables it, higher feels punchier)."
    },
    popDuration: {
      zh: "数字放大并回落的单段时长。",
      en: "Duration of each half of the pop animation (grow and settle back)."
    }
  },
  number_merge: {
    left: {
      zh: "左侧参与合并的数字。",
      en: "Left-side number that participates in the merge."
    },
    right: {
      zh: "右侧参与合并的数字。",
      en: "Right-side number that participates in the merge."
    },
    travel: {
      zh: "左右数字向中间聚合的移动距离。",
      en: "Travel distance as the left and right numbers converge toward the center."
    },
    duration: {
      zh: "整次合并演示的主要时长。",
      en: "Main duration of the merge sequence."
    },
    resultScale: {
      zh: "中间结果数字弹出的峰值放大倍数。",
      en: "Peak scale multiplier for the center result pop."
    },
    glow: {
      zh: "结果数字和乘号的高亮强度。",
      en: "Highlight intensity on the sign and the merged result."
    }
  },
  number_transfer_particles: {
    left: {
      zh: "左侧数字的初始值（粒子从这里出发）。",
      en: "Initial left value (particles originate here)."
    },
    right: {
      zh: "右侧数字的初始值（粒子飞到这里）。",
      en: "Initial right value (particles fly here)."
    },
    amount: {
      zh: "每次转移的数值大小。",
      en: "Transfer amount per action."
    },
    op: {
      zh: "对右侧执行的操作：加（add）或减（sub）。",
      en: "Operation on the right value: add or sub."
    },
    particleCount: {
      zh: "飞行粒子数量（越多越“密集”）。",
      en: "Number of flying particles (more = denser)."
    },
    duration: {
      zh: "粒子飞行时长。",
      en: "Particle flight duration."
    },
    spread: {
      zh: "粒子到达目标附近的散布半径（px）。",
      en: "Spread radius around the destination (px)."
    },
    size: {
      zh: "粒子尺寸（px）。",
      en: "Particle size (px)."
    }
  },
  particle_burst: {
    count: {
      zh: "爆炸粒子数量。",
      en: "Number of burst particles."
    },
    distance: {
      zh: "粒子飞散最大距离（px）。",
      en: "Max travel distance for particles (px)."
    },
    duration: {
      zh: "飞散并淡出的时长。",
      en: "Duration of the burst and fade."
    },
    size: {
      zh: "粒子尺寸（px）。",
      en: "Particle size (px)."
    }
  },
  pk_shake_pack: {
    preset: {
      zh: "预设反馈类型：命中/暴击/闪避/眩晕/重击。",
      en: "Feedback preset: hit/crit/miss/stun/heavy."
    },
    intensity: {
      zh: "抖动强度（px），影响位移/缩放幅度。",
      en: "Shake intensity (px), affects displacement/scale."
    },
    duration: {
      zh: "一次反馈动作的时长。",
      en: "Duration of one feedback animation."
    }
  },
  rarity_shine: {
    duration: {
      zh: "扫光从左到右的周期时长。",
      en: "Duration of one shine sweep."
    },
    angle: {
      zh: "扫光条带的倾斜角度（度）。",
      en: "Shine strip angle (degrees)."
    },
    opacity: {
      zh: "扫光的透明度（强弱）。",
      en: "Shine opacity (strength)."
    }
  },
  scale_pulse_v2: {
    duration: {
      zh: "脉冲周期时长（yoyo）。",
      en: "Pulse duration per cycle (yoyo)."
    },
    ringScale: {
      zh: "外圈的最大缩放倍数。",
      en: "Max scale for the ring."
    },
    dotScale: {
      zh: "中心点的最大缩放倍数。",
      en: "Max scale for the center dot."
    },
    ringEase: {
      zh: "外圈缩放的缓动。",
      en: "Easing for ring scaling."
    },
    dotEase: {
      zh: "中心点缩放的缓动。",
      en: "Easing for dot scaling."
    }
  },
  screen_shake: {
    intensity: {
      zh: "抖动幅度（px）。",
      en: "Shake amplitude (px)."
    },
    shakes: {
      zh: "抖动次数（关键帧段数）。",
      en: "Number of shake steps (keyframe segments)."
    },
    duration: {
      zh: "总时长（会均分到 shakes 段）。",
      en: "Total duration (split across shake steps)."
    }
  },
  scroll_trigger_pin: {
    startPercent: {
      zh: "ScrollTrigger 的 start 位置：元素顶部到达视口某个百分比时触发。",
      en: "ScrollTrigger start: trigger when element top reaches a viewport percentage."
    },
    end: {
      zh: "ScrollTrigger 的 end 距离（+=px）。值越大 pinned 区域越长。",
      en: "ScrollTrigger end distance (+=px). Larger means a longer pinned section."
    },
    scrub: {
      zh: "scrub：滚动与动画的同步强度（0 为即时跳转，>0 为平滑跟随）。",
      en: "scrub: how tightly the animation follows scroll (0 immediate, >0 smoothed)."
    }
  },
  stagger_matrix_01: {
    duration: {
      zh: "每个格子从小到大的动画时长。",
      en: "Tween duration for each cell."
    },
    each: {
      zh: "stagger.each：格子之间的启动间隔。",
      en: "stagger.each: delay between starting each cell."
    },
    ease: {
      zh: "缩放/透明变化的缓动曲线。",
      en: "Easing curve for scale/alpha."
    }
  },
  text_reveal: {
    text: {
      zh: "要展示/揭示的文本内容。",
      en: "Text content to reveal."
    },
    yFrom: {
      zh: "每个字符进入时的起始 Y 偏移（px）。",
      en: "Starting Y offset for each character (px)."
    },
    duration: {
      zh: "每个字符的进入时长。",
      en: "Enter duration per character."
    },
    stagger: {
      zh: "字符之间的错开间隔（stagger）。",
      en: "Stagger delay between characters."
    },
    ease: {
      zh: "字符进入的缓动。",
      en: "Easing for character entrance."
    }
  },
  text_shift_pop: {
    char1: {
      zh: "初始居中的主数字或主文本。",
      en: "Primary number or text that starts centered."
    },
    char2: {
      zh: "播放后出现的辅助内容。用空格分隔符号和数字，例如 x 4。",
      en: "Helper content revealed after the shift. Separate symbol and number with a space, e.g. x 4."
    },
    direction: {
      zh: "辅助内容出现的方向；主数字会向相反方向移动，使最终组合整体居中。",
      en: "Direction where the helper appears; the primary text moves opposite so the final group stays centered."
    },
    gap: {
      zh: "主数字、符号、新数字之间的统一间距（px）。",
      en: "Uniform spacing between the primary number, symbol, and new number (px)."
    },
    shiftDuration: {
      zh: "主数字从初始居中移动到最终组合位置的时长。",
      en: "Duration for the primary text to move from centered to its final grouped position."
    },
    popDuration: {
      zh: "辅助内容从隐藏弹出到正常大小的时长。",
      en: "Duration for the helper content to pop from hidden to normal size."
    },
    shake: {
      zh: "辅助内容弹出后的抖动幅度（px），0 表示关闭。",
      en: "Shake amplitude after the helper pops in (px); 0 disables it."
    }
  },
  timeline_offset_seq: {
    duration: {
      zh: "每根线从一侧移动到另一侧的时长。",
      en: "Duration for each bar to travel."
    },
    overlap: {
      zh: "时间轴叠加量（position 参数 \"<=x\"），越大重叠越多。",
      en: "Timeline overlap amount (position \"<=x\"); larger = more overlap."
    },
    repeatDelay: {
      zh: "每轮播放结束后的停顿时间。",
      en: "Pause between repeats."
    },
    amp1: {
      zh: "bar1 的位移幅度（px）。",
      en: "Travel amplitude for bar1 (px)."
    },
    amp3: {
      zh: "bar3 的位移幅度（px）。",
      en: "Travel amplitude for bar3 (px)."
    },
    ease: {
      zh: "线条移动的缓动。",
      en: "Easing for bar movement."
    }
  }
};

let lang: Lang = (localStorage.getItem("lang") || "").toLowerCase() as Lang;
if (lang !== "zh" && lang !== "en") lang = "zh";

function t(key: string) {
  return I18N[lang]?.[key] ?? I18N.zh[key] ?? key;
}

function getControlHelpText(demoId: string, controlKey: string): string {
  const help = CONTROL_HELP?.[demoId]?.[controlKey];
  if (!help) return "";
  const raw = lang === "en" ? help.en : help.zh;
  return raw || help.zh || help.en || "";
}

function escapeHtml(str: unknown) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function applyI18n() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const k = el.getAttribute("data-i18n");
    if (!k) return;
    el.textContent = t(k);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const k = el.getAttribute("data-i18n-placeholder");
    if (!k) return;
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) el.placeholder = t(k);
  });

  // lang switch active style
  const activeOn = "bg-on-surface";
  const activeText = "text-surface";
  const inactiveOn = "bg-surface";
  const inactiveText = "text-on-surface";
  if ($langZh && $langEn) {
    $langZh.classList.toggle(activeOn, lang === "zh");
    $langZh.classList.toggle(activeText, lang === "zh");
    $langZh.classList.toggle(inactiveOn, lang !== "zh");
    $langZh.classList.toggle(inactiveText, lang !== "zh");

    $langEn.classList.toggle(activeOn, lang === "en");
    $langEn.classList.toggle(activeText, lang === "en");
    $langEn.classList.toggle(inactiveOn, lang !== "en");
    $langEn.classList.toggle(inactiveText, lang !== "en");
  }

  // 根据语言切换字体（字体加载失败会自然回退到系统字体）
  document.body.dataset.lang = lang;
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
}

function setLang(next: Lang) {
  lang = next;
  localStorage.setItem("lang", lang);
  applyI18n();
  closePanel();
  renderTagFilters();
  render();

  // modal 内的 controls/code 也要跟随语言切换（包含参数 tooltip）
  if (modalState.demoId && $modal && !$modal.classList.contains("hidden")) {
    const demo = demos.find((d) => d.id === modalState.demoId);
    if (demo) {
      updateModalCode(demo);
      renderControls(demo);
      if ($btnReplay) $btnReplay.title = t("replay");
    }
  }
}

function setRepoVersion() {
  const $ver = document.getElementById("repoVersion");
  if (!$ver) return;
  // @ts-ignore
  const version = typeof __APP_VERSION__ !== "undefined" ? `v${__APP_VERSION__}` : "v1.0.0";
  $ver.textContent = version;
}

function copyText(text: string) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    return;
  }
  fallbackCopy(text);
}

function fallbackCopy(text: string) {
  const ta = document.createElement("textarea");
  ta.value = text;
  ta.setAttribute("readonly", "true");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  document.body.appendChild(ta);
  ta.select();
  try {
    document.execCommand("copy");
  } finally {
    document.body.removeChild(ta);
  }
}

function getDemoCode(demo: Demo, params: Record<string, unknown>) {
  if (typeof demo.getCode === "function") return demo.getCode(params);
  if (typeof demo.code === "string") return demo.code;
  return "";
}

function highlightCodeHtml(code: string, demo: Demo, params: Record<string, unknown>) {
  let html = escapeHtml(code);
  const controls = demo.controls ?? [];
  for (const c of controls) {
    const raw = params?.[c.key];
    if (raw === undefined || raw === null) continue;
    const needle = escapeHtml(String(raw));
    if (!needle) continue;
    html = html.replaceAll(
      needle,
      `<span class="text-primary font-bold underline underline-offset-2">${needle}</span>`
    );
  }
  return html;
}

// -------- modal state --------
const modalState: { demoId: string | null; params: Record<string, unknown> } = { demoId: null, params: {} };
let modalCleanup: null | (() => void) = null;

const STORAGE_KEY_PARAMS = "demo_params_v1";

function loadSavedParams(demoId: string): Record<string, unknown> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PARAMS);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed[demoId] || {};
  } catch {
    return {};
  }
}

function saveParam(demoId: string, key: string, value: unknown) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PARAMS);
    const parsed = raw ? JSON.parse(raw) : {};
    if (!parsed[demoId]) parsed[demoId] = {};
    parsed[demoId][key] = value;
    localStorage.setItem(STORAGE_KEY_PARAMS, JSON.stringify(parsed));
  } catch (err) {
    console.error("Failed to save params", err);
  }
}

function clearSavedParams(demoId: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PARAMS);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    delete parsed[demoId];
    localStorage.setItem(STORAGE_KEY_PARAMS, JSON.stringify(parsed));
  } catch (err) {
    console.error("Failed to clear params", err);
  }
}

function updateModalCode(demo: Demo) {
  if (!$modalCode || !$btnCopy) return;
  const code = getDemoCode(demo, modalState.params);
  $modalCode.innerHTML = highlightCodeHtml(code, demo, modalState.params);
  $btnCopy.onclick = () => copyText(code);
}

function renderControls(demo: Demo) {
  if (!$modalControls || !$btnResetParams) return;
  const controls = demo.controls ?? [];
  const hasControls = controls.length > 0;
  $modalControls.innerHTML = "";

  $btnResetParams.disabled = !hasControls;
  $btnResetParams.classList.toggle("opacity-40", !hasControls);
  $btnResetParams.classList.toggle("cursor-not-allowed", !hasControls);

  if (!hasControls) {
    $modalControls.innerHTML = `<div class="text-[11px] text-outline font-mono uppercase tracking-widest">${escapeHtml(
      t("noControls")
    )}</div>`;
    return;
  }

  for (const c of controls) {
    const wrap = document.createElement("div");
    wrap.className = "flex flex-col gap-1";

    const id = `ctrl_${demo.id}_${c.key}`;
    const val = modalState.params[c.key] ?? "";
    const helpText = getControlHelpText(demo.id, c.key);
    const labelHtml = helpText
      ? `
        <span class="relative group inline-flex items-center gap-1">
          <span class="underline decoration-dotted underline-offset-4">${escapeHtml(c.label)}</span>
          <span class="material-symbols-outlined text-[14px] opacity-60">help</span>
          <span
            class="pointer-events-none absolute left-0 top-full mt-2 w-72 border-[0.5px] border-outline-variant bg-surface text-on-surface shadow-sm p-3 text-[11px] leading-4 font-mono normal-case tracking-normal opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all z-30"
          >${escapeHtml(helpText)}</span>
        </span>
      `
      : `<span>${escapeHtml(c.label)}</span>`;

    wrap.innerHTML = `
      <label for="${escapeHtml(id)}" class="text-[10px] font-mono uppercase tracking-widest text-outline flex items-center justify-between">
        ${labelHtml}
      </label>
      <div data-input></div>
    `;

    const inputHost = wrap.querySelector("[data-input]") as HTMLElement | null;
    if (!inputHost) continue;

    if (c.type === "select") {
      const select = document.createElement("select");
      select.id = id;
      select.className = "h-9 px-2 border-[0.5px] border-outline-variant bg-surface text-on-surface text-xs font-mono";
      for (const opt of c.options ?? []) {
        const o = document.createElement("option");
        o.value = opt.value;
        o.textContent = opt.label;
        select.appendChild(o);
      }
      select.value = String(val ?? "");
      inputHost.appendChild(select);
      select.addEventListener("input", () => {
        const v = select.value;
        modalState.params[c.key] = v;
        saveParam(demo.id, c.key, v);
        rerenderModal();
      });
    } else if (c.type === "color") {
      const input = document.createElement("input");
      input.id = id;
      input.type = "color";
      input.className = "h-9 w-full";
      input.value = String(val || "#000000");
      inputHost.appendChild(input);
      input.addEventListener("input", () => {
        modalState.params[c.key] = input.value;
        saveParam(demo.id, c.key, input.value);
        rerenderModal();
      });
    } else if (c.type === "text") {
      const input = document.createElement("input");
      input.id = id;
      input.type = "text";
      input.className =
        "h-9 w-full px-2 border-[0.5px] border-outline-variant bg-surface text-on-surface text-xs font-mono";
      input.value = String(val ?? "");
      inputHost.appendChild(input);
      input.addEventListener("input", () => {
        modalState.params[c.key] = input.value;
        saveParam(demo.id, c.key, input.value);
        rerenderModal();
      });
    } else {
      // range/number：slider + number input
      const min = c.min ?? 0;
      const max = c.max ?? 1;
      const step = c.step ?? 0.01;

      const row = document.createElement("div");
      row.className = "flex items-center gap-2";
      inputHost.appendChild(row);

      const slider = document.createElement("input");
      slider.id = `${id}__range`;
      slider.type = "range";
      slider.min = String(min);
      slider.max = String(max);
      slider.step = String(step);
      slider.value = String(val ?? min);
      slider.className = "w-full";
      row.appendChild(slider);

      const number = document.createElement("input");
      number.id = id;
      number.type = "number";
      number.min = String(min);
      number.max = String(max);
      number.step = String(step);
      number.value = String(val ?? min);
      number.className = "h-9 w-24 px-2 border-[0.5px] border-outline-variant bg-surface text-on-surface text-xs font-mono";
      row.appendChild(number);

      const sync = (v: string) => {
        slider.value = v;
        number.value = v;
        const numVal = Number(v);
        modalState.params[c.key] = numVal;
        saveParam(demo.id, c.key, numVal);
        rerenderModal();
      };
      slider.addEventListener("input", () => sync(slider.value));
      number.addEventListener("input", () => sync(number.value));
    }

    $modalControls.appendChild(wrap);
  }
}

function rerenderModal() {
  if (!modalState.demoId || !$modalStage) return;
  const demo = demos.find((d) => d.id === modalState.demoId);
  if (!demo) return;
  updateModalCode(demo);
  modalCleanup?.();
  $modalStage.innerHTML = "";
  modalCleanup = demo.mount($modalStage, { reduceMotion, mode: "modal", params: modalState.params });
}

function openModal(id: string) {
  if (!$modal || !$modalStage || !$modalTitle || !$modalSubTitle) return;
  const demo = demos.find((d) => d.id === id);
  if (!demo) return;

  location.hash = `#${encodeURIComponent(id)}`;
  $modal.classList.remove("hidden");
  $modalTitle.textContent = demo.title;
  $modalSubTitle.textContent = demo.subtitle;

  modalState.demoId = demo.id;
  const savedParams = loadSavedParams(demo.id);
  modalState.params = { ...(demo.defaults ?? {}), ...savedParams };

  updateModalCode(demo);
  renderControls(demo);

  // once 动画支持重播按钮
  if ($btnReplay) {
    const isOnce = getDemoTags(demo.id).playback.includes("once");
    $btnReplay.style.display = isOnce ? "" : "none";
    $btnReplay.title = t("replay");
    $btnReplay.onclick = () => {
      // 重新 mount 即可重播
      rerenderModal();
    };
  }

  // 可选动作按钮（不侵入舞台）
  if ($btnAction) {
    const action = demo.action;
    $btnAction.style.display = action ? "" : "none";
    if (action) {
      const icon = $btnAction.querySelector("[data-icon]") as HTMLElement | null;
      if (icon) icon.textContent = action.icon;
      $btnAction.title = action.label;
      $btnAction.onclick = () => {
        const host = $modalStage as any;
        if (typeof host?.__action === "function") host.__action();
        else rerenderModal();
      };
    } else {
      $btnAction.onclick = null;
    }
  }

  modalCleanup?.();
  $modalStage.innerHTML = "";
  modalCleanup = demo.mount($modalStage, { reduceMotion, mode: "modal", params: modalState.params });
}

function closeModal() {
  if (!$modal || !$modalStage) return;
  modalCleanup?.();
  modalCleanup = null;
  $modalStage.innerHTML = "";
  $modal.classList.add("hidden");
  
  // 更新主界面的 gallery 以便在弹窗关闭后能够使用最新的参数重绘被更改的 demo
  if (modalState.demoId) {
    const cardEl = document.querySelector(`.group[data-demo-id="${modalState.demoId}"]`);
    if (cardEl) {
      const demo = demos.find((d) => d.id === modalState.demoId);
      const stage = cardEl.querySelector("[data-preview]") as HTMLElement | null;
      if (demo && stage) {
        previewCleanup.get(demo.id)?.();
        stage.innerHTML = "";
        try {
          const savedParams = loadSavedParams(demo.id);
          const params = { ...(demo.defaults ?? {}), ...savedParams } as Record<string, unknown>;
          const cleanup = demo.mount(stage, { reduceMotion, mode: "preview", params });
          previewCleanup.set(demo.id, cleanup);
        } catch (err) {
          stage.innerHTML = `<div class="p-4 text-xs text-error font-mono">初始化失败：${escapeHtml(
            (err as Error)?.message ?? String(err)
          )}</div>`;
        }
      }
    }
  }

  modalState.demoId = null;
  modalState.params = {};
  if (location.hash) history.replaceState(null, "", location.pathname + location.search);
}

function bindModalEvents() {
  if (!$modal) return;
  $modal.addEventListener("click", (e) => {
    const closeEl = e.target instanceof Element ? e.target.closest("[data-modal-close]") : null;
    if (closeEl) closeModal();
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$modal.classList.contains("hidden")) closeModal();
  });

  $btnResetParams?.addEventListener("click", () => {
    if (!modalState.demoId) return;
    const demo = demos.find((d) => d.id === modalState.demoId);
    if (!demo) return;
    
    // 恢复为默认参数并清除本地存储
    modalState.params = { ...(demo.defaults ?? {}) };
    clearSavedParams(demo.id);
    
    renderControls(demo);
    rerenderModal();
  });
}

// -------- gallery --------
const previewCleanup = new Map<string, () => void>();

function createCard(demo: Demo) {
  const el = document.createElement("div");
  el.className =
    "group flex flex-col h-[480px] border-b-[0.5px] border-r-[0.5px] border-outline-variant relative bg-surface";
  el.dataset.demoId = demo.id;

  const actionHtml = demo.action
    ? `<button class="ml-3 shrink-0 w-9 h-9 flex items-center justify-center border-[0.5px] border-outline-variant bg-surface text-on-surface hover:bg-primary hover:text-on-primary transition-colors"
         title="${escapeHtml(demo.action.label)}" data-action="action" type="button">
         <span class="material-symbols-outlined text-base">${escapeHtml(demo.action.icon)}</span>
       </button>`
    : "";

  el.innerHTML = `
    <div class="absolute top-4 right-4 flex gap-0 border-[0.5px] border-outline-variant opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-surface">
      <button class="w-10 h-10 flex items-center justify-center border-r-[0.5px] border-outline-variant hover:bg-primary hover:text-surface transition-colors" title="复制代码" data-action="copy">
        <span class="material-symbols-outlined text-sm">content_copy</span>
      </button>
      <button class="w-10 h-10 flex items-center justify-center hover:bg-primary hover:text-surface transition-colors" title="展开" data-action="expand">
        <span class="material-symbols-outlined text-sm">open_in_full</span>
      </button>
    </div>

    <div class="flex-1 relative overflow-hidden bg-surface-container-low flex items-center justify-center">
      <div class="absolute inset-0 opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IiNhZGIzYjAiLz48L3N2Zz4=')]"></div>
      <div class="demo-stage" data-preview></div>
    </div>

    <div class="h-20 border-t-[0.5px] border-outline-variant px-4 py-3 flex items-center justify-between bg-surface group-hover:bg-on-surface group-hover:text-surface transition-colors duration-300">
      <div class="min-w-0">
        <h3 class="text-sm font-bold tracking-tight uppercase truncate">${escapeHtml(demo.title)}</h3>
        <p class="text-[10px] text-outline mt-1 font-mono uppercase tracking-widest group-hover:text-surface-variant truncate">${escapeHtml(
          demo.subtitle
        )}</p>
      </div>
      <div class="flex items-center justify-end">
        ${actionHtml}
        ${
          getDemoTags(demo.id).playback.includes("once")
            ? `<button class="ml-3 shrink-0 w-9 h-9 flex items-center justify-center border-[0.5px] border-outline-variant bg-surface text-on-surface hover:bg-primary hover:text-on-primary transition-colors" title="${escapeHtml(
                t("replay")
              )}" data-action="replay" type="button">
                  <span class="material-symbols-outlined text-base">replay</span>
                </button>`
            : ""
        }
      </div>
    </div>
  `;

  el.addEventListener("click", (e) => {
    const btn = e.target instanceof Element ? e.target.closest("[data-action]") : null;
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    if (action === "copy") {
      const savedParams = loadSavedParams(demo.id);
      const params = { ...(demo.defaults ?? {}), ...savedParams } as Record<string, unknown>;
      copyText(getDemoCode(demo, params));
    }
    if (action === "expand") openModal(demo.id);
    if (action === "action") {
      const stage = el.querySelector("[data-preview]") as any;
      if (typeof stage?.__action === "function") stage.__action();
      else {
        // fallback：重挂载一次
        const host = el.querySelector("[data-preview]") as HTMLElement | null;
        if (!host) return;
        previewCleanup.get(demo.id)?.();
        host.innerHTML = "";
        const savedParams = loadSavedParams(demo.id);
        const params = { ...(demo.defaults ?? {}), ...savedParams } as Record<string, unknown>;
        const cleanup = demo.mount(host, { reduceMotion, mode: "preview", params });
        previewCleanup.set(demo.id, cleanup);
      }
    }
    if (action === "replay") {
      const stage = el.querySelector("[data-preview]") as HTMLElement | null;
      if (!stage) return;
      previewCleanup.get(demo.id)?.();
      stage.innerHTML = "";
      const savedParams = loadSavedParams(demo.id);
      const params = { ...(demo.defaults ?? {}), ...savedParams } as Record<string, unknown>;
      const cleanup = demo.mount(stage, { reduceMotion, mode: "preview", params });
      previewCleanup.set(demo.id, cleanup);
    }
  });

  return el;
}

function renderGallery(list: Demo[]) {
  if (!$grid) return;
  for (const fn of previewCleanup.values()) fn();
  previewCleanup.clear();

  $grid.innerHTML = "";
  for (const demo of list) {
    const card = createCard(demo);
    $grid.appendChild(card);

    const stage = card.querySelector("[data-preview]") as HTMLElement | null;
    if (!stage) continue;
    try {
      const savedParams = loadSavedParams(demo.id);
      const params = { ...(demo.defaults ?? {}), ...savedParams } as Record<string, unknown>;
      const cleanup = demo.mount(stage, { reduceMotion, mode: "preview", params });
      previewCleanup.set(demo.id, cleanup);
    } catch (err) {
      stage.innerHTML = `<div class="p-4 text-xs text-error font-mono">初始化失败：${escapeHtml(
        (err as Error)?.message ?? String(err)
      )}</div>`;
    }
  }
}

// -------- filters --------
const filterState = {
  playback: new Set<string>(),
  type: new Set<string>(),
  target: new Set<string>(),
  related: new Set<string>(),
  q: ""
};

function collectTagOptions() {
  const opts = {
    playback: new Set<string>(),
    type: new Set<string>(),
    target: new Set<string>(),
    related: new Set<string>()
  };
  for (const d of demos) {
    const tags = getDemoTags(d.id);
    tags.playback.forEach((x) => opts.playback.add(x));
    tags.type.forEach((x) => opts.type.add(x));
    tags.target.forEach((x) => opts.target.add(x));
    tags.related.forEach((x) => opts.related.add(x));
  }
  return opts;
}

let activePanel:
  | null
  | {
      key: "playback" | "type" | "target";
      anchor: HTMLElement;
      panel: HTMLElement;
      onClose: () => void;
    } = null;

function closePanel() {
  if (!activePanel) return;
  activePanel.onClose();
  activePanel.panel.remove();
  activePanel = null;
}

function updateTagButtons() {
  if (!$tagFilters) return;
  $tagFilters.querySelectorAll("[data-tag-btn]").forEach((btn) => {
    if (!(btn instanceof HTMLButtonElement)) return;
    const key = btn.dataset.key as "playback" | "type" | "target";
    const activeCount = filterState[key]?.size ?? 0;
    btn.classList.toggle("bg-on-surface", activeCount > 0);
    btn.classList.toggle("text-surface", activeCount > 0);
    btn.classList.toggle("bg-surface", activeCount === 0);
    btn.classList.toggle("text-on-surface", activeCount === 0);
    const countEl = btn.querySelector("[data-count]");
    if (countEl) countEl.textContent = activeCount ? String(activeCount) : "";
  });
}

function openPanel(key: "playback" | "type" | "target", anchor: HTMLElement, values: string[]) {
  closePanel();

  const panel = document.createElement("div");
  panel.className = "fixed z-[9999] w-72 border-[0.5px] border-outline-variant bg-surface shadow-sm";

  const selected = filterState[key];
  panel.innerHTML = `
    <div class="max-h-64 overflow-auto" data-options></div>
    <div class="border-t-[0.5px] border-outline-variant flex">
      <button class="h-10 flex-1 border-r-[0.5px] border-outline-variant hover:bg-surface-container-high transition-colors text-[10px] font-bold tracking-widest uppercase" type="button" data-clear>
        ${escapeHtml(t("clear"))}
      </button>
      <button class="h-10 flex-1 hover:bg-on-surface hover:text-surface transition-colors text-[10px] font-bold tracking-widest uppercase" type="button" data-close>
        ${escapeHtml(t("close"))}
      </button>
    </div>
  `;

  const optionsHost = panel.querySelector("[data-options]") as HTMLElement | null;
  if (optionsHost) {
    for (const v of values) {
      const row = document.createElement("label");
      row.className =
        "flex items-center gap-2 px-3 py-2 border-b-[0.5px] border-outline-variant last:border-b-0 hover:bg-surface-container-high cursor-pointer";
      const checked = selected.has(v);
      row.innerHTML = `
        <input type="checkbox" class="accent-primary" ${checked ? "checked" : ""} />
        <span class="text-xs font-mono">${escapeHtml(v)}</span>
      `;
      const cb = row.querySelector("input") as HTMLInputElement | null;
      cb?.addEventListener("change", () => {
        if (cb.checked) selected.add(v);
        else selected.delete(v);
        updateTagButtons();
        render();
      });
      optionsHost.appendChild(row);
    }
  }

  panel.querySelector("[data-clear]")?.addEventListener("click", () => {
    selected.clear();
    updateTagButtons();
    render();
    panel.querySelectorAll("input[type='checkbox']").forEach((el) => {
      if (el instanceof HTMLInputElement) el.checked = false;
    });
  });
  panel.querySelector("[data-close]")?.addEventListener("click", () => closePanel());

  // position
  const r = anchor.getBoundingClientRect();
  const pad = 4;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = 288; // w-72
  let left = Math.min(r.left, vw - w - pad);
  left = Math.max(pad, left);
  let top = r.bottom;
  if (top + 260 > vh) top = Math.max(pad, r.top - 260);
  panel.style.left = `${left}px`;
  panel.style.top = `${top}px`;

  document.body.appendChild(panel);

  const onDoc = (e: MouseEvent) => {
    const target = e.target as Node | null;
    if (!target) return;
    if (panel.contains(target)) return;
    if (anchor.contains(target)) return;
    closePanel();
  };
  const onEsc = (e: KeyboardEvent) => {
    if (e.key === "Escape") closePanel();
  };
  const onScroll = () => closePanel();

  document.addEventListener("mousedown", onDoc, { capture: true });
  window.addEventListener("keydown", onEsc);
  window.addEventListener("scroll", onScroll, true);
  window.addEventListener("resize", onScroll);

  activePanel = {
    key,
    anchor,
    panel,
    onClose: () => {
      document.removeEventListener("mousedown", onDoc, { capture: true } as any);
      window.removeEventListener("keydown", onEsc);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onScroll);
    }
  };
}

function renderTagFilters() {
  if (!$tagFilters) return;
  const opts = collectTagOptions();
  $tagFilters.innerHTML = "";

  const groups: { key: "playback" | "type" | "target"; label: string; values: string[] }[] = [
    { key: "playback", label: t("filterPlayback"), values: Array.from(opts.playback).sort() },
    { key: "target", label: t("filterTarget"), values: Array.from(opts.target).sort() },
    { key: "type", label: t("filterType"), values: Array.from(opts.type).sort() }
  ];

  for (let i = 0; i < groups.length; i++) {
    const g = groups[i];
    const activeCount = filterState[g.key].size;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.tagBtn = "1";
    btn.dataset.key = g.key;
    btn.className = [
      "h-full",
      "px-4",
      "flex",
      "items-center",
      "justify-between",
      ...(i === groups.length - 1 ? [] : ["border-r-[0.5px]", "border-outline-variant"]),
      "text-xs",
      "font-mono",
      "uppercase",
      "tracking-widest",
      "select-none",
      "cursor-pointer",
      "transition-colors",
      activeCount > 0 ? "bg-on-surface text-surface" : "bg-surface text-on-surface hover:bg-surface-container-high"
    ].join(" ");
    btn.innerHTML = `
      <span class="truncate">${escapeHtml(g.label)}</span>
      <span class="flex items-center gap-2">
        <span class="text-[10px] opacity-70" data-count>${activeCount ? `${activeCount}` : ""}</span>
        <span class="material-symbols-outlined text-base opacity-70">expand_more</span>
      </span>
    `;
    btn.addEventListener("click", () => {
      if (activePanel?.key === g.key) closePanel();
      else openPanel(g.key, btn, g.values);
    });
    $tagFilters.appendChild(btn);
  }
}

function matchTags(demo: Demo) {
  const tags = getDemoTags(demo.id);
  const hit = (key: "playback" | "type" | "target" | "related") => {
    const selected = filterState[key];
    if (selected.size === 0) return true;
    const own = new Set((tags as any)[key] ?? []);
    for (const s of selected) if (own.has(s)) return true;
    return false;
  };
  return hit("playback") && hit("target") && hit("type") && hit("related");
}

function matchSearch(demo: Demo) {
  const q = filterState.q.trim().toLowerCase();
  if (!q) return true;
  const hay = `${demo.id} ${demo.title} ${demo.subtitle}`.toLowerCase();
  return hay.includes(q);
}

function render() {
  const list = demos.filter((d) => matchTags(d) && matchSearch(d));
  renderGallery(list);
}

function bindTopbar() {
  document.getElementById("btnReset")?.addEventListener("click", () => {
    filterState.playback.clear();
    filterState.type.clear();
    filterState.target.clear();
    filterState.related.clear();
    filterState.q = "";
    if ($searchInput) $searchInput.value = "";
    closePanel();
    renderTagFilters();
    render();
  });

  let timer = 0;
  $searchInput?.addEventListener("input", () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      filterState.q = $searchInput.value || "";
      render();
    }, 60);
  });
}

function handleHashRoute() {
  const id = decodeURIComponent((location.hash || "").replace(/^#/, "")).trim();
  if (!id) return;
  if (demos.find((d) => d.id === id)) openModal(id);
}

function init() {
  // make sure module imported & executed
  void gsap;

  setRepoVersion();
  applyI18n();

  $langZh?.addEventListener("click", () => setLang("zh"));
  $langEn?.addEventListener("click", () => setLang("en"));

  bindModalEvents();
  bindTopbar();
  renderTagFilters();
  render();

  handleHashRoute();
  window.addEventListener("hashchange", handleHashRoute);
}

init();
