import { useEffect, useRef, useState } from 'react';

export interface IntersectionOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: IntersectionOptions = {}
): [React.RefObject<Element | null>, IntersectionObserverEntry | null] {
  const {
    threshold = 0,
    root = null,
    rootMargin = '0%',
    freezeOnceVisible = false,
  } = options;

  const elementRef = useRef<Element>(null);
  const [entry, setEntry] = useState<IntersectionObserverEntry | null>(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  const updateEntry = ([entry]: IntersectionObserverEntry[]): void => {
    setEntry(entry);
  };

  useEffect(() => {
    const node = elementRef?.current;
    const hasIOSupport = !!window.IntersectionObserver;

    if (!hasIOSupport || frozen || !node) {
      return;
    }

    const observerParams = { threshold, root, rootMargin };
    const observer = new IntersectionObserver(updateEntry, observerParams);

    observer.observe(node);

    return () => observer.disconnect();
  }, [elementRef, JSON.stringify(threshold), root, rootMargin, frozen]);

  return [elementRef, entry];
}

// Hook for lazy loading images
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [imageRef, entry] = useIntersectionObserver({
    threshold: 0.1,
    freezeOnceVisible: true,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      setImageSrc(src);
    }
  }, [entry?.isIntersecting, src]);

  return { imageSrc, imageRef };
}

// Hook for infinite scroll
export function useInfiniteScroll(
  callback: () => void,
  hasNextPage: boolean,
  isLoading: boolean = false
) {
  const [sentinelRef, entry] = useIntersectionObserver({
    threshold: 0.1,
  });

  useEffect(() => {
    if (entry?.isIntersecting && hasNextPage && !isLoading) {
      callback();
    }
  }, [entry?.isIntersecting, hasNextPage, isLoading, callback]);

  return sentinelRef;
}