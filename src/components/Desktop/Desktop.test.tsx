import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Desktop from './Desktop';

describe('Desktop Component', () => {
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
    global.requestAnimationFrame = vi.fn(() => 1) as any;
    global.cancelAnimationFrame = vi.fn();
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
});
