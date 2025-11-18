import { useEffect } from "react";
import { gsap } from "gsap";

type Options = {
  selector?: string;     // children selector relative to container
  y?: number;            // initial Y offset
  opacity?: number;      // initial opacity
  duration?: number;     // animation duration
  ease?: string;         // easing
  stagger?: number;      // delay between children
  delay?: number;        // start delay
};

export function useStaggerIn( containerRef: React.RefObject<HTMLElement>, opts: Options = {}) {
  const {
    selector = ":scope > *",
    y = 12,
    opacity = 0,
    duration = 0.28,
    ease = "power2.out",
    stagger = 0.06,
    delay = 0
  } = opts;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const items = el.querySelectorAll(selector);
    if (!items.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { y, opacity },
        { y: 0, opacity: 1, duration, ease, stagger, delay }
      );
    }, el);

    return () => ctx.revert();
  }, [containerRef, selector, y, opacity, duration, ease, stagger, delay]);
}
