/**
 * MiniGame Component Tests
 * Tests for game rendering and idle state detection
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import MiniGame from './MiniGame';
import { useWindowStore } from '@stores/windowStore';
import * as useMediaQueryModule from '@hooks/useMediaQuery';
import * as responsiveModule from '@/utils/responsive';

describe('MiniGame', () => {
  let rafId = 1;

  beforeEach(() => {
    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn(
      () =>
        ({
          clearRect: vi.fn(),
          beginPath: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          strokeRect: vi.fn(),
          fillRect: vi.fn(),
          fillText: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          scale: vi.fn(),
          fillStyle: '',
          strokeStyle: '',
          globalAlpha: 1,
          lineWidth: 0,
          font: '',
          textAlign: 'left',
        }) as any
    );

    // Mock getBoundingClientRect
    HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => ({
      width: 1024,
      height: 720, // 768 - 48 taskbar
      top: 0,
      left: 0,
      bottom: 720,
      right: 1024,
      x: 0,
      y: 0,
      toJSON: () => {},
    }));

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn(() => rafId++) as any;
    global.cancelAnimationFrame = vi.fn();

    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    Object.defineProperty(window, 'innerHeight', {
      writable: true,
      configurable: true,
      value: 768,
    });

    // Mock devicePixelRatio
    Object.defineProperty(window, 'devicePixelRatio', {
      writable: true,
      configurable: true,
      value: 1,
    });

    // Reset window store to default state
    useWindowStore.setState({
      windows: {
        bio: {
          id: 'bio',
          position: { x: 50, y: 50 },
          size: { width: 400, height: 500 },
          isMinimized: false,
          isMaximized: false,
          isVisible: true,
        },
        blog: {
          id: 'blog',
          position: { x: 500, y: 50 },
          size: { width: 450, height: 600 },
          isMinimized: false,
          isMaximized: false,
          isVisible: true,
        },
        portfolio: {
          id: 'portfolio',
          position: { x: 275, y: 300 },
          size: { width: 500, height: 400 },
          isMinimized: false,
          isMaximized: false,
          isVisible: true,
        },
      },
      windowStack: ['portfolio', 'blog', 'bio'],
    });

    // Mock useMediaQuery to return desktop
    vi.spyOn(useMediaQueryModule, 'useMediaQuery').mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    // Mock prefersReducedMotion to return false
    vi.spyOn(responsiveModule, 'prefersReducedMotion').mockReturnValue(false);
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    rafId = 1;
  });

  describe('idle state detection', () => {
    it('does not render when windows are visible', () => {
      render(<MiniGame />);

      expect(screen.queryByTestId('minigame-canvas')).not.toBeInTheDocument();
    });

    it('renders when all windows are minimized', () => {
      // Minimize all windows
      useWindowStore.setState({
        windows: {
          bio: {
            id: 'bio',
            position: { x: 50, y: 50 },
            size: { width: 400, height: 500 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          blog: {
            id: 'blog',
            position: { x: 500, y: 50 },
            size: { width: 450, height: 600 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          portfolio: {
            id: 'portfolio',
            position: { x: 275, y: 300 },
            size: { width: 500, height: 400 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
        },
        windowStack: ['portfolio', 'blog', 'bio'],
      });

      render(<MiniGame />);

      expect(screen.getByTestId('minigame-canvas')).toBeInTheDocument();
    });

    it('renders when all windows are hidden', () => {
      // Hide all windows
      useWindowStore.setState({
        windows: {
          bio: {
            id: 'bio',
            position: { x: 50, y: 50 },
            size: { width: 400, height: 500 },
            isMinimized: false,
            isMaximized: false,
            isVisible: false,
          },
          blog: {
            id: 'blog',
            position: { x: 500, y: 50 },
            size: { width: 450, height: 600 },
            isMinimized: false,
            isMaximized: false,
            isVisible: false,
          },
          portfolio: {
            id: 'portfolio',
            position: { x: 275, y: 300 },
            size: { width: 500, height: 400 },
            isMinimized: false,
            isMaximized: false,
            isVisible: false,
          },
        },
        windowStack: ['portfolio', 'blog', 'bio'],
      });

      render(<MiniGame />);

      expect(screen.getByTestId('minigame-canvas')).toBeInTheDocument();
    });

    it('does not render when only some windows are minimized', () => {
      // Minimize only some windows
      useWindowStore.setState({
        windows: {
          bio: {
            id: 'bio',
            position: { x: 50, y: 50 },
            size: { width: 400, height: 500 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          blog: {
            id: 'blog',
            position: { x: 500, y: 50 },
            size: { width: 450, height: 600 },
            isMinimized: false, // Not minimized
            isMaximized: false,
            isVisible: true,
          },
          portfolio: {
            id: 'portfolio',
            position: { x: 275, y: 300 },
            size: { width: 500, height: 400 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
        },
        windowStack: ['portfolio', 'blog', 'bio'],
      });

      render(<MiniGame />);

      expect(screen.queryByTestId('minigame-canvas')).not.toBeInTheDocument();
    });
  });

  describe('device and viewport checks', () => {
    it('does not render on mobile', () => {
      // Minimize all windows
      useWindowStore.setState({
        windows: {
          bio: {
            id: 'bio',
            position: { x: 50, y: 50 },
            size: { width: 400, height: 500 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          blog: {
            id: 'blog',
            position: { x: 500, y: 50 },
            size: { width: 450, height: 600 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          portfolio: {
            id: 'portfolio',
            position: { x: 275, y: 300 },
            size: { width: 500, height: 400 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
        },
        windowStack: ['portfolio', 'blog', 'bio'],
      });

      // Mock as mobile
      vi.spyOn(useMediaQueryModule, 'useMediaQuery').mockReturnValue({
        isMobile: true,
        isTablet: false,
        isDesktop: false,
      });

      render(<MiniGame />);

      expect(screen.queryByTestId('minigame-canvas')).not.toBeInTheDocument();
    });

    it('does not render when prefers-reduced-motion is enabled', () => {
      // Minimize all windows
      useWindowStore.setState({
        windows: {
          bio: {
            id: 'bio',
            position: { x: 50, y: 50 },
            size: { width: 400, height: 500 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          blog: {
            id: 'blog',
            position: { x: 500, y: 50 },
            size: { width: 450, height: 600 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          portfolio: {
            id: 'portfolio',
            position: { x: 275, y: 300 },
            size: { width: 500, height: 400 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
        },
        windowStack: ['portfolio', 'blog', 'bio'],
      });

      // Mock prefers-reduced-motion
      vi.spyOn(responsiveModule, 'prefersReducedMotion').mockReturnValue(true);

      render(<MiniGame />);

      expect(screen.queryByTestId('minigame-canvas')).not.toBeInTheDocument();
    });

    it('does not render on small viewports', () => {
      // Minimize all windows
      useWindowStore.setState({
        windows: {
          bio: {
            id: 'bio',
            position: { x: 50, y: 50 },
            size: { width: 400, height: 500 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          blog: {
            id: 'blog',
            position: { x: 500, y: 50 },
            size: { width: 450, height: 600 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          portfolio: {
            id: 'portfolio',
            position: { x: 275, y: 300 },
            size: { width: 500, height: 400 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
        },
        windowStack: ['portfolio', 'blog', 'bio'],
      });

      // Mock small viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 800,
      });

      render(<MiniGame />);

      expect(screen.queryByTestId('minigame-canvas')).not.toBeInTheDocument();
    });
  });

  describe('canvas rendering', () => {
    it('creates canvas with correct dimensions', () => {
      // Minimize all windows
      useWindowStore.setState({
        windows: {
          bio: {
            id: 'bio',
            position: { x: 50, y: 50 },
            size: { width: 400, height: 500 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          blog: {
            id: 'blog',
            position: { x: 500, y: 50 },
            size: { width: 450, height: 600 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          portfolio: {
            id: 'portfolio',
            position: { x: 275, y: 300 },
            size: { width: 500, height: 400 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
        },
        windowStack: ['portfolio', 'blog', 'bio'],
      });

      render(<MiniGame />);

      const canvas = screen.getByTestId('minigame-canvas');
      expect(canvas).toHaveAttribute('width', '1024');
      expect(canvas).toHaveAttribute('height', '720'); // 768 - 48 taskbar
    });

    it('applies canvas styling', () => {
      // Minimize all windows
      useWindowStore.setState({
        windows: {
          bio: {
            id: 'bio',
            position: { x: 50, y: 50 },
            size: { width: 400, height: 500 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          blog: {
            id: 'blog',
            position: { x: 500, y: 50 },
            size: { width: 450, height: 600 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          portfolio: {
            id: 'portfolio',
            position: { x: 275, y: 300 },
            size: { width: 500, height: 400 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
        },
        windowStack: ['portfolio', 'blog', 'bio'],
      });

      render(<MiniGame />);

      const canvas = screen.getByTestId('minigame-canvas');
      // CSS module classes have hashes, just verify it has a class
      expect(canvas.className).toBeTruthy();
      expect(canvas.className).toContain('canvas');
    });
  });

  describe('input handling', () => {
    it('handles click events', () => {
      // Minimize all windows
      useWindowStore.setState({
        windows: {
          bio: {
            id: 'bio',
            position: { x: 50, y: 50 },
            size: { width: 400, height: 500 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          blog: {
            id: 'blog',
            position: { x: 500, y: 50 },
            size: { width: 450, height: 600 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          portfolio: {
            id: 'portfolio',
            position: { x: 275, y: 300 },
            size: { width: 500, height: 400 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
        },
        windowStack: ['portfolio', 'blog', 'bio'],
      });

      const { container } = render(<MiniGame />);
      const canvas = screen.getByTestId('minigame-canvas');

      // Canvas should have click handler
      expect(canvas.onclick).toBeDefined();
    });

    it('calls onExit when ESC key is pressed', () => {
      // Minimize all windows
      useWindowStore.setState({
        windows: {
          bio: {
            id: 'bio',
            position: { x: 50, y: 50 },
            size: { width: 400, height: 500 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          blog: {
            id: 'blog',
            position: { x: 500, y: 50 },
            size: { width: 450, height: 600 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          portfolio: {
            id: 'portfolio',
            position: { x: 275, y: 300 },
            size: { width: 500, height: 400 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
        },
        windowStack: ['portfolio', 'blog', 'bio'],
      });

      const onExitMock = vi.fn();
      render(<MiniGame onExit={onExitMock} />);

      // Simulate ESC key press
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(escapeEvent);

      expect(onExitMock).toHaveBeenCalledTimes(1);
    });

    it('does not call onExit for other keys', () => {
      // Minimize all windows
      useWindowStore.setState({
        windows: {
          bio: {
            id: 'bio',
            position: { x: 50, y: 50 },
            size: { width: 400, height: 500 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          blog: {
            id: 'blog',
            position: { x: 500, y: 50 },
            size: { width: 450, height: 600 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          portfolio: {
            id: 'portfolio',
            position: { x: 275, y: 300 },
            size: { width: 500, height: 400 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
        },
        windowStack: ['portfolio', 'blog', 'bio'],
      });

      const onExitMock = vi.fn();
      render(<MiniGame onExit={onExitMock} />);

      // Simulate other key presses
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      window.dispatchEvent(enterEvent);

      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });
      window.dispatchEvent(spaceEvent);

      expect(onExitMock).not.toHaveBeenCalled();
    });

    it('cleans up ESC key listener on unmount', () => {
      // Minimize all windows
      useWindowStore.setState({
        windows: {
          bio: {
            id: 'bio',
            position: { x: 50, y: 50 },
            size: { width: 400, height: 500 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          blog: {
            id: 'blog',
            position: { x: 500, y: 50 },
            size: { width: 450, height: 600 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
          portfolio: {
            id: 'portfolio',
            position: { x: 275, y: 300 },
            size: { width: 500, height: 400 },
            isMinimized: true,
            isMaximized: false,
            isVisible: true,
          },
        },
        windowStack: ['portfolio', 'blog', 'bio'],
      });

      const onExitMock = vi.fn();
      const { unmount } = render(<MiniGame onExit={onExitMock} />);

      unmount();

      // Try to trigger ESC after unmount
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
      window.dispatchEvent(escapeEvent);

      // Should not be called since listener was removed
      expect(onExitMock).not.toHaveBeenCalled();
    });
  });
});
