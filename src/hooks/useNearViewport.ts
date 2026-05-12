import { useEffect, useRef } from "react";

/**
 * Llama `onIntersect` cuando el elemento observado entra en el viewport (u opcionalmente `root`).
 */
export function useNearViewport(
  onIntersect: () => void,
  enabled: boolean,
  options?: { root?: Element | null; rootMargin?: string },
) {
  const ref = useRef<HTMLDivElement | null>(null);
  const onIntersectRef = useRef(onIntersect);
  onIntersectRef.current = onIntersect;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onIntersectRef.current();
      },
      { root: options?.root ?? null, rootMargin: options?.rootMargin ?? "280px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled, options?.root, options?.rootMargin]);

  return ref;
}
