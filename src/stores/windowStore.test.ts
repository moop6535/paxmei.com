import { describe, it, expect, beforeEach } from 'vitest';
import { useWindowStore } from './windowStore';

describe('windowStore', () => {
  beforeEach(() => {
    // Reset store to initial state
    useWindowStore.setState({
      windows: {
        bio: {
          id: 'bio',
          position: { x: 50, y: 50 },
          size: { width: 400, height: 500 },
          isMinimized: false,
          isVisible: true,
        },
        blog: {
          id: 'blog',
          position: { x: 500, y: 50 },
          size: { width: 450, height: 600 },
          isMinimized: false,
          isVisible: true,
        },
        portfolio: {
          id: 'portfolio',
          position: { x: 275, y: 300 },
          size: { width: 500, height: 400 },
          isMinimized: false,
          isVisible: true,
        },
      },
      windowStack: ['portfolio', 'blog', 'bio'],
    });
  });

  it('has initial windows', () => {
    const windows = useWindowStore.getState().windows;
    expect(Object.keys(windows)).toHaveLength(3);
    expect(windows.bio).toBeDefined();
    expect(windows.blog).toBeDefined();
    expect(windows.portfolio).toBeDefined();
  });

  it('brings window to front', () => {
    const { bringToFront, windowStack: getStack } = useWindowStore.getState();

    bringToFront('portfolio');
    const stack = useWindowStore.getState().windowStack;

    expect(stack[stack.length - 1]).toBe('portfolio');
  });

  it('toggles minimize state', () => {
    const { toggleMinimize } = useWindowStore.getState();

    toggleMinimize('bio');
    let bioWindow = useWindowStore.getState().windows.bio;
    expect(bioWindow.isMinimized).toBe(true);

    toggleMinimize('bio');
    bioWindow = useWindowStore.getState().windows.bio;
    expect(bioWindow.isMinimized).toBe(false);
  });

  it('closes window', () => {
    const { closeWindow } = useWindowStore.getState();

    closeWindow('bio');
    const bioWindow = useWindowStore.getState().windows.bio;
    const stack = useWindowStore.getState().windowStack;

    expect(bioWindow.isVisible).toBe(false);
    expect(stack).not.toContain('bio');
  });

  it('opens existing window', () => {
    const { closeWindow, openWindow } = useWindowStore.getState();

    // Close window first
    closeWindow('bio');
    expect(useWindowStore.getState().windows.bio.isVisible).toBe(false);

    // Open it again
    openWindow('bio', { x: 100, y: 100 }, { width: 400, height: 500 });
    const bioWindow = useWindowStore.getState().windows.bio;
    const stack = useWindowStore.getState().windowStack;

    expect(bioWindow.isVisible).toBe(true);
    expect(bioWindow.isMinimized).toBe(false);
    expect(stack).toContain('bio');
    expect(stack[stack.length - 1]).toBe('bio');
  });

  it('opens new window', () => {
    const { openWindow } = useWindowStore.getState();

    openWindow('newWindow', { x: 200, y: 200 }, { width: 300, height: 400 });
    const windows = useWindowStore.getState().windows;
    const stack = useWindowStore.getState().windowStack;

    expect(windows.newWindow).toBeDefined();
    expect(windows.newWindow.isVisible).toBe(true);
    expect(stack).toContain('newWindow');
  });

  it('updates window position', () => {
    const { updatePosition } = useWindowStore.getState();

    updatePosition('bio', { x: 150, y: 250 });
    const bioWindow = useWindowStore.getState().windows.bio;

    expect(bioWindow.position.x).toBe(150);
    expect(bioWindow.position.y).toBe(250);
  });

  it('calculates z-index correctly', () => {
    const { getZIndex } = useWindowStore.getState();

    const portfolioZ = getZIndex('portfolio');
    const blogZ = getZIndex('blog');
    const bioZ = getZIndex('bio');

    expect(bioZ).toBeGreaterThan(blogZ);
    expect(blogZ).toBeGreaterThan(portfolioZ);
  });
});
