import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDeviceCapabilities } from './useDeviceCapabilities';

describe('useDeviceCapabilities', () => {
  beforeEach(() => {
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: 768,
    });

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    // Mock navigator.maxTouchPoints
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 0,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should detect non-touch device by default', () => {
    // Ensure ontouchstart doesn't exist
    delete (window as any).ontouchstart;

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.hasTouch).toBe(false);
    expect(result.current.isTouchDevice).toBe(false);
  });

  it('should detect touch device when ontouchstart exists', () => {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: {},
    });

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.hasTouch).toBe(true);
  });

  it('should detect touch device when maxTouchPoints > 0', () => {
    Object.defineProperty(navigator, 'maxTouchPoints', {
      writable: true,
      value: 5,
    });

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.hasTouch).toBe(true);
  });

  it('should detect fine pointer (mouse)', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: query === '(pointer: fine)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.hasFinePointer).toBe(true);
    expect(result.current.hasCoarsePointer).toBe(false);
  });

  it('should detect coarse pointer (touch)', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: query === '(pointer: coarse)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.hasCoarsePointer).toBe(true);
    expect(result.current.hasFinePointer).toBe(false);
  });

  it('should return current viewport dimensions', () => {
    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.viewport).toEqual({
      width: 1024,
      height: 768,
    });
  });

  it('should update viewport dimensions on resize', async () => {
    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.viewport.width).toBe(1024);

    // Change window size
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      value: 768,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      value: 1024,
    });

    // Trigger resize event
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    // Wait for debounce
    await new Promise((resolve) => setTimeout(resolve, 200));

    expect(result.current.viewport.width).toBe(768);
    expect(result.current.viewport.height).toBe(1024);
  });

  it('should identify touch device when both touch and coarse pointer are present', () => {
    Object.defineProperty(window, 'ontouchstart', {
      writable: true,
      value: {},
    });

    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn((query: string) => ({
        matches: query === '(pointer: coarse)',
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

    const { result } = renderHook(() => useDeviceCapabilities());

    expect(result.current.isTouchDevice).toBe(true);
    expect(result.current.hasTouch).toBe(true);
    expect(result.current.hasCoarsePointer).toBe(true);
  });
});
