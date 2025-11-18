import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

type Opts = { selector?: string; y?: number; opacity?: number; duration?: number; stagger?: number };

export function useListMotion(containerRef: React.RefObject<HTMLElement>, opts: Opts = {}) {
  const {
    selector = ":scope > *",
    y = 10,
    opacity = 0,
    duration = 0.22,
    stagger = 0.05
  } = opts;

  const played = useRef(false);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el || played.current) return;
    played.current = true;

    const items = el.querySelectorAll(selector);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        items,
        { y, opacity },
        { y: 0, opacity: 1, duration, stagger, ease: "power2.out" }
      );
    }, el);

    return () => ctx.revert();
  }, [containerRef, y, opacity, duration, stagger]);
}
