import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMediaQuery } from './useMediaQuery';

describe('useMediaQuery', () => {
  let matchMediaMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock window.matchMedia
    matchMediaMock = vi.fn((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: matchMediaMock,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return desktop breakpoint by default', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(min-width: 1024px)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.breakpoint).toBe('desktop');
  });

  it('should return mobile breakpoint when viewport is < 768px', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(max-width: 767px)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe('mobile');
  });

  it('should return tablet breakpoint when viewport is 768-1023px', () => {
    matchMediaMock.mockImplementation((query: string) => ({
      matches: query === '(min-width: 768px) and (max-width: 1023px)',
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    const { result } = renderHook(() => useMediaQuery());

    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.breakpoint).toBe('tablet');
  });

  it('should register event listeners for all breakpoints', () => {
    const addEventListenerMock = vi.fn();

    matchMediaMock.mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    renderHook(() => useMediaQuery());

    // Should register listeners for mobile, tablet, and desktop
    expect(addEventListenerMock).toHaveBeenCalledTimes(3);
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should cleanup event listeners on unmount', () => {
    const removeEventListenerMock = vi.fn();

    matchMediaMock.mockImplementation(() => ({
      matches: false,
      media: '',
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerMock,
      dispatchEvent: vi.fn(),
    }));

    const { unmount } = renderHook(() => useMediaQuery());
    unmount();

    // Should remove listeners for mobile, tablet, and desktop
    expect(removeEventListenerMock).toHaveBeenCalledTimes(3);
    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
