import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// 全局只注册一次
gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

