import { useEffect, useState, type RefObject } from 'react';

/** True while the element is in (or near) the viewport. Starts true so nothing renders blank. */
export function useIsOnScreen(target: RefObject<Element | null>, rootMargin = '200px'): boolean {
  const [isOnScreen, setIsOnScreen] = useState(true);

  useEffect(() => {
    const element = target.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsOnScreen(entry?.isIntersecting ?? true),
      { rootMargin },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [target, rootMargin]);

  return isOnScreen;
}
