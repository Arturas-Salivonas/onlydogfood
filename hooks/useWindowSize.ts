import { useState, useEffect } from 'react';

export interface WindowSize {
  width: number;
  height: number;
}

export function useWindowSize(): WindowSize {
  const [windowSize, setWindowSize] = useState<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

// Common breakpoint utilities
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export function useBreakpoint(breakpoint: keyof typeof breakpoints): boolean {
  const { width } = useWindowSize();
  return width >= breakpoints[breakpoint];
}

export function useIsMobile(): boolean {
  return useBreakpoint('md') === false;
}

export function useIsTablet(): boolean {
  const { width } = useWindowSize();
  return width >= breakpoints.sm && width < breakpoints.lg;
}

export function useIsDesktop(): boolean {
  return useBreakpoint('lg');
}