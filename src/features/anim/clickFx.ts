import { gsap } from "gsap";
export function tap(el: HTMLElement) {
  gsap.fromTo(el, { scale: 1 }, { scale: 0.96, duration: 0.08, yoyo: true, repeat: 1, ease: "power1.out" });
}
