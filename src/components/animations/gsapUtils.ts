// Lightweight, dynamic GSAP helper so the project doesn't crash if GSAP isn't installed.
// If GSAP is available, these helpers will import it dynamically and run simple animations.

export async function animateIn(el: HTMLElement | null) {
  if (!el) return;
  try {
    const gsapMod = await import('gsap');
    const gsap = (gsapMod as any).gsap || gsapMod;
    gsap.fromTo(
      el,
      { autoAlpha: 0, y: 6 },
      { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power2.out' }
    );
  } catch (e) {
    // GSAP not installed — silently no-op to keep the app working.
  }
}

export async function animateOut(el: HTMLElement | null) {
  if (!el) return;
  try {
    const gsapMod = await import('gsap');
    const gsap = (gsapMod as any).gsap || gsapMod;
    gsap.to(el, { autoAlpha: 0, y: 6, duration: 0.35, ease: 'power2.in' });
  } catch (e) {
    // no-op
  }
}

export default { animateIn, animateOut };
