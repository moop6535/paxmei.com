/**
 * useGameLoop Hook Tests
 * Tests for game loop state management and handlers
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGameLoop } from './useGameLoop';
import type { GameConfig } from './types';
import * as gameLogic from './gameLogic';

describe('useGameLoop', () => {
  let rafId = 1;
  const mockConfig: GameConfig = {
    canvasWidth: 800,
    canvasHeight: 600,
    maxObjects: 40,
    maxStrikes: 3,
    baseSpawnInterval: 1500,
    minSpawnInterval: 800,
    baseSpeed: 2,
    objectMinSize: 40,
    objectMaxSize: 60,
  };

  beforeEach(() => {
    // Mock requestAnimationFrame - don't call callback to prevent infinite loop
    global.requestAnimationFrame = vi.fn(() => rafId++) as any;
    global.cancelAnimationFrame = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    rafId = 1;
  });

  describe('initialization', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useGameLoop(mockConfig, true));

      expect(result.current.gameState.score).toBe(0);
      expect(result.current.gameState.objects).toEqual([]);
      expect(result.current.gameState.strikes).toBe(0);
      expect(result.current.gameState.gameOver).toBe(false);
      expect(result.current.gameState.isPaused).toBe(false);
      expect(result.current.gameState.lastSpawnTime).toBeGreaterThan(0);
      expect(result.current.gameState.difficultyMultiplier).toBe(1);
    });

    it('provides handleClick function', () => {
      const { result } = renderHook(() => useGameLoop(mockConfig, true));

      expect(typeof result.current.handleClick).toBe('function');
    });

    it('provides handleRestart function', () => {
      const { result } = renderHook(() => useGameLoop(mockConfig, true));

      expect(typeof result.current.handleRestart).toBe('function');
    });
  });

  describe('game loop activation', () => {
    it('starts game loop when isActive is true', () => {
      renderHook(() => useGameLoop(mockConfig, true));

      expect(requestAnimationFrame).toHaveBeenCalled();
    });

    it('does not start game loop when isActive is false', () => {
      renderHook(() => useGameLoop(mockConfig, false));

      expect(requestAnimationFrame).not.toHaveBeenCalled();
    });

    it('cleans up requestAnimationFrame on unmount', () => {
      const { unmount } = renderHook(() => useGameLoop(mockConfig, true));

      unmount();

      expect(cancelAnimationFrame).toHaveBeenCalled();
    });
  });

  describe('handleClick', () => {
    it('increments score when click hits object', () => {
      const { result } = renderHook(() => useGameLoop(mockConfig, false));

      // Manually add an object to state
      act(() => {
        result.current.gameState.objects = [
          {
            id: '1',
            x: 100,
            y: 100,
            width: 50,
            height: 50,
            speed: 2,
            shape: 'rect',
            color: '#ffffff',
          },
        ];
      });

      // Click inside the object
      act(() => {
        result.current.handleClick(120, 120);
      });

      expect(result.current.gameState.score).toBe(1);
      expect(result.current.gameState.objects).toHaveLength(0);
    });

    it('does not change score when click misses', () => {
      const { result } = renderHook(() => useGameLoop(mockConfig, false));

      // Manually add an object to state
      act(() => {
        result.current.gameState.objects = [
          {
            id: '1',
            x: 100,
            y: 100,
            width: 50,
            height: 50,
            speed: 2,
            shape: 'rect',
            color: '#ffffff',
          },
        ];
      });

      // Click outside the object
      act(() => {
        result.current.handleClick(500, 500);
      });

      expect(result.current.gameState.score).toBe(0);
      expect(result.current.gameState.objects).toHaveLength(1);
    });

    it('does not register clicks when game is over', () => {
      const { result } = renderHook(() => useGameLoop(mockConfig, false));

      // Set game over state
      act(() => {
        result.current.gameState.gameOver = true;
        result.current.gameState.objects = [
          {
            id: '1',
            x: 100,
            y: 100,
            width: 50,
            height: 50,
            speed: 2,
            shape: 'rect',
            color: '#ffffff',
          },
        ];
      });

      // Try to click
      act(() => {
        result.current.handleClick(120, 120);
      });

      expect(result.current.gameState.score).toBe(0);
      expect(result.current.gameState.objects).toHaveLength(1);
    });

    it('removes only the clicked object', () => {
      const { result } = renderHook(() => useGameLoop(mockConfig, false));

      // Add multiple objects
      act(() => {
        result.current.gameState.objects = [
          {
            id: '1',
            x: 100,
            y: 100,
            width: 50,
            height: 50,
            speed: 2,
            shape: 'rect',
            color: '#ffffff',
          },
          {
            id: '2',
            x: 200,
            y: 200,
            width: 50,
            height: 50,
            speed: 2,
            shape: 'rect',
            color: '#cccccc',
          },
        ];
      });

      // Click first object
      act(() => {
        result.current.handleClick(120, 120);
      });

      expect(result.current.gameState.score).toBe(1);
      expect(result.current.gameState.objects).toHaveLength(1);
      expect(result.current.gameState.objects[0].id).toBe('2');
    });
  });

  describe('handleRestart', () => {
    it('resets game state to initial values', () => {
      const { result } = renderHook(() => useGameLoop(mockConfig, false));

      // Modify state
      act(() => {
        result.current.gameState.score = 10;
        result.current.gameState.strikes = 2;
        result.current.gameState.gameOver = true;
        result.current.gameState.objects = [
          {
            id: '1',
            x: 100,
            y: 100,
            width: 50,
            height: 50,
            speed: 2,
            shape: 'rect',
            color: '#ffffff',
          },
        ];
      });

      // Restart
      act(() => {
        result.current.handleRestart();
      });

      expect(result.current.gameState.score).toBe(0);
      expect(result.current.gameState.strikes).toBe(0);
      expect(result.current.gameState.gameOver).toBe(false);
      expect(result.current.gameState.objects).toEqual([]);
    });

    it('resets lastSpawnTime', () => {
      const { result } = renderHook(() => useGameLoop(mockConfig, false));

      const originalTime = result.current.gameState.lastSpawnTime;

      // Wait a bit
      vi.useFakeTimers();
      vi.advanceTimersByTime(1000);

      act(() => {
        result.current.handleRestart();
      });

      expect(result.current.gameState.lastSpawnTime).toBeGreaterThanOrEqual(
        originalTime
      );

      vi.useRealTimers();
    });
  });

  describe('game logic integration', () => {
    it('uses gameLogic functions for collision detection', () => {
      const checkClickCollisionSpy = vi.spyOn(
        gameLogic,
        'checkClickCollision'
      );
      const { result } = renderHook(() => useGameLoop(mockConfig, false));

      act(() => {
        result.current.gameState.objects = [
          {
            id: '1',
            x: 100,
            y: 100,
            width: 50,
            height: 50,
            speed: 2,
            shape: 'rect',
            color: '#ffffff',
          },
        ];
      });

      act(() => {
        result.current.handleClick(120, 120);
      });

      expect(checkClickCollisionSpy).toHaveBeenCalledWith(
        120,
        120,
        expect.any(Array)
      );

      checkClickCollisionSpy.mockRestore();
    });
  });

  describe('handler stability', () => {
    it('handleClick maintains reference across renders', () => {
      const { result, rerender } = renderHook(() =>
        useGameLoop(mockConfig, true)
      );

      const firstClickHandler = result.current.handleClick;

      rerender();

      expect(result.current.handleClick).toBe(firstClickHandler);
    });

    it('handleRestart maintains reference across renders', () => {
      const { result, rerender } = renderHook(() =>
        useGameLoop(mockConfig, true)
      );

      const firstRestartHandler = result.current.handleRestart;

      rerender();

      expect(result.current.handleRestart).toBe(firstRestartHandler);
    });
  });
});
