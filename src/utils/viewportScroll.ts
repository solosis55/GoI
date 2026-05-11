/** Scroll vertical del viewport (documento). Útil tras mutar listas largas sin saltos. */
export function readViewportScrollY(): number {
  if (typeof window === "undefined") return 0;
  return window.scrollY ?? document.documentElement.scrollTop ?? 0;
}

export function writeViewportScrollY(y: number): void {
  if (typeof window === "undefined") return;
  window.scrollTo(0, Math.max(0, y));
}
