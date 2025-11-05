import { useState, useEffect } from 'react';

export interface DeviceCapabilities {
  hasTouch: boolean;
  hasFinePointer: boolean;
  hasCoarsePointer: boolean;
  viewport: {
    width: number;
    height: number;
  };
  isTouchDevice: boolean;
}

export const useDeviceCapabilities = (): DeviceCapabilities => {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>(() => {
    // Server-side rendering or initial render fallback
    if (typeof window === 'undefined') {
      return {
        hasTouch: false,
        hasFinePointer: true,
        hasCoarsePointer: false,
        viewport: { width: 1024, height: 768 },
        isTouchDevice: false,
      };
    }

    // Initial capability detection
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
    const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

    return {
      hasTouch,
      hasFinePointer,
      hasCoarsePointer,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      isTouchDevice: hasTouch && hasCoarsePointer,
    };
  });

  useEffect(() => {
    // Update viewport dimensions on resize
    let timeoutId: number;

    const updateViewport = () => {
      // Debounce resize events
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setCapabilities((prev) => ({
          ...prev,
          viewport: {
            width: window.innerWidth,
            height: window.innerHeight,
          },
        }));
      }, 150);
    };

    window.addEventListener('resize', updateViewport);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  return capabilities;
};
