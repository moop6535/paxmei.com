import { useState, useEffect } from 'react';

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

interface MediaQueryResult {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: Breakpoint;
}

const BREAKPOINTS = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
} as const;

export const useMediaQuery = (): MediaQueryResult => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    // Server-side rendering or initial render fallback
    if (typeof window === 'undefined') {
      return 'desktop';
    }

    // Initial breakpoint detection
    if (window.matchMedia(BREAKPOINTS.mobile).matches) return 'mobile';
    if (window.matchMedia(BREAKPOINTS.tablet).matches) return 'tablet';
    return 'desktop';
  });

  useEffect(() => {
    // Create media query lists
    const mobileQuery = window.matchMedia(BREAKPOINTS.mobile);
    const tabletQuery = window.matchMedia(BREAKPOINTS.tablet);
    const desktopQuery = window.matchMedia(BREAKPOINTS.desktop);

    // Handler to update breakpoint
    const updateBreakpoint = () => {
      if (mobileQuery.matches) {
        setBreakpoint('mobile');
      } else if (tabletQuery.matches) {
        setBreakpoint('tablet');
      } else if (desktopQuery.matches) {
        setBreakpoint('desktop');
      }
    };

    // Add listeners
    mobileQuery.addEventListener('change', updateBreakpoint);
    tabletQuery.addEventListener('change', updateBreakpoint);
    desktopQuery.addEventListener('change', updateBreakpoint);

    // Initial check
    updateBreakpoint();

    // Cleanup
    return () => {
      mobileQuery.removeEventListener('change', updateBreakpoint);
      tabletQuery.removeEventListener('change', updateBreakpoint);
      desktopQuery.removeEventListener('change', updateBreakpoint);
    };
  }, []);

  return {
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    breakpoint,
  };
};
