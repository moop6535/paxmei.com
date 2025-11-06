import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Desktop from './Desktop';
import { useWindowStore } from '@stores/windowStore';
import * as useMediaQueryModule from '@hooks/useMediaQuery';
import * as responsiveModule from '@/utils/responsive';

describe('Desktop Component', () => {
  beforeEach(() => {
    // Mock canvas context
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
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
    global.requestAnimationFrame = vi.fn(() => 1) as any;
    global.cancelAnimationFrame = vi.fn();

    // Mock matchMedia for useMediaQuery
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

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

    // Mock useMediaQuery to return desktop
    vi.spyOn(useMediaQueryModule, 'useMediaQuery').mockReturnValue({
      isMobile: false,
      isTablet: false,
      isDesktop: true,
    });

    // Mock prefersReducedMotion
    vi.spyOn(responsiveModule, 'prefersReducedMotion').mockReturnValue(false);
  });

  it('renders children correctly', () => {
    render(
      <Desktop>
        <div>Test Content</div>
      </Desktop>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders canvas element', () => {
    const { container } = render(
      <Desktop>
        <div>Test</div>
      </Desktop>
    );

    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();
  });

  it('has correct structure', () => {
    const { container } = render(
      <Desktop>
        <div>Test</div>
      </Desktop>
    );

    // Check for desktop container
    const desktop = container.firstChild;
    expect(desktop).toBeInTheDocument();

    // Check for canvas
    const canvas = container.querySelector('canvas');
    expect(canvas).toBeInTheDocument();

    // Check for content wrapper
    const content = screen.getByText('Test').parentElement;
    expect(content).toBeInTheDocument();
  });

  it('renders multiple children', () => {
    render(
      <Desktop>
        <div>Child 1</div>
        <div>Child 2</div>
        <div>Child 3</div>
      </Desktop>
    );

    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
    expect(screen.getByText('Child 3')).toBeInTheDocument();
  });

  describe('MiniGame Integration', () => {

    it('integrates MiniGame component', () => {
      // Minimize all windows to trigger game
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

      render(
        <Desktop>
          <div>Test Content</div>
        </Desktop>
      );

      // Game canvas should be present
      const gameCanvas = screen.queryByTestId('minigame-canvas');
      expect(gameCanvas).toBeInTheDocument();
    });

    it('does not show game when windows are visible', () => {
      // Keep windows visible
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

      render(
        <Desktop>
          <div>Test Content</div>
        </Desktop>
      );

      // Game should not be present
      const gameCanvas = screen.queryByTestId('minigame-canvas');
      expect(gameCanvas).not.toBeInTheDocument();
    });
  });
});
