import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useParticles } from './useParticles';

describe('useParticles', () => {
  let rafId = 1;

  beforeEach(() => {
    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      scale: vi.fn(),
      fillStyle: '',
    })) as any;

    // Mock getBoundingClientRect
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1024,
      height: 768,
      top: 0,
      left: 0,
      bottom: 768,
      right: 1024,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    // Mock requestAnimationFrame - don't call callback to prevent infinite loop
    global.requestAnimationFrame = vi.fn(() => rafId++) as any;
    global.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    rafId = 1;
  });

  it('returns a canvas ref', () => {
    const { result } = renderHook(() => useParticles());
    expect(result.current).toBeDefined();
    expect(result.current.current).toBeNull(); // Not attached to DOM in test
  });

  it('initializes with default options', () => {
    const { result } = renderHook(() => useParticles());
    expect(result.current).toBeDefined();
  });

  it('accepts custom particle count', () => {
    const { result } = renderHook(() =>
      useParticles({ particleCount: 50 })
    );
    expect(result.current).toBeDefined();
  });

  it('accepts custom particle size', () => {
    const { result } = renderHook(() =>
      useParticles({ particleSize: 5 })
    );
    expect(result.current).toBeDefined();
  });

  it('accepts custom particle speed', () => {
    const { result } = renderHook(() =>
      useParticles({ particleSpeed: 1.0 })
    );
    expect(result.current).toBeDefined();
  });

  it('accepts custom particle color', () => {
    const { result } = renderHook(() =>
      useParticles({ particleColor: '#00ffff' })
    );
    expect(result.current).toBeDefined();
  });

  it('cleans up on unmount without errors', () => {
    const { unmount } = renderHook(() => useParticles());
    expect(() => unmount()).not.toThrow();
  });
});
