/**
 * Responsive utility functions for viewport and device detection
 */

export const BREAKPOINTS = {
  mobile: 767,
  tablet: 1023,
} as const;

/**
 * Check if current viewport is mobile size (< 768px)
 */
export const isMobileViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth <= BREAKPOINTS.mobile;
};

/**
 * Check if current viewport is tablet size (768px - 1023px)
 */
export const isTabletViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 768 && window.innerWidth <= BREAKPOINTS.tablet;
};

/**
 * Check if current viewport is desktop size (>= 1024px)
 */
export const isDesktopViewport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.innerWidth >= 1024;
};

/**
 * Check if device has touch support
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

/**
 * Check if device has a coarse pointer (touch)
 */
export const hasCoarsePointer = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: coarse)').matches;
};

/**
 * Check if device has a fine pointer (mouse/trackpad)
 */
export const hasFinePointer = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(pointer: fine)').matches;
};

/**
 * Get current viewport dimensions
 */
export const getViewportDimensions = (): { width: number; height: number } => {
  if (typeof window === 'undefined') {
    return { width: 1024, height: 768 };
  }
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/**
 * Get current breakpoint as string
 */
export const getCurrentBreakpoint = (): 'mobile' | 'tablet' | 'desktop' => {
  if (isMobileViewport()) return 'mobile';
  if (isTabletViewport()) return 'tablet';
  return 'desktop';
};

/**
 * Check if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};
