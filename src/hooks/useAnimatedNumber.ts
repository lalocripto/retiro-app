import { useEffect, useRef, useState } from 'react';

export function useAnimatedNumber(target: number, durationMs = 450): number {
  const [display, setDisplay] = useState<number>(target);
  const fromRef = useRef<number>(target);
  const startRef = useRef<number>(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!Number.isFinite(target)) {
      setDisplay(target);
      return;
    }
    fromRef.current = display;
    startRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startRef.current;
      const t = Math.min(1, elapsed / durationMs);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - t, 3);
      const next = fromRef.current + (target - fromRef.current) * eased;
      setDisplay(next);
      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target, durationMs]);

  return display;
}
