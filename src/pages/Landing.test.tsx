import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Landing from './Landing';

describe('Landing Page', () => {
  beforeEach(() => {
    // Mock canvas for Desktop component
    HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      scale: vi.fn(),
      fillStyle: '',
    })) as any;

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

    global.requestAnimationFrame = vi.fn(() => 1) as any;
    global.cancelAnimationFrame = vi.fn();
  });

  it('renders without crashing', () => {
    render(<Landing />);
    // Check for Bio window title
    expect(screen.getByText('Bio')).toBeInTheDocument();
  });

  it('displays three main windows', () => {
    render(<Landing />);
    expect(screen.getByText('Bio')).toBeInTheDocument();
    expect(screen.getByText('Blog')).toBeInTheDocument();
    expect(screen.getByText('Portfolio')).toBeInTheDocument();
  });

  it('displays bio content', () => {
    render(<Landing />);
    expect(screen.getByText('Pax Mei')).toBeInTheDocument();
    expect(screen.getByText('Developer & Writer')).toBeInTheDocument();
  });

  it('displays blog posts', () => {
    render(<Landing />);
    expect(screen.getByText('Recent Posts')).toBeInTheDocument();
    expect(screen.getByText('Welcome to paxmei.com')).toBeInTheDocument();
  });

  it('displays portfolio projects', () => {
    render(<Landing />);
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('paxmei.com')).toBeInTheDocument();
  });
});
